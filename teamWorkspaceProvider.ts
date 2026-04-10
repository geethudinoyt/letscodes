import * as vscode from 'vscode';
import { P2PNetworkManager, NetworkPeer, DistributedFile } from './p2pNetworkManager';
import { DistributedVersionControl, DistributedCommit } from './distributedVersionControl';

export interface TeamActivity {
    id: string;
    type: 'file-edit' | 'commit' | 'peer-join' | 'peer-leave' | 'chat' | 'terminal';
    user: string;
    userName: string;
    description: string;
    timestamp: number;
    details?: any;
}

export interface TeamStats {
    totalPeers: number;
    onlinePeers: number;
    totalFiles: number;
    totalCommits: number;
    storageUsed: number;
    storageAvailable: number;
    networkStorage: number;
    activeNow: number;
}

export class TeamWorkspaceProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'letscode.teamWorkspace';
    private _view?: vscode.WebviewView;
    private activities: TeamActivity[] = [];
    private disposables: vscode.Disposable[] = [];

    constructor(
        private context: vscode.ExtensionContext,
        private networkManager: P2PNetworkManager,
        private dvcs: DistributedVersionControl
    ) {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Listen for network events
        this.networkManager.on('peer-connected', (peer: NetworkPeer) => {
            this.addActivity({
                id: `activity-${Date.now()}`,
                type: 'peer-join',
                user: peer.id,
                userName: peer.name,
                description: `${peer.name} joined the team`,
                timestamp: Date.now()
            });
        });

        this.networkManager.on('file-received', (file: DistributedFile) => {
            this.addActivity({
                id: `activity-${Date.now()}`,
                type: 'file-edit',
                user: file.owner,
                userName: file.owner,
                description: `Shared file: ${file.name}`,
                timestamp: Date.now(),
                details: { fileId: file.id, fileName: file.name }
            });
        });

        this.dvcs.on('remote-commit', (commit: DistributedCommit) => {
            this.addActivity({
                id: `activity-${Date.now()}`,
                type: 'commit',
                user: commit.author,
                userName: commit.authorName,
                description: `Committed: ${commit.message}`,
                timestamp: Date.now(),
                details: { commitId: commit.id, message: commit.message }
            });
        });
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'refresh':
                        this.updateWebview();
                        break;
                    case 'openFile':
                        if (message.filePath) {
                            const doc = await vscode.workspace.openTextDocument(message.filePath);
                            await vscode.window.showTextDocument(doc);
                        }
                        break;
                    case 'showCommit':
                        if (message.commitId) {
                            const diff = await this.dvcs.showCommitDiff(message.commitId);
                            const panel = vscode.window.createWebviewPanel(
                                'commitDiff',
                                `Commit ${message.commitId.substr(0, 8)}`,
                                vscode.ViewColumn.One,
                                {}
                            );
                            panel.webview.html = `<pre>${diff}</pre>`;
                        }
                        break;
                    case 'syncAll':
                        await this.dvcs.syncWithPeers();
                        vscode.window.showInformationMessage('Synced with all peers');
                        break;
                    case 'createSession':
                        const sessionName = await vscode.window.showInputBox({ prompt: 'Team session name' });
                        if (sessionName) {
                            const sessionId = await this.networkManager.createTeamSession(sessionName);
                            vscode.window.showInformationMessage(`Created session: ${sessionId}`);
                        }
                        break;
                    case 'joinSession':
                        const sessionId = await vscode.window.showInputBox({ prompt: 'Enter session ID' });
                        if (sessionId) {
                            await this.networkManager.joinTeamSession(sessionId);
                        }
                        break;
                }
            },
            undefined,
            this.disposables
        );

        // Auto-refresh every 5 seconds
        setInterval(() => { this.updateWebview().catch(console.error); }, 5000);
    }

    private async addActivity(activity: TeamActivity): Promise<void> {
        this.activities.unshift(activity);
        if (this.activities.length > 50) {
            this.activities.pop();
        }
        await this.updateWebview();
    }

    private async updateWebview(): Promise<void> {
        if (this._view) {
            const stats = await this.getTeamStats();
            this._view.webview.postMessage({
                type: 'update',
                activities: this.activities,
                stats: stats,
                peers: this.networkManager.getOnlinePeers(),
                files: this.networkManager.getAllFiles(),
                commits: this.dvcs.getAllCommits(),
                branches: this.dvcs.getBranches()
            });
        }
    }

    private async getTeamStats(): Promise<TeamStats> {
        const stats = await this.networkManager.getNetworkStats();
        return {
            totalPeers: stats.peers,
            onlinePeers: stats.onlinePeers,
            totalFiles: stats.totalFiles,
            totalCommits: this.dvcs.getAllCommits().length,
            storageUsed: stats.storageUsed,
            storageAvailable: stats.storageAvailable,
            networkStorage: stats.networkStorage,
            activeNow: this.activities.filter(a => Date.now() - a.timestamp < 300000).length
        };
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Workspace</title>
    <style>
        :root {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --primary: #6366f1;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 16px;
            line-height: 1.5;
        }
        
        .header {
            margin-bottom: 20px;
        }
        
        .header h1 {
            font-size: 20px;
            margin-bottom: 8px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 24px;
        }
        
        .stat-card {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--primary);
        }
        
        .stat-label {
            font-size: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .section {
            margin-bottom: 24px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: opacity 0.2s;
        }
        
        .btn:hover {
            opacity: 0.9;
        }
        
        .btn-secondary {
            background: var(--bg-tertiary);
        }
        
        .activity-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .activity-item {
            background: var(--bg-secondary);
            border-radius: 8px;
            padding: 12px;
            font-size: 13px;
            border-left: 3px solid var(--primary);
        }
        
        .activity-item.commit {
            border-left-color: var(--success);
        }
        
        .activity-item.peer-join {
            border-left-color: var(--primary);
        }
        
        .activity-item.file-edit {
            border-left-color: var(--warning);
        }
        
        .activity-time {
            font-size: 11px;
            color: var(--text-secondary);
        }
        
        .activity-user {
            font-weight: 600;
            color: var(--primary);
        }
        
        .peer-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .peer-chip {
            background: var(--bg-secondary);
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .peer-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--success);
        }
        
        .file-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .file-item {
            background: var(--bg-secondary);
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        
        .file-item:hover {
            background: var(--bg-tertiary);
        }
        
        .commit-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .commit-item {
            background: var(--bg-secondary);
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
        }
        
        .commit-item:hover {
            background: var(--bg-tertiary);
        }
        
        .commit-id {
            font-family: monospace;
            color: var(--primary);
            font-size: 11px;
        }
        
        .commit-message {
            margin-top: 4px;
            color: var(--text-primary);
        }
        
        .commit-author {
            font-size: 11px;
            color: var(--text-secondary);
            margin-top: 2px;
        }
        
        .empty-state {
            text-align: center;
            color: var(--text-secondary);
            padding: 20px;
            font-size: 13px;
        }
        
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌐 Team Workspace</h1>
    </div>
    
    <div class="quick-actions">
        <button class="btn" onclick="createSession()">➕ Create Session</button>
        <button class="btn btn-secondary" onclick="joinSession()">🤝 Join Session</button>
        <button class="btn btn-secondary" onclick="syncAll()">🔄 Sync All</button>
        <button class="btn btn-secondary" onclick="refresh()">🔄 Refresh</button>
    </div>
    
    <div class="stats-grid" id="statsGrid">
        <div class="stat-card">
            <div class="stat-value" id="onlinePeers">0</div>
            <div class="stat-label">Online Peers</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="totalFiles">0</div>
            <div class="stat-label">Files</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="totalCommits">0</div>
            <div class="stat-label">Commits</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="storageMB">0</div>
            <div class="stat-label">MB Stored</div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">🔥 Recent Activity</div>
        <div class="activity-list" id="activityList">
            <div class="empty-state">No recent activity</div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">👥 Online Peers</div>
        <div class="peer-list" id="peerList">
            <div class="empty-state">No peers online</div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">📁 Recent Files</div>
        <div class="file-list" id="fileList">
            <div class="empty-state">No files shared</div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">📜 Recent Commits</div>
        <div class="commit-list" id="commitList">
            <div class="empty-state">No commits yet</div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function createSession() {
            vscode.postMessage({ command: 'createSession' });
        }
        
        function joinSession() {
            vscode.postMessage({ command: 'joinSession' });
        }
        
        function syncAll() {
            vscode.postMessage({ command: 'syncAll' });
        }
        
        function refresh() {
            vscode.postMessage({ command: 'refresh' });
        }
        
        function openFile(path) {
            vscode.postMessage({ command: 'openFile', filePath: path });
        }
        
        function showCommit(commitId) {
            vscode.postMessage({ command: 'showCommit', commitId: commitId });
        }
        
        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.type === 'update') {
                // Update stats
                document.getElementById('onlinePeers').textContent = message.stats.onlinePeers;
                document.getElementById('totalFiles').textContent = message.stats.totalFiles;
                document.getElementById('totalCommits').textContent = message.stats.totalCommits;
                document.getElementById('storageMB').textContent = Math.round(message.stats.storageUsed / 1024 / 1024);
                
                // Update activity
                const activityList = document.getElementById('activityList');
                if (message.activities.length === 0) {
                    activityList.innerHTML = '<div class="empty-state">No recent activity</div>';
                } else {
                    var activityHtml = '';
                    for (var i = 0; i < message.activities.length; i++) {
                        var a = message.activities[i];
                        activityHtml += '<div class="activity-item ' + a.type + '">' +
                            '<div><span class="activity-user">' + a.userName + '</span> ' + a.description + '</div>' +
                            '<div class="activity-time">' + new Date(a.timestamp).toLocaleTimeString() + '</div>' +
                        '</div>';
                    }
                    activityList.innerHTML = activityHtml;
                }
                
                // Update peers
                const peerList = document.getElementById('peerList');
                if (message.peers.length === 0) {
                    peerList.innerHTML = '<div class="empty-state">No peers online</div>';
                } else {
                    var peerHtml = '';
                    for (var i = 0; i < message.peers.length; i++) {
                        var p = message.peers[i];
                        peerHtml += '<div class="peer-chip">' +
                            '<div class="peer-status"></div>' +
                            p.name +
                        '</div>';
                    }
                    peerList.innerHTML = peerHtml;
                }
                
                // Update files
                const fileList = document.getElementById('fileList');
                const recentFiles = message.files.slice(0, 5);
                if (recentFiles.length === 0) {
                    fileList.innerHTML = '<div class="empty-state">No files shared</div>';
                } else {
                    var fileHtml = '';
                    for (var i = 0; i < recentFiles.length; i++) {
                        var f = recentFiles[i];
                        fileHtml += '<div class="file-item" onclick="openFile(\'' + f.path + '\')">' +
                            '<span>' + f.name + '</span>' +
                            '<span style="color: var(--text-secondary);">' + (f.size / 1024).toFixed(1) + ' KB</span>' +
                        '</div>';
                    }
                    fileList.innerHTML = fileHtml;
                }
                
                // Update commits
                const commitList = document.getElementById('commitList');
                const recentCommits = message.commits.slice(0, 5);
                if (recentCommits.length === 0) {
                    commitList.innerHTML = '<div class="empty-state">No commits yet</div>';
                } else {
                    var commitHtml = '';
                    for (var i = 0; i < recentCommits.length; i++) {
                        var c = recentCommits[i];
                        commitHtml += '<div class="commit-item" onclick="showCommit(\'' + c.id + '\')">' +
                            '<div class="commit-id">' + c.id.substr(0, 8) + '</div>' +
                            '<div class="commit-message">' + c.message + '</div>' +
                            '<div class="commit-author">' + c.authorName + ' • ' + new Date(c.timestamp).toLocaleDateString() + '</div>' +
                        '</div>';
                    }
                    commitList.innerHTML = commitHtml;
                }
            }
        });
    </script>
</body>
</html>`;
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}
