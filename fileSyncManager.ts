import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { P2PCollaborationProvider, Message, Peer } from './p2pProvider';

export interface FileSyncMessage {
    uri: string;
    content: string;
    version: number;
    checksum: string;
}

export class FileSyncManager implements vscode.Disposable {
    private syncedFiles: Map<string, FileSyncMessage> = new Map();
    private fileVersions: Map<string, number> = new Map();
    private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private statusBarItem: vscode.StatusBarItem;
    private syncHistory: Array<{file: string; timestamp: number; sender: string}> = [];
    private outputChannel: vscode.OutputChannel;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.outputChannel = vscode.window.createOutputChannel('Let\'s Code - File Sync');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = '$(sync) Files';
        this.statusBarItem.tooltip = 'File Sync Status';
        this.statusBarItem.command = 'letscode.showSyncStatus';
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);

        this.p2pProvider.registerMessageHandler('file-sync', (msg) => {
            this.handleRemoteFileSync(msg);
        });

        this.p2pProvider.registerMessageHandler('file-request', (msg) => {
            this.handleFileRequest(msg);
        });

        this.p2pProvider.registerMessageHandler('file-share', (msg) => {
            this.handleFileShare(msg);
        });

        // Auto-sync on save if enabled
        vscode.workspace.onDidSaveTextDocument((doc) => {
            const config = vscode.workspace.getConfiguration('letscode');
            if (config.get<boolean>('autoSyncOnSave') && this.p2pProvider.isInSession()) {
                this.syncFile(doc.uri);
            }
        });

        this.updateStatusBar();
    }

    private updateStatusBar(): void {
        const count = this.syncedFiles.size;
        this.statusBarItem.text = `$(sync) Files: ${count}`;
    }

    async syncAllFiles(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        if (!this.p2pProvider.isInSession()) {
            vscode.window.showWarningMessage('Not in a collaboration session');
            return;
        }

        const files = await vscode.workspace.findFiles(
            '**/*.{ts,js,json,md,html,css,py,java,c,cpp,go,rs}',
            '**/node_modules/**'
        );

        const filesToSync = files.slice(0, 50); // Limit to 50 files
        const totalFiles = filesToSync.length;
        
        if (totalFiles === 0) {
            vscode.window.showInformationMessage('No files to sync');
            return;
        }

        // Show progress notification
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Syncing ${totalFiles} files...`,
            cancellable: false
        }, async (progress) => {
            let syncedCount = 0;
            for (const file of filesToSync) {
                try {
                    await this.syncFile(file);
                    syncedCount++;
                    progress.report({ 
                        increment: 100 / totalFiles, 
                        message: `${syncedCount}/${totalFiles} files` 
                    });
                } catch (err) {
                    console.error(`Failed to sync ${file.fsPath}:`, err);
                }
            }
            return syncedCount;
        });

        vscode.window.showInformationMessage(`Synced ${this.syncedFiles.size} files with peers`);
    }

    async syncFile(uri: vscode.Uri): Promise<void> {
        if (!this.p2pProvider.isInSession()) return;

        try {
            const stat = await fs.promises.stat(uri.fsPath);
            if (stat.size > this.MAX_FILE_SIZE) {
                console.log(`File ${uri.fsPath} too large, skipping`);
                return;
            }

            const content = await fs.promises.readFile(uri.fsPath, 'utf-8');
            const checksum = this.computeChecksum(content);
            
            const currentVersion = this.fileVersions.get(uri.toString()) || 0;
            const newVersion = currentVersion + 1;
            this.fileVersions.set(uri.toString(), newVersion);

            const syncMessage: FileSyncMessage = {
                uri: uri.toString(),
                content,
                version: newVersion,
                checksum
            };

            this.syncedFiles.set(uri.toString(), syncMessage);

            this.p2pProvider.broadcastMessage({
                type: 'file-sync',
                data: syncMessage,
                sender: this.p2pProvider.getMyPeerId(),
                timestamp: Date.now()
            });
        } catch (err) {
            console.error('Error syncing file:', err);
        }
    }

    async shareFile(uri: vscode.Uri): Promise<void> {
        if (!this.p2pProvider.isInSession()) {
            vscode.window.showWarningMessage('Not in a collaboration session');
            return;
        }

        try {
            const stat = await fs.promises.stat(uri.fsPath);
            
            if (stat.size > this.MAX_FILE_SIZE) {
                vscode.window.showWarningMessage('File too large (max 5MB)');
                return;
            }

            const content = await fs.promises.readFile(uri.fsPath, 'base64');
            const fileName = path.basename(uri.fsPath);

            this.p2pProvider.broadcastMessage({
                type: 'file-share',
                data: { fileName, content, uri: uri.toString() },
                sender: this.p2pProvider.getMyPeerId(),
                timestamp: Date.now()
            });

            vscode.window.showInformationMessage(`Shared ${fileName} with peers`);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to share file: ${err}`);
        }
    }

    private async handleRemoteFileSync(message: Message): Promise<void> {
        const syncData = message.data as FileSyncMessage;
        const localVersion = this.fileVersions.get(syncData.uri) || 0;

        // Only accept newer versions
        if (syncData.version <= localVersion) return;

        // Verify checksum
        const computedChecksum = this.computeChecksum(syncData.content);
        if (computedChecksum !== syncData.checksum) {
            console.error('Checksum mismatch for', syncData.uri);
            return;
        }

        this.fileVersions.set(syncData.uri, syncData.version);
        this.syncedFiles.set(syncData.uri, syncData);

        // Write to file if it exists locally
        try {
            const uri = vscode.Uri.parse(syncData.uri);
            if (fs.existsSync(uri.fsPath)) {
                const doc = await vscode.workspace.openTextDocument(uri);
                
                // Check if document is dirty
                if (!doc.isDirty) {
                    await fs.promises.writeFile(uri.fsPath, syncData.content, 'utf-8');
                    
                    // Refresh if open
                    const editor = vscode.window.visibleTextEditors.find(
                        e => e.document.uri.toString() === syncData.uri
                    );
                    if (editor) {
                        const position = editor.selection.active;
                        await vscode.window.showTextDocument(doc);
                        editor.selection = new vscode.Selection(position, position);
                    }
                }
            }
        } catch (err) {
            console.error('Error applying file sync:', err);
        }
    }

    private async handleFileRequest(message: Message): Promise<void> {
        const { uri: requestedUri } = message.data;
        const syncData = this.syncedFiles.get(requestedUri);
        
        if (syncData) {
            this.p2pProvider.broadcastMessage({
                type: 'file-sync',
                data: syncData,
                sender: this.p2pProvider.getMyPeerId(),
                timestamp: Date.now()
            });
        }
    }

    private computeChecksum(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    private async handleFileShare(message: Message): Promise<void> {
        const { fileName, content, uri } = message.data;
        const peers = this.p2pProvider.getPeers();
        const peer = peers.find((p: Peer) => p.id === message.sender);
        const peerName = peer?.name || `Peer ${message.sender.substr(0, 6)}`;

        this.outputChannel.appendLine(`[${new Date(message.timestamp).toLocaleTimeString()}] ${peerName} shared: ${fileName}`);
        
        // Show notification
        vscode.window.showInformationMessage(`${peerName} shared file: ${fileName}`, 'Save As...').then(selection => {
            if (selection === 'Save As...') {
                vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(fileName),
                    saveLabel: 'Save Shared File'
                }).then(uri => {
                    if (uri) {
                        const buffer = Buffer.from(content, 'base64');
                        vscode.workspace.fs.writeFile(uri, buffer).then(() => {
                            vscode.window.showInformationMessage(`Saved ${fileName}`);
                        });
                    }
                });
            }
        });
    }

    getSyncedFiles(): string[] {
        return Array.from(this.syncedFiles.keys());
    }

    getSyncHistory(): Array<{file: string; timestamp: number; sender: string}> {
        return this.syncHistory.slice(-20); // Last 20 entries
    }

    dispose(): void {
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    }
}
