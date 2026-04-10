import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as util from 'util';
import { P2PCollaborationProvider, Message } from './p2pProvider';

const exec = util.promisify(cp.exec);

export interface GitStatus {
    branch: string;
    ahead: number;
    behind: number;
    modified: string[];
    added: string[];
    deleted: string[];
    untracked: string[];
}

export class GitSyncManager implements vscode.Disposable {
    private enabled: boolean = true;
    private currentStatus: GitStatus | null = null;
    private statusBarItem: vscode.StatusBarItem;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.statusBarItem.command = 'letscode.toggleGitSync';
        this.updateStatusBar();

        this.p2pProvider.registerMessageHandler('git-status', (msg) => {
            this.handleRemoteGitStatus(msg);
        });

        // Periodically sync git status
        setInterval(() => {
            if (this.enabled && this.p2pProvider.isInSession()) {
                this.syncGitStatus();
            }
        }, 10000);

        // Sync on branch change
        this.context.subscriptions.push(
            vscode.workspace.onDidSaveTextDocument(() => {
                if (this.enabled && this.p2pProvider.isInSession()) {
                    this.syncGitStatus();
                }
            })
        );
    }

    toggle(): void {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            vscode.window.showInformationMessage('Git sync enabled');
            this.syncGitStatus();
        } else {
            vscode.window.showInformationMessage('Git sync disabled');
        }
        
        this.updateStatusBar();
    }

    async syncGitStatus(): Promise<void> {
        if (!this.p2pProvider.isInSession()) return;

        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) return;

            const gitStatus = await this.getGitStatus(workspaceFolder.uri.fsPath);
            this.currentStatus = gitStatus;

            this.p2pProvider.broadcastMessage({
                type: 'git-status',
                data: gitStatus,
                sender: this.p2pProvider.getMyPeerId(),
                timestamp: Date.now()
            });

            this.updateStatusBar();
        } catch (err) {
            // Not a git repository or git not available
        }
    }

    private async getGitStatus(cwd: string): Promise<GitStatus> {
        // Get current branch
        const { stdout: branchOutput } = await exec('git rev-parse --abbrev-ref HEAD', { cwd });
        const branch = branchOutput.trim();

        // Get ahead/behind
        let ahead = 0, behind = 0;
        try {
            const { stdout: revParse } = await exec('git rev-parse --abbrev-ref --symbolic-full-name @{u}', { cwd });
            const upstream = revParse.trim();
            const { stdout: revList } = await exec(`git rev-list --left-right --count ${branch}...${upstream}`, { cwd });
            const counts = revList.trim().split('\t');
            ahead = parseInt(counts[0]) || 0;
            behind = parseInt(counts[1]) || 0;
        } catch {
            // No upstream
        }

        // Get file status
        const { stdout: statusOutput } = await exec('git status --porcelain', { cwd });
        const lines = statusOutput.trim().split('\n').filter(l => l);

        const modified: string[] = [];
        const added: string[] = [];
        const deleted: string[] = [];
        const untracked: string[] = [];

        lines.forEach(line => {
            const status = line.substring(0, 2);
            const file = line.substring(3).trim();

            if (status.includes('M')) modified.push(file);
            if (status.includes('A')) added.push(file);
            if (status.includes('D')) deleted.push(file);
            if (status.includes('??')) untracked.push(file);
        });

        return { branch, ahead, behind, modified, added, deleted, untracked };
    }

    private handleRemoteGitStatus(message: Message): void {
        const status = message.data as GitStatus;
        const peers = this.p2pProvider.getPeers();
        const peer = peers.find(p => p.id === message.sender);
        
        // Notify if there are potential conflicts
        if (this.currentStatus && this.currentStatus.branch !== status.branch) {
            vscode.window.showWarningMessage(
                `${peer?.name || 'Peer'} is on branch "${status.branch}" while you're on "${this.currentStatus.branch}"`
            );
        }
    }

    private updateStatusBar(): void {
        if (!this.enabled) {
            this.statusBarItem.text = '$(git-branch) Git Sync: Off';
            this.statusBarItem.tooltip = 'Git synchronization is disabled';
        } else if (this.currentStatus) {
            const status = this.currentStatus;
            const syncIndicator = status.ahead > 0 || status.behind > 0 
                ? `↑${status.ahead}↓${status.behind}` 
                : '✓';
            const dirtyIndicator = status.modified.length > 0 ? '*' : '';
            
            this.statusBarItem.text = `$(git-branch) ${status.branch} ${syncIndicator}${dirtyIndicator}`;
            this.statusBarItem.tooltip = [
                `Branch: ${status.branch}`,
                `Ahead: ${status.ahead}, Behind: ${status.behind}`,
                `Modified: ${status.modified.length}`,
                `Added: ${status.added.length}`,
                `Deleted: ${status.deleted.length}`,
                '',
                'Click to toggle sync'
            ].join('\n');
        } else {
            this.statusBarItem.text = '$(git-branch) Git Sync: On';
            this.statusBarItem.tooltip = 'Git synchronization is enabled';
        }

        this.statusBarItem.show();
    }

    getCurrentStatus(): GitStatus | null {
        return this.currentStatus;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
