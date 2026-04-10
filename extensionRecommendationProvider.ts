import * as vscode from 'vscode';
import { P2PCollaborationProvider, Message, Peer } from './p2pProvider';

export interface ExtensionInfo {
    id: string;
    name: string;
    publisher: string;
    version: string;
    description?: string;
    category?: string;
    installed: boolean;
    peersUsing: string[];
    peerCount: number;
    priority: 'high' | 'medium' | 'low';
}

export class ExtensionRecommendationProvider implements vscode.Disposable {
    private myExtensions: Map<string, ExtensionInfo> = new Map();
    private peerExtensions: Map<string, Map<string, ExtensionInfo>> = new Map();
    private recommendations: ExtensionInfo[] = [];
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;
    private _onRecommendationsUpdated = new vscode.EventEmitter<ExtensionInfo[]>();
    public readonly onRecommendationsUpdated = this._onRecommendationsUpdated.event;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.outputChannel = vscode.window.createOutputChannel('Let\'s Code - Extensions');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
        this.statusBarItem.text = '$(extensions) Extensions';
        this.statusBarItem.tooltip = 'Extension Recommendations';
        this.statusBarItem.command = 'letscode.showExtensionRecommendations';
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);

        this.setupMessageHandlers();
        this.scanMyExtensions();
        
        // Scan periodically and on connect
        setInterval(() => this.scanMyExtensions(), 60000);
        this.p2pProvider.onPeerConnect(() => {
            this.shareMyExtensions();
            this.analyzeRecommendations();
        });
    }

    private setupMessageHandlers(): void {
        this.p2pProvider.registerMessageHandler('extensions-list', async (msg) => {
            await this.handlePeerExtensions(msg);
        });

        this.p2pProvider.registerMessageHandler('extension-recommend', async (msg) => {
            await this.handleExtensionRecommendation(msg);
        });
    }

    private async scanMyExtensions(): Promise<void> {
        const allExtensions = vscode.extensions.all;
        
        this.myExtensions.clear();
        
        for (const ext of allExtensions) {
            // Skip built-in and theme extensions
            if (ext.id.startsWith('vscode.') || ext.id.startsWith('ms-vscode.')) {
                continue;
            }

            const info: ExtensionInfo = {
                id: ext.id,
                name: ext.packageJSON.displayName || ext.packageJSON.name,
                publisher: ext.packageJSON.publisher,
                version: ext.packageJSON.version,
                description: ext.packageJSON.description,
                category: this.categorizeExtension(ext.packageJSON.keywords, ext.packageJSON.categories),
                installed: true,
                peersUsing: [],
                peerCount: 0,
                priority: 'medium'
            };

            this.myExtensions.set(ext.id, info);
        }

        this.outputChannel.appendLine(`Scanned ${this.myExtensions.size} extensions`);
        this.updateStatusBar();
        
        // Share with peers if in session
        if (this.p2pProvider.isInSession()) {
            this.shareMyExtensions();
        }
    }

    private shareMyExtensions(): void {
        if (!this.p2pProvider.isInSession()) return;

        const extensionsList = Array.from(this.myExtensions.values()).map(ext => ({
            id: ext.id,
            name: ext.name,
            publisher: ext.publisher,
            version: ext.version,
            category: ext.category
        }));

        this.p2pProvider.broadcastMessage({
            type: 'extensions-list',
            data: { extensions: extensionsList },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.outputChannel.appendLine(`Shared ${extensionsList.length} extensions with peers`);
    }

    private async handlePeerExtensions(message: Message): Promise<void> {
        const { extensions } = message.data;
        const peerId = message.sender;

        if (!this.peerExtensions.has(peerId)) {
            this.peerExtensions.set(peerId, new Map());
        }

        const peerExtMap = this.peerExtensions.get(peerId)!;
        peerExtMap.clear();

        for (const ext of extensions) {
            const info: ExtensionInfo = {
                ...ext,
                installed: this.myExtensions.has(ext.id),
                peersUsing: [peerId],
                peerCount: 1,
                priority: 'medium'
            };
            peerExtMap.set(ext.id, info);
        }

        this.outputChannel.appendLine(`Received ${extensions.length} extensions from peer ${peerId.substr(0, 8)}`);
        this.analyzeRecommendations();
    }

    private async handleExtensionRecommendation(message: Message): Promise<void> {
        const { extensionId, extensionName, peerId } = message.data;
        
        if (!this.myExtensions.has(extensionId)) {
            const result = await vscode.window.showInformationMessage(
                `Peer recommends installing: ${extensionName}`,
                'Install Now',
                'View Details',
                'Dismiss'
            );

            if (result === 'Install Now') {
                await this.installExtension(extensionId);
            } else if (result === 'View Details') {
                vscode.commands.executeCommand('extension.open', extensionId);
            }
        }
    }

    private analyzeRecommendations(): void {
        const extensionCounts = new Map<string, { info: ExtensionInfo; peers: Set<string> }>();

        // Aggregate extensions from all peers
        for (const [peerId, peerExts] of this.peerExtensions) {
            for (const [extId, extInfo] of peerExts) {
                if (this.myExtensions.has(extId)) continue; // Skip already installed

                if (!extensionCounts.has(extId)) {
                    extensionCounts.set(extId, { info: extInfo, peers: new Set() });
                }
                extensionCounts.get(extId)!.peers.add(peerId);
            }
        }

        // Create recommendations list
        this.recommendations = [];
        for (const [extId, { info, peers }] of extensionCounts) {
            const peerCount = peers.size;
            const totalPeers = this.p2pProvider.getPeers().length;
            const usagePercent = totalPeers > 0 ? (peerCount / totalPeers) * 100 : 0;

            let priority: 'high' | 'medium' | 'low' = 'low';
            if (usagePercent >= 70) priority = 'high';
            else if (usagePercent >= 40) priority = 'medium';

            // Boost priority for development-related extensions
            if (['Development', 'Language Support', 'Intellisense', 'Linter'].includes(info.category || '')) {
                priority = priority === 'low' ? 'medium' : 'high';
            }

            this.recommendations.push({
                ...info,
                peersUsing: Array.from(peers),
                peerCount,
                priority
            });
        }

        // Sort by priority and peer count
        this.recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.peerCount - a.peerCount;
        });

        this._onRecommendationsUpdated.fire(this.recommendations);
        this.updateStatusBar();

        // Show notification for high priority recommendations
        const highPriority = this.recommendations.filter(r => r.priority === 'high' && r.peerCount > 1);
        if (highPriority.length > 0) {
            vscode.window.showInformationMessage(
                `${highPriority.length} extensions recommended by your team`,
                'View Recommendations'
            ).then(selection => {
                if (selection === 'View Recommendations') {
                    vscode.commands.executeCommand('letscode.showExtensionRecommendations');
                }
            });
        }
    }

    async installExtension(extensionId: string): Promise<void> {
        try {
            await vscode.commands.executeCommand('workbench.extensions.installExtension', extensionId);
            vscode.window.showInformationMessage(`Installing ${extensionId}...`);
            
            // Rescan after a delay
            setTimeout(() => this.scanMyExtensions(), 5000);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to install ${extensionId}`);
        }
    }

    async recommendExtensionToPeers(extensionId: string): Promise<void> {
        const ext = this.myExtensions.get(extensionId);
        if (!ext) {
            vscode.window.showErrorMessage('Extension not found in your installed list');
            return;
        }

        this.p2pProvider.broadcastMessage({
            type: 'extension-recommend',
            data: {
                extensionId,
                extensionName: ext.name,
                description: ext.description,
                peerId: this.p2pProvider.getMyPeerId()
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        vscode.window.showInformationMessage(`Recommended ${ext.name} to all peers`);
    }

    async syncExtensionSettings(extensionId: string): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        const extConfig = config.get(extensionId);
        
        if (extConfig) {
            this.p2pProvider.broadcastMessage({
                type: 'extension-settings',
                data: {
                    extensionId,
                    settings: extConfig
                },
                sender: this.p2pProvider.getMyPeerId(),
                timestamp: Date.now()
            });

            vscode.window.showInformationMessage(`Shared ${extensionId} settings with peers`);
        }
    }

    getRecommendations(): ExtensionInfo[] {
        return this.recommendations;
    }

    getMyExtensions(): ExtensionInfo[] {
        return Array.from(this.myExtensions.values());
    }

    getPeerExtensions(peerId: string): ExtensionInfo[] {
        const peerExts = this.peerExtensions.get(peerId);
        return peerExts ? Array.from(peerExts.values()) : [];
    }

    getCommonExtensions(): ExtensionInfo[] {
        const common = new Map<string, ExtensionInfo>();

        for (const [peerId, peerExts] of this.peerExtensions) {
            for (const [extId, extInfo] of peerExts) {
                if (this.myExtensions.has(extId)) {
                    if (!common.has(extId)) {
                        common.set(extId, { ...extInfo, peersUsing: [], peerCount: 0 });
                    }
                    const existing = common.get(extId)!;
                    existing.peersUsing.push(peerId);
                    existing.peerCount++;
                }
            }
        }

        return Array.from(common.values()).sort((a, b) => b.peerCount - a.peerCount);
    }

    private categorizeExtension(keywords?: string[], categories?: string[]): string {
        const allTags = [...(keywords || []), ...(categories || [])].map(t => t.toLowerCase());
        
        if (allTags.some(t => t.includes('language') || t.includes('programming'))) return 'Language Support';
        if (allTags.some(t => t.includes('debug') || t.includes('test'))) return 'Debugging & Testing';
        if (allTags.some(t => t.includes('git') || t.includes('source control'))) return 'Source Control';
        if (allTags.some(t => t.includes('theme') || t.includes('icon'))) return 'Themes & Icons';
        if (allTags.some(t => t.includes('snippet') || t.includes('template'))) return 'Snippets & Templates';
        if (allTags.some(t => t.includes('format') || t.includes('lint'))) return 'Formatting & Linting';
        if (allTags.some(t => t.includes('database') || t.includes('sql'))) return 'Database';
        if (allTags.some(t => t.includes('cloud') || t.includes('deploy'))) return 'Cloud & DevOps';
        
        return 'Development';
    }

    private updateStatusBar(): void {
        const recCount = this.recommendations.filter(r => r.priority === 'high').length;
        if (recCount > 0) {
            this.statusBarItem.text = `$(extensions) ${recCount} recommended`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            this.statusBarItem.text = `$(extensions) Extensions`;
            this.statusBarItem.backgroundColor = undefined;
        }
    }

    dispose(): void {
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
        this._onRecommendationsUpdated.dispose();
    }
}
