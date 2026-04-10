import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { P2PCollaborationProvider, Message, Peer } from './p2pProvider';

export interface FileVersion {
    versionId: string;
    timestamp: number;
    author: string;
    authorName: string;
    content: string;
    size: number;
    checksum: string;
    message?: string;
    changes?: {
        added: number;
        removed: number;
        modified: number;
    };
}

export interface FileHistory {
    filePath: string;
    currentVersion: number;
    versions: FileVersion[];
    created: number;
    lastModified: number;
}

export interface CommitInfo {
    commitId: string;
    timestamp: number;
    author: string;
    authorName: string;
    message: string;
    files: Array<{
        path: string;
        action: 'created' | 'modified' | 'deleted';
        versionId: string;
    }>;
}

export class FileHistoryManager implements vscode.Disposable {
    private fileHistories: Map<string, FileHistory> = new Map();
    private commits: CommitInfo[] = [];
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;
    private historyDir: string;
    private autoCommitInterval?: NodeJS.Timeout;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.outputChannel = vscode.window.createOutputChannel('Let\'s Code - File History');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.statusBarItem.text = '$(history) History';
        this.statusBarItem.tooltip = 'File History & Commits';
        this.statusBarItem.command = 'letscode.showFileHistory';
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);

        // Setup history storage directory
        this.historyDir = path.join(context.globalStorageUri.fsPath, 'history');
        fs.mkdirSync(this.historyDir, { recursive: true });

        this.setupMessageHandlers();
        this.setupAutoCommit();
        this.loadPersistedHistory();
    }

    private setupMessageHandlers(): void {
        this.p2pProvider.registerMessageHandler('file-version', async (msg) => {
            await this.handleRemoteFileVersion(msg);
        });

        this.p2pProvider.registerMessageHandler('commit', async (msg) => {
            await this.handleRemoteCommit(msg);
        });

        this.p2pProvider.registerMessageHandler('history-request', async (msg) => {
            await this.handleHistoryRequest(msg);
        });

        this.p2pProvider.registerMessageHandler('history-response', async (msg) => {
            await this.handleHistoryResponse(msg);
        });
    }

    private setupAutoCommit(): void {
        // Auto-commit every 5 minutes if there are changes
        this.autoCommitInterval = setInterval(() => {
            this.createAutoCommit();
        }, 5 * 60 * 1000);

        // Also commit on file save
        vscode.workspace.onDidSaveTextDocument((doc) => {
            if (this.p2pProvider.isInSession()) {
                this.createVersion(doc.uri.fsPath, doc.getText(), 'Auto-save');
            }
        });
    }

    async createVersion(filePath: string, content: string, message?: string): Promise<FileVersion> {
        const relativePath = this.getRelativePath(filePath);
        const timestamp = Date.now();
        const versionId = this.generateVersionId(filePath, content, timestamp);
        const checksum = this.calculateChecksum(content);
        
        let history = this.fileHistories.get(relativePath);
        if (!history) {
            history = {
                filePath: relativePath,
                currentVersion: 0,
                versions: [],
                created: timestamp,
                lastModified: timestamp
            };
            this.fileHistories.set(relativePath, history);
        }

        // Calculate changes from previous version
        const lastVersion = history.versions[history.versions.length - 1];
        const changes = lastVersion ? this.calculateChanges(lastVersion.content, content) : undefined;

        const version: FileVersion = {
            versionId,
            timestamp,
            author: this.p2pProvider.getMyPeerId(),
            authorName: this.getMyName(),
            content: Buffer.from(content).toString('base64'),
            size: content.length,
            checksum,
            message,
            changes
        };

        history.versions.push(version);
        history.currentVersion = history.versions.length;
        history.lastModified = timestamp;

        // Persist to disk
        await this.persistHistory(relativePath, history);

        // Broadcast to peers
        if (this.p2pProvider.isInSession()) {
            this.p2pProvider.broadcastMessage({
                type: 'file-version',
                data: {
                    filePath: relativePath,
                    version: {
                        ...version,
                        content: version.content.substring(0, 10000) // Limit broadcast size
                    }
                },
                sender: this.p2pProvider.getMyPeerId(),
                timestamp
            });
        }

        this.outputChannel.appendLine(`Created version ${history.currentVersion} for ${relativePath}`);
        this.updateStatusBar();

        return version;
    }

    async createCommit(message: string, files?: string[]): Promise<CommitInfo> {
        const timestamp = Date.now();
        const commitId = this.generateCommitId(message, timestamp);
        
        const commitFiles: CommitInfo['files'] = [];
        
        if (files && files.length > 0) {
            for (const filePath of files) {
                const relativePath = this.getRelativePath(filePath);
                const history = this.fileHistories.get(relativePath);
                if (history && history.versions.length > 0) {
                    const lastVersion = history.versions[history.versions.length - 1];
                    commitFiles.push({
                        path: relativePath,
                        action: history.versions.length === 1 ? 'created' : 'modified',
                        versionId: lastVersion.versionId
                    });
                }
            }
        } else {
            // Include all recently modified files
            const recentTime = timestamp - 5 * 60 * 1000; // Last 5 minutes
            for (const [path, history] of this.fileHistories) {
                const recentVersions = history.versions.filter(v => v.timestamp > recentTime);
                if (recentVersions.length > 0) {
                    const lastVersion = recentVersions[recentVersions.length - 1];
                    commitFiles.push({
                        path,
                        action: 'modified',
                        versionId: lastVersion.versionId
                    });
                }
            }
        }

        const commit: CommitInfo = {
            commitId,
            timestamp,
            author: this.p2pProvider.getMyPeerId(),
            authorName: this.getMyName(),
            message,
            files: commitFiles
        };

        this.commits.push(commit);
        this.commits.sort((a, b) => b.timestamp - a.timestamp);

        // Persist commit
        await this.persistCommit(commit);

        // Broadcast to peers
        if (this.p2pProvider.isInSession()) {
            this.p2pProvider.broadcastMessage({
                type: 'commit',
                data: { commit },
                sender: this.p2pProvider.getMyPeerId(),
                timestamp
            });
        }

        vscode.window.showInformationMessage(`Created commit: ${message} (${commitFiles.length} files)`);
        this.outputChannel.appendLine(`Created commit ${commitId}: ${message}`);
        this.updateStatusBar();

        return commit;
    }

    private async createAutoCommit(): Promise<void> {
        if (!this.p2pProvider.isInSession()) return;

        const recentCommits = this.commits.filter(c => c.timestamp > Date.now() - 5 * 60 * 1000);
        if (recentCommits.length > 0) return; // Already committed recently

        const modifiedFiles: string[] = [];
        for (const [path, history] of this.fileHistories) {
            if (history.lastModified > Date.now() - 5 * 60 * 1000) {
                modifiedFiles.push(path);
            }
        }

        if (modifiedFiles.length > 0) {
            await this.createCommit(`Auto-commit: ${modifiedFiles.length} files modified`, modifiedFiles);
        }
    }

    async restoreVersion(filePath: string, versionId: string): Promise<void> {
        const relativePath = this.getRelativePath(filePath);
        const history = this.fileHistories.get(relativePath);
        
        if (!history) {
            vscode.window.showErrorMessage('No history found for this file');
            return;
        }

        const version = history.versions.find(v => v.versionId === versionId);
        if (!version) {
            vscode.window.showErrorMessage('Version not found');
            return;
        }

        const content = Buffer.from(version.content, 'base64').toString();
        
        // Confirm restore
        const result = await vscode.window.showWarningMessage(
            `Restore ${relativePath} to version from ${new Date(version.timestamp).toLocaleString()}?`,
            'Yes', 'No'
        );

        if (result === 'Yes') {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders) {
                const fullPath = path.join(workspaceFolders[0].uri.fsPath, relativePath);
                await fs.promises.writeFile(fullPath, content, 'utf8');
                
                vscode.window.showInformationMessage(`Restored ${relativePath} to version ${versionId.substr(0, 8)}`);
                this.outputChannel.appendLine(`Restored ${relativePath} to version ${versionId}`);
            }
        }
    }

    async showVersionDiff(filePath: string, versionId1: string, versionId2: string): Promise<void> {
        const relativePath = this.getRelativePath(filePath);
        const history = this.fileHistories.get(relativePath);
        
        if (!history) return;

        const v1 = history.versions.find(v => v.versionId === versionId1);
        const v2 = history.versions.find(v => v.versionId === versionId2);

        if (!v1 || !v2) {
            vscode.window.showErrorMessage('One or both versions not found');
            return;
        }

        const content1 = Buffer.from(v1.content, 'base64').toString();
        const content2 = Buffer.from(v2.content, 'base64').toString();

        const doc1 = await vscode.workspace.openTextDocument({
            language: path.extname(filePath).replace('.', ''),
            content: content1
        });

        const doc2 = await vscode.workspace.openTextDocument({
            language: path.extname(filePath).replace('.', ''),
            content: content2
        });

        await vscode.commands.executeCommand('vscode.diff', doc1.uri, doc2.uri, 
            `${path.basename(filePath)}: ${v1.versionId.substr(0, 8)} ↔ ${v2.versionId.substr(0, 8)}`);
    }

    async requestHistoryFromPeer(peerId: string): Promise<void> {
        this.p2pProvider.sendToPeer(peerId, {
            type: 'history-request',
            data: { requester: this.p2pProvider.getMyPeerId() },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        vscode.window.showInformationMessage('Requesting file history from peer...');
    }

    getFileHistory(filePath: string): FileHistory | undefined {
        const relativePath = this.getRelativePath(filePath);
        return this.fileHistories.get(relativePath);
    }

    getAllHistory(): FileHistory[] {
        return Array.from(this.fileHistories.values()).sort((a, b) => b.lastModified - a.lastModified);
    }

    getCommits(): CommitInfo[] {
        return this.commits;
    }

    private async handleRemoteFileVersion(message: Message): Promise<void> {
        const { filePath, version } = message.data;
        
        let history = this.fileHistories.get(filePath);
        if (!history) {
            history = {
                filePath,
                currentVersion: 0,
                versions: [],
                created: version.timestamp,
                lastModified: version.timestamp
            };
            this.fileHistories.set(filePath, history);
        }

        // Check if version already exists
        if (!history.versions.some(v => v.versionId === version.versionId)) {
            history.versions.push(version);
            history.currentVersion = history.versions.length;
            history.lastModified = version.timestamp;
            
            await this.persistHistory(filePath, history);
            this.outputChannel.appendLine(`Received version for ${filePath} from peer`);
            this.updateStatusBar();
        }
    }

    private async handleRemoteCommit(message: Message): Promise<void> {
        const { commit } = message.data;
        
        if (!this.commits.some(c => c.commitId === commit.commitId)) {
            this.commits.push(commit);
            this.commits.sort((a, b) => b.timestamp - a.timestamp);
            
            await this.persistCommit(commit);
            
            vscode.window.showInformationMessage(
                `New commit from ${commit.authorName}: ${commit.message}`,
                'View'
            ).then(selection => {
                if (selection === 'View') {
                    vscode.commands.executeCommand('letscode.showCommits');
                }
            });
            
            this.updateStatusBar();
        }
    }

    private async handleHistoryRequest(message: Message): Promise<void> {
        // Send our history to the requester
        const allHistory = Array.from(this.fileHistories.entries()).map(([path, history]) => ({
            filePath: path,
            history: {
                ...history,
                versions: history.versions.slice(-10) // Send last 10 versions only
            }
        }));

        this.p2pProvider.sendToPeer(message.sender, {
            type: 'history-response',
            data: { histories: allHistory },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private async handleHistoryResponse(message: Message): Promise<void> {
        const { histories } = message.data;
        let imported = 0;

        for (const { filePath, history } of histories) {
            const existing = this.fileHistories.get(filePath);
            if (!existing) {
                this.fileHistories.set(filePath, history);
                await this.persistHistory(filePath, history);
                imported++;
            }
        }

        vscode.window.showInformationMessage(`Imported history for ${imported} files from peer`);
        this.updateStatusBar();
    }

    private async persistHistory(filePath: string, history: FileHistory): Promise<void> {
        const safeFileName = filePath.replace(/[^a-zA-Z0-9]/g, '_');
        const historyFile = path.join(this.historyDir, `${safeFileName}.json`);
        
        try {
            await fs.promises.writeFile(historyFile, JSON.stringify(history, null, 2), 'utf8');
        } catch (err) {
            console.error('Failed to persist history:', err);
        }
    }

    private async persistCommit(commit: CommitInfo): Promise<void> {
        const commitFile = path.join(this.historyDir, `commit_${commit.commitId}.json`);
        
        try {
            await fs.promises.writeFile(commitFile, JSON.stringify(commit, null, 2), 'utf8');
        } catch (err) {
            console.error('Failed to persist commit:', err);
        }
    }

    private async loadPersistedHistory(): Promise<void> {
        try {
            const files = await fs.promises.readdir(this.historyDir);
            
            for (const file of files) {
                if (file.startsWith('commit_')) {
                    const content = await fs.promises.readFile(path.join(this.historyDir, file), 'utf8');
                    const commit: CommitInfo = JSON.parse(content);
                    this.commits.push(commit);
                } else if (file.endsWith('.json')) {
                    const content = await fs.promises.readFile(path.join(this.historyDir, file), 'utf8');
                    const history: FileHistory = JSON.parse(content);
                    this.fileHistories.set(history.filePath, history);
                }
            }

            this.commits.sort((a, b) => b.timestamp - a.timestamp);
            this.updateStatusBar();
            this.outputChannel.appendLine(`Loaded history for ${this.fileHistories.size} files, ${this.commits.length} commits`);
        } catch (err) {
            console.error('Failed to load persisted history:', err);
        }
    }

    private generateVersionId(filePath: string, content: string, timestamp: number): string {
        return crypto.createHash('sha256')
            .update(`${filePath}:${content}:${timestamp}`)
            .digest('hex');
    }

    private generateCommitId(message: string, timestamp: number): string {
        return crypto.createHash('sha256')
            .update(`${message}:${timestamp}:${this.p2pProvider.getMyPeerId()}`)
            .digest('hex')
            .substr(0, 16);
    }

    private calculateChecksum(content: string): string {
        return crypto.createHash('md5').update(content).digest('hex');
    }

    private calculateChanges(oldContent: string, newContent: string): { added: number; removed: number; modified: number } {
        const oldLines = oldContent.split('\n');
        const newLines = newContent.split('\n');
        
        let added = 0;
        let removed = 0;
        let modified = 0;

        const maxLen = Math.max(oldLines.length, newLines.length);
        
        for (let i = 0; i < maxLen; i++) {
            if (i >= oldLines.length) {
                added++;
            } else if (i >= newLines.length) {
                removed++;
            } else if (oldLines[i] !== newLines[i]) {
                modified++;
            }
        }

        return { added, removed, modified };
    }

    private getRelativePath(fullPath: string): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return fullPath;

        const rootPath = workspaceFolders[0].uri.fsPath;
        return path.relative(rootPath, fullPath);
    }

    private getMyName(): string {
        return vscode.workspace.getConfiguration('letscode').get('username') || 'Anonymous';
    }

    private updateStatusBar(): void {
        const fileCount = this.fileHistories.size;
        const commitCount = this.commits.length;
        this.statusBarItem.text = `$(history) ${fileCount} files, ${commitCount} commits`;
    }

    dispose(): void {
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
        if (this.autoCommitInterval) {
            clearInterval(this.autoCommitInterval);
        }
    }
}
