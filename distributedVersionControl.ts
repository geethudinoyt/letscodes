import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { P2PNetworkManager, NetworkMessage } from './p2pNetworkManager';

export interface DistributedCommit {
    id: string;
    message: string;
    author: string;
    authorName: string;
    timestamp: number;
    parentIds: string[];
    files: CommitFile[];
    branch: string;
    signature?: string;
}

export interface CommitFile {
    path: string;
    content: string;
    checksum: string;
    operation: 'add' | 'modify' | 'delete';
}

export interface DistributedBranch {
    name: string;
    headCommitId: string;
    owner: string;
    created: number;
    updated: number;
}

export interface FileHistory {
    path: string;
    versions: FileVersion[];
}

export interface FileVersion {
    commitId: string;
    content: string;
    timestamp: number;
    author: string;
    checksum: string;
}

export class DistributedVersionControl extends EventEmitter implements vscode.Disposable {
    private commits: Map<string, DistributedCommit> = new Map();
    private branches: Map<string, DistributedBranch> = new Map();
    private fileHistory: Map<string, FileHistory> = new Map();
    private currentBranch: string = 'main';
    private stagingArea: Map<string, CommitFile> = new Map();
    private myNodeId: string;
    private statusBarItem: vscode.StatusBarItem;
    private outputChannel: vscode.OutputChannel;

    constructor(
        private context: vscode.ExtensionContext,
        private networkManager: P2PNetworkManager
    ) {
        super();
        this.myNodeId = this.networkManager.getMyNodeId();
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.outputChannel = vscode.window.createOutputChannel('Let\'s Code - DVCS');
        
        this.initializeDVCS();
        this.setupNetworkListeners();
    }

    private async initializeDVCS(): Promise<void> {
        this.outputChannel.appendLine(`🔧 Initializing Distributed Version Control`);
        
        // Load stored commits
        const storedCommits = this.context.globalState.get<DistributedCommit[]>('dvcs-commits', []);
        for (const commit of storedCommits) {
            this.commits.set(commit.id, commit);
        }
        
        // Load stored branches
        const storedBranches = this.context.globalState.get<DistributedBranch[]>('dvcs-branches', []);
        for (const branch of storedBranches) {
            this.branches.set(branch.name, branch);
        }
        
        // Ensure main branch exists
        if (!this.branches.has('main')) {
            this.branches.set('main', {
                name: 'main',
                headCommitId: '',
                owner: this.myNodeId,
                created: Date.now(),
                updated: Date.now()
            });
        }
        
        // Load file history
        const storedHistory = this.context.globalState.get<FileHistory[]>('dvcs-history', []);
        for (const history of storedHistory) {
            this.fileHistory.set(history.path, history);
        }
        
        this.updateStatusBar();
        this.outputChannel.appendLine(`✅ DVCS ready with ${this.commits.size} commits, ${this.branches.size} branches`);
    }

    private setupNetworkListeners(): void {
        // Listen for commit messages
        this.networkManager.on('commit', (payload: any) => {
            this.handleRemoteCommit(payload);
        });

        // Listen for commit requests
        this.networkManager.on('commit-request', (payload: any) => {
            this.handleCommitRequest(payload);
        });
    }

    public async stageFile(uri: vscode.Uri): Promise<void> {
        try {
            const content = await vscode.workspace.fs.readFile(uri);
            const contentString = Buffer.from(content).toString('utf8');
            const path = uri.fsPath;
            
            this.stagingArea.set(path, {
                path,
                content: contentString,
                checksum: this.calculateChecksum(contentString),
                operation: 'modify'
            });
            
            this.updateStatusBar();
            this.outputChannel.appendLine(`➕ Staged: ${path}`);
            vscode.window.showInformationMessage(`Staged: ${path.split('/').pop()}`);
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to stage file: ${err}`);
        }
    }

    public async stageAllFiles(): Promise<void> {
        const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**');
        for (const file of files) {
            if ((await vscode.workspace.fs.stat(file)).type === vscode.FileType.File) {
                await this.stageFile(file);
            }
        }
        vscode.window.showInformationMessage(`Staged ${this.stagingArea.size} files`);
    }

    public async unstageFile(path: string): Promise<void> {
        this.stagingArea.delete(path);
        this.updateStatusBar();
        vscode.window.showInformationMessage(`Unstaged: ${path.split('/').pop()}`);
    }

    public async unstageAll(): Promise<void> {
        this.stagingArea.clear();
        this.updateStatusBar();
        vscode.window.showInformationMessage('Unstaged all files');
    }

    public async createCommit(message: string): Promise<DistributedCommit> {
        if (this.stagingArea.size === 0) {
            throw new Error('No files staged for commit');
        }

        const commitId = this.generateCommitId();
        const currentBranch = this.branches.get(this.currentBranch);
        const parentIds = currentBranch?.headCommitId ? [currentBranch.headCommitId] : [];
        
        const commit: DistributedCommit = {
            id: commitId,
            message,
            author: this.myNodeId,
            authorName: await this.getAuthorName(),
            timestamp: Date.now(),
            parentIds,
            files: Array.from(this.stagingArea.values()),
            branch: this.currentBranch,
            signature: await this.signCommit(commitId)
        };

        // Store commit
        this.commits.set(commitId, commit);
        
        // Update branch head
        if (currentBranch) {
            currentBranch.headCommitId = commitId;
            currentBranch.updated = Date.now();
            this.branches.set(this.currentBranch, currentBranch);
        }

        // Update file history
        for (const file of commit.files) {
            let history = this.fileHistory.get(file.path);
            if (!history) {
                history = { path: file.path, versions: [] };
            }
            history.versions.push({
                commitId,
                content: file.content,
                timestamp: commit.timestamp,
                author: commit.author,
                checksum: file.checksum
            });
            this.fileHistory.set(file.path, history);
        }

        // Clear staging area
        this.stagingArea.clear();

        // Save state
        await this.saveState();

        // Broadcast to peers
        this.broadcastCommit(commit);

        this.updateStatusBar();
        this.outputChannel.appendLine(`✅ Created commit: ${commitId.substr(0, 8)} - ${message}`);
        
        vscode.window.showInformationMessage(`Committed: ${message}`);
        
        return commit;
    }

    public async createBranch(name: string, fromCommit?: string): Promise<DistributedBranch> {
        const baseCommitId = fromCommit || this.branches.get(this.currentBranch)?.headCommitId || '';
        
        const branch: DistributedBranch = {
            name,
            headCommitId: baseCommitId,
            owner: this.myNodeId,
            created: Date.now(),
            updated: Date.now()
        };
        
        this.branches.set(name, branch);
        await this.saveState();
        
        this.outputChannel.appendLine(`🌿 Created branch: ${name}`);
        vscode.window.showInformationMessage(`Created branch: ${name}`);
        
        return branch;
    }

    public async switchBranch(name: string): Promise<void> {
        if (!this.branches.has(name)) {
            throw new Error(`Branch ${name} does not exist`);
        }
        
        // Check for uncommitted changes
        if (this.stagingArea.size > 0) {
            const action = await vscode.window.showWarningMessage(
                'You have uncommitted changes',
                'Commit',
                'Stash',
                'Discard'
            );
            
            if (action === 'Commit') {
                const message = await vscode.window.showInputBox({ prompt: 'Commit message' });
                if (message) {
                    await this.createCommit(message);
                } else {
                    return;
                }
            } else if (action === 'Stash') {
                // TODO: Implement stash
                return;
            } else if (action === 'Discard') {
                this.stagingArea.clear();
            } else {
                return;
            }
        }
        
        this.currentBranch = name;
        this.emit('branch-switched', name);
        
        this.updateStatusBar();
        this.outputChannel.appendLine(`🔄 Switched to branch: ${name}`);
        vscode.window.showInformationMessage(`Switched to branch: ${name}`);
    }

    public async mergeBranch(sourceBranch: string, targetBranch?: string): Promise<DistributedCommit | null> {
        const target = targetBranch || this.currentBranch;
        const source = this.branches.get(sourceBranch);
        const targetBr = this.branches.get(target);
        
        if (!source || !targetBr) {
            throw new Error('Source or target branch does not exist');
        }

        // Simple merge - create a merge commit
        const mergeCommitId = this.generateCommitId();
        const mergeCommit: DistributedCommit = {
            id: mergeCommitId,
            message: `Merge branch '${sourceBranch}' into ${target}`,
            author: this.myNodeId,
            authorName: await this.getAuthorName(),
            timestamp: Date.now(),
            parentIds: [targetBr.headCommitId, source.headCommitId],
            files: [], // TODO: Actually merge files
            branch: target,
            signature: await this.signCommit(mergeCommitId)
        };

        this.commits.set(mergeCommitId, mergeCommit);
        targetBr.headCommitId = mergeCommitId;
        targetBr.updated = Date.now();
        this.branches.set(target, targetBr);

        await this.saveState();
        this.broadcastCommit(mergeCommit);

        this.outputChannel.appendLine(`🔀 Merged ${sourceBranch} into ${target}`);
        vscode.window.showInformationMessage(`Merged ${sourceBranch} into ${target}`);

        return mergeCommit;
    }

    public async pushToPeers(): Promise<void> {
        const commits = this.getBranchCommits(this.currentBranch);
        
        for (const peer of this.networkManager.getOnlinePeers()) {
            this.networkManager.broadcast({
                type: 'commit-request',
                sender: this.myNodeId,
                target: peer.id,
                payload: {
                    branch: this.currentBranch,
                    commits: commits.map(c => c.id)
                },
                timestamp: Date.now()
            });
        }
        
        vscode.window.showInformationMessage(`Pushed ${commits.length} commits to peers`);
    }

    public async pullFromPeers(): Promise<number> {
        let pulledCount = 0;
        
        // Request commits from all peers
        for (const peer of this.networkManager.getOnlinePeers()) {
            this.networkManager.broadcast({
                type: 'commit-request',
                sender: this.myNodeId,
                target: peer.id,
                payload: {
                    requestType: 'all-commits',
                    branch: this.currentBranch
                },
                timestamp: Date.now()
            });
        }
        
        // Wait for responses (simplified - in real implementation would wait async)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return pulledCount;
    }

    public async revertToCommit(commitId: string): Promise<void> {
        const commit = this.commits.get(commitId);
        if (!commit) {
            throw new Error('Commit not found');
        }

        // Restore files from commit
        for (const file of commit.files) {
            const uri = vscode.Uri.file(file.path);
            try {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(file.content));
            } catch (err) {
                this.outputChannel.appendLine(`Failed to restore ${file.path}: ${err}`);
            }
        }

        vscode.window.showInformationMessage(`Reverted to commit: ${commitId.substr(0, 8)}`);
    }

    public async showCommitDiff(commitId: string): Promise<string> {
        const commit = this.commits.get(commitId);
        if (!commit) {
            throw new Error('Commit not found');
        }

        let diff = `Commit: ${commitId}\n`;
        diff += `Author: ${commit.authorName}\n`;
        diff += `Date: ${new Date(commit.timestamp).toLocaleString()}\n`;
        diff += `Message: ${commit.message}\n\n`;
        diff += `Files changed (${commit.files.length}):\n`;
        
        for (const file of commit.files) {
            diff += `  ${file.operation}: ${file.path}\n`;
        }

        return diff;
    }

    public async getFileHistory(path: string): Promise<FileHistory | null> {
        return this.fileHistory.get(path) || null;
    }

    public async restoreFileVersion(path: string, commitId: string): Promise<void> {
        const history = this.fileHistory.get(path);
        if (!history) {
            throw new Error('File history not found');
        }

        const version = history.versions.find(v => v.commitId === commitId);
        if (!version) {
            throw new Error('Version not found');
        }

        const uri = vscode.Uri.file(path);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(version.content));
        
        vscode.window.showInformationMessage(`Restored ${path} to version from commit ${commitId.substr(0, 8)}`);
    }

    public async compareVersions(path: string, commitId1: string, commitId2: string): Promise<string> {
        const history = this.fileHistory.get(path);
        if (!history) {
            throw new Error('File history not found');
        }

        const version1 = history.versions.find(v => v.commitId === commitId1);
        const version2 = history.versions.find(v => v.commitId === commitId2);

        if (!version1 || !version2) {
            throw new Error('One or both versions not found');
        }

        // Simple diff
        const lines1 = version1.content.split('\n');
        const lines2 = version2.content.split('\n');
        
        let diff = `--- ${path} (${commitId1.substr(0, 8)})\n`;
        diff += `+++ ${path} (${commitId2.substr(0, 8)})\n\n`;
        
        const maxLen = Math.max(lines1.length, lines2.length);
        for (let i = 0; i < maxLen; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';
            
            if (line1 !== line2) {
                if (line1) diff += `- ${line1}\n`;
                if (line2) diff += `+ ${line2}\n`;
            }
        }

        return diff;
    }

    public async syncWithPeers(): Promise<void> {
        // Push local commits
        await this.pushToPeers();
        
        // Pull remote commits
        await this.pullFromPeers();
        
        vscode.window.showInformationMessage('Synced with all peers');
    }

    public getBranchCommits(branchName?: string): DistributedCommit[] {
        const branch = branchName || this.currentBranch;
        const branchInfo = this.branches.get(branch);
        
        if (!branchInfo || !branchInfo.headCommitId) {
            return [];
        }

        const commits: DistributedCommit[] = [];
        let currentId = branchInfo.headCommitId;
        const visited = new Set<string>();
        
        while (currentId && !visited.has(currentId)) {
            const commit = this.commits.get(currentId);
            if (!commit) break;
            
            commits.push(commit);
            visited.add(currentId);
            
            // Follow first parent (simplified)
            currentId = commit.parentIds[0] || '';
        }
        
        return commits;
    }

    public getAllCommits(): DistributedCommit[] {
        return Array.from(this.commits.values())
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    public getBranches(): DistributedBranch[] {
        return Array.from(this.branches.values());
    }

    public getCurrentBranch(): string {
        return this.currentBranch;
    }

    public getStagedFiles(): CommitFile[] {
        return Array.from(this.stagingArea.values());
    }

    private generateCommitId(): string {
        return `commit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private async getAuthorName(): Promise<string {
        const config = vscode.workspace.getConfiguration('letscode');
        return config.get('userName', vscode.env.appHost);
    }

    private async signCommit(commitId: string): Promise<string> {
        // Simplified signature - in real implementation would use crypto
        return `sig-${this.myNodeId}-${commitId.substr(0, 8)}`;
    }

    private calculateChecksum(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    private broadcastCommit(commit: DistributedCommit): void {
        this.networkManager.broadcast({
            type: 'commit',
            sender: this.myNodeId,
            payload: commit,
            timestamp: Date.now()
        });
    }

    private handleRemoteCommit(commit: DistributedCommit): void {
        if (!this.commits.has(commit.id)) {
            this.commits.set(commit.id, commit);
            
            // Update branch if needed
            const branch = this.branches.get(commit.branch);
            if (branch && !branch.headCommitId) {
                branch.headCommitId = commit.id;
                this.branches.set(commit.branch, branch);
            }
            
            this.emit('remote-commit', commit);
            this.outputChannel.appendLine(`📥 Received commit from ${commit.authorName}: ${commit.message}`);
        }
    }

    private handleCommitRequest(payload: any): void {
        if (payload.requestType === 'all-commits') {
            const commits = this.getBranchCommits(payload.branch);
            for (const commit of commits) {
                this.broadcastCommit(commit);
            }
        }
    }

    private async saveState(): Promise<void> {
        await this.context.globalState.update('dvcs-commits', Array.from(this.commits.values()));
        await this.context.globalState.update('dvcs-branches', Array.from(this.branches.values()));
        await this.context.globalState.update('dvcs-history', Array.from(this.fileHistory.values()));
        await this.context.globalState.update('dvcs-current-branch', this.currentBranch);
    }

    private updateStatusBar(): void {
        const stagedCount = this.stagingArea.size;
        const commitCount = this.commits.size;
        const branchName = this.currentBranch;
        
        this.statusBarItem.text = `$(git-branch) ${branchName} | +${stagedCount} | $(git-commit) ${commitCount}`;
        this.statusBarItem.tooltip = `Branch: ${branchName}\n${stagedCount} files staged\n${commitCount} commits`;
        this.statusBarItem.show();
    }

    public dispose(): void {
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    }
}
