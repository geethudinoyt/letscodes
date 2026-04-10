import * as vscode from 'vscode';
import { P2PCollaborationProvider, Message } from './p2pProvider';

export interface ProjectUpdate {
    id: string;
    type: 'file' | 'dependency' | 'config' | 'structure';
    description: string;
    filePath?: string;
    timestamp: number;
    sender: string;
    senderName: string;
}

export class ProjectUpdateManager implements vscode.Disposable {
    private updates: ProjectUpdate[] = [];
    private onUpdateReceived = new vscode.EventEmitter<ProjectUpdate>();
    public readonly onUpdate = this.onUpdateReceived.event;
    private maxUpdates = 50;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        // Register message handlers for project updates
        this.p2pProvider.registerMessageHandler('project-update', (msg) => {
            this.handleProjectUpdate(msg);
        });

        this.p2pProvider.registerMessageHandler('file-change', (msg) => {
            this.handleFileChange(msg);
        });

        // Listen for peer events
        this.p2pProvider.onPeerConnect((peer) => {
            this.sendProjectState(peer.id);
        });
    }

    // Send a project update to all peers
    sendUpdate(type: ProjectUpdate['type'], description: string, filePath?: string): void {
        const config = vscode.workspace.getConfiguration('letscode');
        const username = config.get<string>('username') || 'Anonymous';

        const update: ProjectUpdate = {
            id: this.generateId(),
            type,
            description,
            filePath,
            timestamp: Date.now(),
            sender: this.p2pProvider.getMyPeerId(),
            senderName: username
        };

        this.updates.push(update);
        this.trimUpdates();

        this.p2pProvider.broadcastMessage({
            type: 'project-update',
            data: update,
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.onUpdateReceived.fire(update);
    }

    // Notify peers about a file change
    notifyFileChange(uri: vscode.Uri, changeType: 'created' | 'modified' | 'deleted'): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const relativePath = vscode.workspace.asRelativePath(uri);
        
        this.sendUpdate('file', `File ${changeType}: ${relativePath}`, relativePath);
    }

    // Notify about dependency changes
    notifyDependencyChange(packageJsonChanged: boolean): void {
        if (packageJsonChanged) {
            this.sendUpdate('dependency', 'Dependencies updated - run npm install');
        }
    }

    // Notify about config changes
    notifyConfigChange(configFile: string): void {
        this.sendUpdate('config', `Configuration changed: ${configFile}`);
    }

    // Get current project structure and share it
    async shareProjectStructure(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showWarningMessage('No workspace open');
            return;
        }

        const files = await vscode.workspace.findFiles(
            '**/*.{ts,js,json,md,html,css,py,java,c,cpp,go,rs,vue,jsx,tsx}',
            '{**/node_modules/**,**/.git/**,**/dist/**,**/build/**,**/.vscode/**}'
        );

        const structure = files.slice(0, 100).map(f => ({
            path: vscode.workspace.asRelativePath(f),
            size: 0 // Could add actual size if needed
        }));

        this.p2pProvider.broadcastMessage({
            type: 'project-structure',
            data: {
                fileCount: files.length,
                structure: structure.slice(0, 20), // Send first 20 files
                timestamp: Date.now()
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        vscode.window.showInformationMessage(`Shared project structure (${files.length} files)`);
    }

    // Send current project state to a specific peer (for sync on join)
    private sendProjectState(peerId: string): void {
        const state = {
            updates: this.updates.slice(-10), // Last 10 updates
            timestamp: Date.now()
        };

        this.p2pProvider.sendToPeer(peerId, {
            type: 'project-state',
            data: state,
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private handleProjectUpdate(message: Message): void {
        const update = message.data as ProjectUpdate;
        
        // Add sender info if not present
        if (!update.senderName) {
            update.senderName = `Peer ${update.sender.substr(0, 6)}`;
        }

        this.updates.push(update);
        this.trimUpdates();
        this.onUpdateReceived.fire(update);

        // Show notification based on update type
        switch (update.type) {
            case 'file':
                vscode.window.showInformationMessage(
                    `📁 ${update.senderName}: ${update.description}`,
                    'View File'
                ).then(selection => {
                    if (selection === 'View File' && update.filePath) {
                        this.openFile(update.filePath);
                    }
                });
                break;
            case 'dependency':
                vscode.window.showWarningMessage(
                    `📦 ${update.senderName}: ${update.description}`,
                    'Install'
                ).then(selection => {
                    if (selection === 'Install') {
                        vscode.commands.executeCommand('letscode.syncFiles');
                    }
                });
                break;
            default:
                vscode.window.showInformationMessage(
                    `🔄 ${update.senderName}: ${update.description}`
                );
        }
    }

    private handleFileChange(message: Message): void {
        const { filePath, changeType, content } = message.data;
        
        // Handle remote file changes
        if (changeType === 'modified' && content) {
            this.applyRemoteFileChange(filePath, content);
        }
    }

    private async applyRemoteFileChange(filePath: string, content: string): Promise<void> {
        try {
            const uri = vscode.Uri.file(filePath);
            const document = await vscode.workspace.openTextDocument(uri);
            
            // Only apply if not dirty (no local changes)
            if (!document.isDirty) {
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                );
                edit.replace(uri, fullRange, content);
                await vscode.workspace.applyEdit(edit);
            }
        } catch (err) {
            console.error('Error applying remote file change:', err);
        }
    }

    private async openFile(filePath: string): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) return;

            const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, filePath);
            await vscode.window.showTextDocument(uri);
        } catch (err) {
            console.error('Error opening file:', err);
        }
    }

    getUpdates(): ProjectUpdate[] {
        return [...this.updates];
    }

    clearUpdates(): void {
        this.updates = [];
    }

    private trimUpdates(): void {
        if (this.updates.length > this.maxUpdates) {
            this.updates = this.updates.slice(-this.maxUpdates);
        }
    }

    private generateId(): string {
        return `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    dispose(): void {
        this.onUpdateReceived.dispose();
    }
}
