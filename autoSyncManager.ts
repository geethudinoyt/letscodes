import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { P2PCollaborationProvider, Peer } from './p2pProvider';

export interface ProjectStructure {
    rootPath: string;
    folders: string[];
    files: Array<{
        path: string;
        content?: string;
        size: number;
        modified: number;
    }>;
}

export class AutoSyncManager implements vscode.Disposable {
    private fileWatcher?: vscode.FileSystemWatcher;
    private folderWatcher?: vscode.FileSystemWatcher;
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;
    private autoSyncEnabled: boolean = true;
    private syncQueue: Set<string> = new Set();
    private isProcessingQueue: boolean = false;
    private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private readonly BATCH_SIZE = 10;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.outputChannel = vscode.window.createOutputChannel('Let\'s Code - Auto Sync');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.text = '$(sync-ignored) Auto Sync';
        this.statusBarItem.tooltip = 'Auto Sync: Disabled (No session)';
        this.statusBarItem.command = 'letscode.toggleAutoSync';
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);

        this.setupMessageHandlers();
        this.setupWatchers();
        this.updateStatusBar();

        // Listen for session changes
        this.p2pProvider.onPeerConnect(() => this.updateStatusBar());
        this.p2pProvider.onPeerDisconnect(() => this.updateStatusBar());
    }

    private setupMessageHandlers(): void {
        // Handle folder creation from peers
        this.p2pProvider.registerMessageHandler('folder-created', async (msg) => {
            await this.handleRemoteFolderCreated(msg);
        });

        // Handle file creation from peers
        this.p2pProvider.registerMessageHandler('file-created', async (msg) => {
            await this.handleRemoteFileCreated(msg);
        });

        // Handle project sync request
        this.p2pProvider.registerMessageHandler('project-sync-request', async (msg) => {
            await this.handleProjectSyncRequest(msg);
        });

        // Handle project sync response
        this.p2pProvider.registerMessageHandler('project-sync-response', async (msg) => {
            await this.handleProjectSyncResponse(msg);
        });

        // Handle batch file sync
        this.p2pProvider.registerMessageHandler('batch-file-sync', async (msg) => {
            await this.handleBatchFileSync(msg);
        });
    }

    private setupWatchers(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        // Watch for file changes
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*', false, false, false);
        
        this.fileWatcher.onDidCreate(async (uri) => {
            if (this.autoSyncEnabled && this.p2pProvider.isInSession()) {
                await this.handleLocalFileCreated(uri);
            }
        });

        this.fileWatcher.onDidChange(async (uri) => {
            if (this.autoSyncEnabled && this.p2pProvider.isInSession()) {
                this.queueFileForSync(uri.fsPath);
            }
        });

        this.fileWatcher.onDidDelete((uri) => {
            if (this.autoSyncEnabled && this.p2pProvider.isInSession()) {
                this.broadcastFileDeleted(uri);
            }
        });

        // Watch for folder changes
        this.folderWatcher = vscode.workspace.createFileSystemWatcher('**/', false, false, false);
        
        this.folderWatcher.onDidCreate(async (uri) => {
            if (this.autoSyncEnabled && this.p2pProvider.isInSession()) {
                await this.handleLocalFolderCreated(uri);
            }
        });

        this.context.subscriptions.push(this.fileWatcher, this.folderWatcher);
    }

    private queueFileForSync(filePath: string): void {
        this.syncQueue.add(filePath);
        this.processSyncQueue();
    }

    private async processSyncQueue(): Promise<void> {
        if (this.isProcessingQueue || this.syncQueue.size === 0) return;
        
        this.isProcessingQueue = true;
        const filesToSync = Array.from(this.syncQueue).slice(0, this.BATCH_SIZE);
        this.syncQueue.clear();

        for (const filePath of filesToSync) {
            try {
                await this.syncFile(vscode.Uri.file(filePath));
            } catch (err) {
                console.error(`Failed to sync ${filePath}:`, err);
            }
        }

        this.isProcessingQueue = false;
        
        // Process remaining files
        if (this.syncQueue.size > 0) {
            setTimeout(() => this.processSyncQueue(), 100);
        }
    }

    private async handleLocalFileCreated(uri: vscode.Uri): Promise<void> {
        const stat = await fs.promises.stat(uri.fsPath).catch(() => null);
        if (!stat || stat.isDirectory()) return;

        const content = await fs.promises.readFile(uri.fsPath);
        const relativePath = this.getRelativePath(uri.fsPath);

        // Don't sync if file is too large
        if (content.length > this.MAX_FILE_SIZE) {
            this.outputChannel.appendLine(`Skipping large file: ${relativePath}`);
            return;
        }

        this.p2pProvider.broadcastMessage({
            type: 'file-created',
            data: {
                path: relativePath,
                content: content.toString('base64'),
                size: content.length,
                modified: stat.mtime.getTime()
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.outputChannel.appendLine(`Created and synced: ${relativePath}`);
        this.updateStatusBar();
    }

    private async handleLocalFolderCreated(uri: vscode.Uri): Promise<void> {
        const stat = await fs.promises.stat(uri.fsPath).catch(() => null);
        if (!stat || !stat.isDirectory()) return;

        const relativePath = this.getRelativePath(uri.fsPath);

        this.p2pProvider.broadcastMessage({
            type: 'folder-created',
            data: {
                path: relativePath
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.outputChannel.appendLine(`Folder created and synced: ${relativePath}`);
        
        // Sync all files in the new folder
        await this.syncFolderContents(uri.fsPath);
    }

    private async syncFolderContents(folderPath: string): Promise<void> {
        const files = await this.getFolderFiles(folderPath);
        
        for (const file of files.slice(0, 50)) { // Limit to 50 files per folder
            try {
                await this.handleLocalFileCreated(vscode.Uri.file(file));
            } catch (err) {
                console.error(`Failed to sync file in folder: ${file}`, err);
            }
        }
    }

    private async getFolderFiles(folderPath: string): Promise<string[]> {
        const files: string[] = [];
        const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(folderPath, entry.name);
            if (entry.isFile()) {
                files.push(fullPath);
            } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                const subFiles = await this.getFolderFiles(fullPath);
                files.push(...subFiles);
            }
        }
        
        return files;
    }

    private async handleRemoteFolderCreated(message: any): Promise<void> {
        const { path: relativePath } = message.data;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const fullPath = path.join(workspaceFolders[0].uri.fsPath, relativePath);

        try {
            await fs.promises.mkdir(fullPath, { recursive: true });
            this.outputChannel.appendLine(`Created folder from peer: ${relativePath}`);
            
            vscode.window.showInformationMessage(
                `Peer created folder: ${path.basename(relativePath)}`,
                'Open'
            ).then(selection => {
                if (selection === 'Open') {
                    vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(fullPath));
                }
            });
        } catch (err) {
            console.error('Failed to create folder:', err);
        }
    }

    private async handleRemoteFileCreated(message: any): Promise<void> {
        const { path: relativePath, content, modified } = message.data;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const fullPath = path.join(workspaceFolders[0].uri.fsPath, relativePath);

        try {
            // Ensure parent directory exists
            await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
            
            // Write file
            const buffer = Buffer.from(content, 'base64');
            await fs.promises.writeFile(fullPath, buffer);
            
            // Update modified time
            const modifiedTime = new Date(modified);
            await fs.promises.utimes(fullPath, modifiedTime, modifiedTime);

            this.outputChannel.appendLine(`Created file from peer: ${relativePath}`);
            
            // Show notification for important files
            const ext = path.extname(relativePath).toLowerCase();
            if (['.ts', '.js', '.json', '.md', '.html', '.css'].includes(ext)) {
                vscode.window.showInformationMessage(
                    `New file from peer: ${path.basename(relativePath)}`,
                    'Open'
                ).then(selection => {
                    if (selection === 'Open') {
                        vscode.workspace.openTextDocument(fullPath).then(doc => {
                            vscode.window.showTextDocument(doc);
                        });
                    }
                });
            }
        } catch (err) {
            console.error('Failed to create file:', err);
        }
    }

    private async handleProjectSyncRequest(message: any): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const rootPath = workspaceFolders[0].uri.fsPath;
        const projectStructure = await this.getProjectStructure(rootPath);

        // Send project structure to requesting peer
        this.p2pProvider.sendToPeer(message.sender, {
            type: 'project-sync-response',
            data: {
                structure: projectStructure,
                requester: message.sender
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private async handleProjectSyncResponse(message: any): Promise<void> {
        const { structure } = message.data;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const rootPath = workspaceFolders[0].uri.fsPath;

        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Importing project structure (${structure.files.length} files)...`,
            cancellable: true
        }, async (progress, token) => {
            let created = 0;
            const total = structure.folders.length + structure.files.length;

            // Create folders
            for (const folderPath of structure.folders) {
                if (token.isCancellationRequested) break;
                
                const fullPath = path.join(rootPath, folderPath);
                await fs.promises.mkdir(fullPath, { recursive: true });
                created++;
                progress.report({ increment: 100 / total });
            }

            // Create files
            for (const file of structure.files) {
                if (token.isCancellationRequested) break;
                
                if (file.content) {
                    const fullPath = path.join(rootPath, file.path);
                    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
                    
                    const buffer = Buffer.from(file.content, 'base64');
                    if (buffer.length <= this.MAX_FILE_SIZE) {
                        await fs.promises.writeFile(fullPath, buffer);
                    }
                }
                created++;
                progress.report({ increment: 100 / total, message: `${created}/${total}` });
            }

            return created;
        });

        vscode.window.showInformationMessage(
            `Project imported successfully!`,
            'Open Folder'
        ).then(selection => {
            if (selection === 'Open Folder') {
                vscode.commands.executeCommand('revealInExplorer', workspaceFolders[0].uri);
            }
        });
    }

    private async handleBatchFileSync(message: any): Promise<void> {
        const { files } = message.data;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const rootPath = workspaceFolders[0].uri.fsPath;

        for (const file of files) {
            try {
                const fullPath = path.join(rootPath, file.path);
                await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
                
                const buffer = Buffer.from(file.content, 'base64');
                if (buffer.length <= this.MAX_FILE_SIZE) {
                    await fs.promises.writeFile(fullPath, buffer);
                }
            } catch (err) {
                console.error(`Failed to sync file: ${file.path}`, err);
            }
        }

        this.outputChannel.appendLine(`Batch synced ${files.length} files`);
    }

    private async getProjectStructure(rootPath: string): Promise<ProjectStructure> {
        const folders: string[] = [];
        const files: ProjectStructure['files'] = [];

        const scanDir = async (dir: string, relativeDir: string = '') => {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const relativePath = path.join(relativeDir, entry.name);
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
                        folders.push(relativePath);
                        await scanDir(fullPath, relativePath);
                    }
                } else if (entry.isFile()) {
                    const stat = await fs.promises.stat(fullPath);
                    if (stat.size <= this.MAX_FILE_SIZE) {
                        const content = await fs.promises.readFile(fullPath);
                        files.push({
                            path: relativePath,
                            content: content.toString('base64'),
                            size: stat.size,
                            modified: stat.mtime.getTime()
                        });
                    }
                }
            }
        };

        await scanDir(rootPath);

        return { rootPath, folders, files };
    }

    async requestProjectSyncFromPeer(peerId: string): Promise<void> {
        if (!this.p2pProvider.isInSession()) {
            vscode.window.showWarningMessage('Not in a collaboration session');
            return;
        }

        this.p2pProvider.sendToPeer(peerId, {
            type: 'project-sync-request',
            data: {},
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        vscode.window.showInformationMessage('Requesting project sync from peer...');
    }

    async shareEntireProject(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showWarningMessage('No workspace open');
            return;
        }

        if (!this.p2pProvider.isInSession()) {
            vscode.window.showWarningMessage('Not in a collaboration session');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const structure = await this.getProjectStructure(rootPath);

        // Send in batches
        const batchSize = 20;
        for (let i = 0; i < structure.files.length; i += batchSize) {
            const batch = structure.files.slice(i, i + batchSize);
            
            this.p2pProvider.broadcastMessage({
                type: 'batch-file-sync',
                data: {
                    files: batch,
                    totalBatches: Math.ceil(structure.files.length / batchSize),
                    currentBatch: Math.floor(i / batchSize) + 1
                },
                sender: this.p2pProvider.getMyPeerId(),
                timestamp: Date.now()
            });
        }

        vscode.window.showInformationMessage(
            `Shared project with ${structure.files.length} files to all peers`
        );
    }

    async syncFile(uri: vscode.Uri): Promise<void> {
        const stat = await fs.promises.stat(uri.fsPath).catch(() => null);
        if (!stat || stat.isDirectory()) return;

        const content = await fs.promises.readFile(uri.fsPath);
        const relativePath = this.getRelativePath(uri.fsPath);

        if (content.length > this.MAX_FILE_SIZE) return;

        this.p2pProvider.broadcastMessage({
            type: 'file-sync',
            data: {
                path: relativePath,
                content: content.toString('base64'),
                modified: stat.mtime.getTime()
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private broadcastFileDeleted(uri: vscode.Uri): void {
        const relativePath = this.getRelativePath(uri.fsPath);
        
        this.p2pProvider.broadcastMessage({
            type: 'file-deleted',
            data: { path: relativePath },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.outputChannel.appendLine(`Deleted: ${relativePath}`);
    }

    private getRelativePath(fullPath: string): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return fullPath;

        const rootPath = workspaceFolders[0].uri.fsPath;
        return path.relative(rootPath, fullPath);
    }

    toggleAutoSync(): void {
        this.autoSyncEnabled = !this.autoSyncEnabled;
        this.updateStatusBar();
        
        vscode.window.showInformationMessage(
            `Auto sync ${this.autoSyncEnabled ? 'enabled' : 'disabled'}`
        );
    }

    private updateStatusBar(): void {
        if (!this.p2pProvider.isInSession()) {
            this.statusBarItem.text = '$(sync-ignored) Auto Sync';
            this.statusBarItem.tooltip = 'Auto Sync: No active session';
            return;
        }

        if (this.autoSyncEnabled) {
            this.statusBarItem.text = '$(sync) Auto Sync ON';
            this.statusBarItem.tooltip = 'Auto Sync: Enabled (Click to disable)';
        } else {
            this.statusBarItem.text = '$(sync-ignored) Auto Sync OFF';
            this.statusBarItem.tooltip = 'Auto Sync: Disabled (Click to enable)';
        }
    }

    dispose(): void {
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
        this.fileWatcher?.dispose();
        this.folderWatcher?.dispose();
    }
}
