import * as vscode from 'vscode';
import { P2PCollaborationProvider, Peer } from './p2pProvider';
import { ChatManager } from './chatManager';

interface SessionHistory {
    sessionId: string;
    timestamp: number;
    peers: string[];
    filesSynced: number;
    duration: number;
}

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'letscode.sidebarView';
    private _view?: vscode.WebviewView;
    private sessionHistory: SessionHistory[] = [];
    private sessionStartTime?: number;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly p2pProvider: P2PCollaborationProvider,
        private readonly chatManager: ChatManager
    ) {
        // Listen for peer events
        this.p2pProvider.onPeerConnect(() => this.updateWebview());
        this.p2pProvider.onPeerDisconnect(() => this.updateWebview());
        
        // Track session history
        this.loadSessionHistory();
        
        // Listen for session changes
        this.p2pProvider.onPeerConnect(() => {
            if (!this.sessionStartTime) {
                this.sessionStartTime = Date.now();
            }
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

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'createSession':
                    await vscode.commands.executeCommand('letscode.createSession');
                    break;
                case 'joinSession':
                    await vscode.commands.executeCommand('letscode.joinSession');
                    break;
                case 'leaveSession':
                    await vscode.commands.executeCommand('letscode.leaveSession');
                    break;
                case 'copySessionId':
                    await vscode.commands.executeCommand('letscode.copySessionId');
                    break;
                case 'sendMessage':
                    await vscode.commands.executeCommand('letscode.sendChatMessage');
                    break;
                case 'openChat':
                    await vscode.commands.executeCommand('letscode.openChat');
                    break;
                case 'openTaskBoard':
                    await vscode.commands.executeCommand('letscode.openTaskBoard');
                    break;
                case 'openDashboard':
                    await vscode.commands.executeCommand('letscode.openDashboard');
                    break;
                case 'syncFiles':
                    await vscode.commands.executeCommand('letscode.syncFiles');
                    break;
                case 'openWhiteboard':
                    await vscode.commands.executeCommand('letscode.openWhiteboard');
                    break;
                case 'shareTerminal':
                    await vscode.commands.executeCommand('letscode.shareTerminal');
                    break;
                case 'shareCurrentFile':
                    {
                        const editor = vscode.window.activeTextEditor;
                        if (editor) {
                            await vscode.commands.executeCommand('letscode.shareFile', editor.document.uri);
                        } else {
                            vscode.window.showWarningMessage('No file is currently open');
                        }
                    }
                    break;
                case 'shareAllOpenFiles':
                    {
                        const uris = vscode.window.tabGroups.all
                            .flatMap(group => group.tabs)
                            .filter(tab => tab.input instanceof vscode.TabInputText)
                            .map(tab => (tab.input as vscode.TabInputText).uri);
                        if (uris.length > 0) {
                            for (const uri of uris) {
                                await vscode.commands.executeCommand('letscode.shareFile', uri);
                            }
                            vscode.window.showInformationMessage(`Shared ${uris.length} files`);
                        } else {
                            vscode.window.showWarningMessage('No files are currently open');
                        }
                    }
                    break;
                case 'shareSpecificFile':
                    {
                        const uri = vscode.Uri.file(message.filePath);
                        await vscode.commands.executeCommand('letscode.shareFile', uri);
                    }
                    break;
                case 'shareCodeSnippet':
                    {
                        await this.chatManager.sendMessage(`\`\`\`\n${message.code}\n\`\`\``, 'text');
                        vscode.window.showInformationMessage('Code snippet shared!');
                    }
                    break;
                case 'shareConnectionInfo':
                    {
                        const sessionId = this.p2pProvider.getSessionId();
                        const connectionInfo = this.p2pProvider.getConnectionInfo();
                        const shareText = `Join my Let's Code session!\n\nSession ID: ${sessionId}\nIP: ${connectionInfo?.ip || 'N/A'}\nPort: ${connectionInfo?.port || 'N/A'}\n\nInstall Let's Code extension and click "Join Session"`;
                        await vscode.env.clipboard.writeText(shareText);
                        vscode.window.showInformationMessage('Connection details copied! Share with your team.');
                    }
                    break;
                case 'requestActiveFiles':
                    {
                        const files = vscode.window.tabGroups.all
                            .flatMap(group => group.tabs)
                            .filter(tab => tab.input instanceof vscode.TabInputText)
                            .map(tab => {
                                const input = tab.input as vscode.TabInputText;
                                return {
                                    name: input.uri.path.split('/').pop() || 'unknown',
                                    path: input.uri.fsPath
                                };
                            });
                        webviewView.webview.postMessage({ type: 'activeFiles', files });
                    }
                    break;
            }
        });
    }

    updateWebview(): void {
        if (this._view) {
            this._view.webview.html = this.getHtmlForWebview(this._view.webview);
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const sessionId = this.p2pProvider.getSessionId();
        const isHost = this.p2pProvider.isSessionHost();
        const peers = this.p2pProvider.getPeers();
        const connectionInfo = this.p2pProvider.getConnectionInfo();
        const recentHistory = this.sessionHistory.slice(-5).reverse();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Let's Code</title>
    <style>
        :root {
            --primary: #f02882;
            --primary-hover: #d01a6e;
            --bg-primary: #4a4547;
            --bg-secondary: #424242;
            --bg-tertiary: #3a3537;
            --text-primary: #ffffff;
            --text-secondary: #949494;
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
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 18px;
            font-weight: 600;
            background: linear-gradient(135deg, #f02882, #d01a6e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
        }

        .header p {
            font-size: 12px;
            color: var(--text-secondary);
        }

        .status {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${sessionId ? '#10b981' : '#949494'};
            animation: ${sessionId ? 'pulse 2s infinite' : 'none'};
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .status-text {
            font-size: 13px;
            font-weight: 500;
            color: #ffffff;
        }

        .session-id {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: var(--text-secondary);
            background: var(--bg-tertiary);
            padding: 4px 8px;
            border-radius: 6px;
            display: inline-block;
        }

        .connection-card {
            background: linear-gradient(135deg, rgba(240, 40, 130, 0.15), rgba(66, 66, 66, 0.8));
            border: 2px solid #f02882;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 4px 20px rgba(240, 40, 130, 0.2);
        }

        .connection-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-size: 13px;
            font-weight: 600;
            color: #f02882;
            text-shadow: 0 0 10px rgba(240, 40, 130, 0.3);
        }

        .connection-card-header .live-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--success);
            animation: pulse 2s infinite;
        }

        .connection-id-box {
            background: #424242;
            border: 2px solid #f02882;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            word-break: break-all;
            text-align: center;
            letter-spacing: 0.5px;
            box-shadow: 0 0 15px rgba(240, 40, 130, 0.15);
        }

        .connection-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 12px;
        }

        .connection-detail-item {
            background: #424242;
            padding: 8px 10px;
            border-radius: 6px;
            font-size: 11px;
            border: 1px solid #949494;
        }

        .connection-detail-label {
            color: #949494;
            font-size: 10px;
            margin-bottom: 2px;
        }

        .connection-detail-value {
            color: #ffffff;
            font-weight: 500;
        }

        .connection-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .btn-copy {
            background: #424242;
            color: #ffffff;
            border: 1px solid #949494;
        }

        .btn-copy:hover {
            background: #f02882;
            border-color: #f02882;
        }

        .btn-share {
            background: linear-gradient(135deg, #f02882, #d01a6e);
            color: white;
            font-weight: 600;
        }

        .btn-share:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(240, 40, 130, 0.4);
        }

        .btn-small {
            padding: 8px 12px;
            font-size: 12px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }

        .btn {
            width: 100%;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #f02882, #d01a6e);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(240, 40, 130, 0.4);
        }

        .btn-secondary {
            background: #424242;
            color: #ffffff;
            border: 1px solid #949494;
        }

        .btn-secondary:hover {
            background: #f02882;
            border-color: #f02882;
        }

        .btn-danger {
            background: rgba(240, 40, 130, 0.2);
            color: #f02882;
            border: 1px solid rgba(240, 40, 130, 0.5);
        }

        .btn-danger:hover {
            background: #f02882;
            color: white;
        }

        .section {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .section-title {
            font-size: 11px;
            font-weight: 600;
            color: #f02882;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .peers-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .peer-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            background: #424242;
            border-radius: 6px;
            font-size: 12px;
            border: 1px solid #949494;
        }

        .peer-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f02882, #d01a6e);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
            color: white;
        }

        .peer-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #f02882;
            margin-left: auto;
            box-shadow: 0 0 8px rgba(240, 40, 130, 0.6);
        }

        .history-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .history-item {
            background: #424242;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 6px;
            font-size: 12px;
            border: 1px solid #949494;
        }

        .history-item:hover {
            border-color: #f02882;
        }

        .history-id {
            font-family: monospace;
            color: #f02882;
            font-size: 11px;
            margin-bottom: 4px;
            font-weight: 600;
        }

        .history-meta {
            color: #949494;
            font-size: 10px;
        }

        .files-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
            max-height: 150px;
            overflow-y: auto;
        }

        .file-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: #424242;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 4px;
            border: 1px solid #949494;
        }

        .file-item:hover {
            border-color: #f02882;
        }

        .file-icon {
            font-size: 14px;
        }

        .file-name {
            flex: 1;
            color: #ffffff;
        }

        .file-share-btn {
            background: linear-gradient(135deg, #f02882, #d01a6e);
            color: white;
            border: none;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .file-share-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(240, 40, 130, 0.4);
        }

        .code-input {
            width: 100%;
            min-height: 80px;
            padding: 10px;
            background: #424242;
            border: 1px solid #949494;
            border-radius: 8px;
            color: #ffffff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }

        .code-input:focus {
            border-color: #f02882;
            outline: none;
            box-shadow: 0 0 8px rgba(240, 40, 130, 0.3);
        }

        .connection-info {
            font-size: 11px;
            color: #949494;
            margin-top: 8px;
        }

        .icon::before {
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Let's Code</h1>
        <p>P2P Collaborative Coding</p>
    </div>

    ${!sessionId ? `
    <div class="status" style="margin-bottom: 16px;">
        <div class="status-indicator">
            <div class="status-dot" style="background: var(--text-secondary); animation: none;"></div>
            <span class="status-text">Not Connected</span>
        </div>
    </div>
    
    <button class="btn btn-primary" onclick="createSession()">
        ⚡ Create New Session
    </button>
    <button class="btn btn-secondary" onclick="joinSession()">
        🔗 Join Existing Session
    </button>
    ` : `
    
    <!-- Connection Card - Prominent Display -->
    <div class="connection-card">
        <div class="connection-card-header">
            <div class="live-indicator"></div>
            <span>${isHost ? '🔥 Hosting Session' : '🔗 Connected to Session'}</span>
        </div>
        
        <div class="connection-id-box" id="sessionIdBox">
            ${sessionId}
        </div>
        
        <div class="connection-details">
            <div class="connection-detail-item">
                <div class="connection-detail-label">IP Address</div>
                <div class="connection-detail-value">${connectionInfo ? connectionInfo.ip : 'Detecting...'}</div>
            </div>
            <div class="connection-detail-item">
                <div class="connection-detail-label">Port</div>
                <div class="connection-detail-value">${connectionInfo ? connectionInfo.port : '---'}</div>
            </div>
            <div class="connection-detail-item">
                <div class="connection-detail-label">Peers</div>
                <div class="connection-detail-value">${peers.length} online</div>
            </div>
            <div class="connection-detail-item">
                <div class="connection-detail-label">Your Node</div>
                <div class="connection-detail-value">${this.p2pProvider.getMyNodeId().substr(0, 8)}</div>
            </div>
        </div>
        
        <div class="connection-actions">
            <button class="btn-small btn-copy" onclick="copySessionId()" title="Copy Session ID to clipboard">
                � Copy ID
            </button>
            <button class="btn-small btn-share" onclick="shareConnectionInfo()" title="Share connection details">
                � Share
            </button>
        </div>
    </div>
    
    <button class="btn btn-secondary" onclick="shareCurrentFile()">
        📄 Share Current File
    </button>
    <button class="btn btn-secondary" onclick="shareAllOpenFiles()">
        � Share All Open Files
    </button>
    <button class="btn btn-secondary" onclick="syncFiles()">
        �� Sync Files
    </button>
    <button class="btn btn-secondary" onclick="openChat()">
        💬 Open Chat
    </button>
    <button class="btn btn-secondary" onclick="openTaskBoard()">
        📋 Task Board
    </button>
    <button class="btn btn-secondary" onclick="openDashboard()">
        📊 Dashboard
    </button>
    <button class="btn btn-secondary" onclick="openWhiteboard()">
        🎨 Whiteboard
    </button>
    <button class="btn btn-secondary" onclick="shareTerminal()">
        💻 Share Terminal
    </button>
    <button class="btn btn-danger" onclick="leaveSession()">
        ❌ Leave Session
    </button>

    <div class="section">
        <div class="section-title">Session History (${this.sessionHistory.length} sessions)</div>
        <div class="history-list">
            ${recentHistory.length === 0 ? '<div style="color: var(--text-secondary); font-size: 12px; text-align: center;">No previous sessions</div>' : ''}
            ${recentHistory.map(h => `
                <div class="history-item">
                    <div class="history-id">${h.sessionId.substr(0, 12)}...</div>
                    <div class="history-meta">${new Date(h.timestamp).toLocaleDateString()} • ${h.peers.length} peers • ${Math.round(h.duration / 60000)}m</div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Active Files to Share</div>
        <div class="files-list" id="activeFilesList">
            <div style="color: var(--text-secondary); font-size: 12px; text-align: center;">Loading files...</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Code Snippet</div>
        <textarea id="codeSnippet" class="code-input" placeholder="Paste or type code to share..."></textarea>
        <button class="btn btn-secondary" style="margin-top: 8px;" onclick="shareCodeSnippet()">
            📤 Share Code
        </button>
    </div>

    <div class="section">
        <div class="section-title">Connected Peers (${peers.length})</div>
        <div class="peers-list">
            ${peers.length === 0 ? '<div style="color: var(--text-secondary); font-size: 12px; text-align: center;">No peers connected</div>' : ''}
            ${peers.map(peer => `
                <div class="peer-item">
                    <div class="peer-avatar">${(peer.name || peer.id).charAt(0).toUpperCase()}</div>
                    <span class="peer-name">${peer.name || peer.id}</span>
                    <div class="peer-status"></div>
                </div>
            `).join('')}
        </div>
    </div>
    `}

    <script>
        const vscode = acquireVsCodeApi();

        function createSession() {
            vscode.postMessage({ command: 'createSession' });
        }

        function joinSession() {
            vscode.postMessage({ command: 'joinSession' });
        }

        function leaveSession() {
            vscode.postMessage({ command: 'leaveSession' });
        }

        function copySessionId() {
            vscode.postMessage({ command: 'copySessionId' });
        }

        function shareConnectionInfo() {
            vscode.postMessage({ command: 'shareConnectionInfo' });
        }

        function sendMessage() {
            vscode.postMessage({ command: 'sendMessage' });
        }

        function openChat() {
            vscode.postMessage({ command: 'openChat' });
        }

        function openTaskBoard() {
            vscode.postMessage({ command: 'openTaskBoard' });
        }

        function openDashboard() {
            vscode.postMessage({ command: 'openDashboard' });
        }

        function syncFiles() {
            vscode.postMessage({ command: 'syncFiles' });
        }

        function shareCurrentFile() {
            vscode.postMessage({ command: 'shareCurrentFile' });
        }

        function shareAllOpenFiles() {
            vscode.postMessage({ command: 'shareAllOpenFiles' });
        }

        function shareCodeSnippet() {
            const code = document.getElementById('codeSnippet').value;
            if (code.trim()) {
                vscode.postMessage({ command: 'shareCodeSnippet', code: code });
                document.getElementById('codeSnippet').value = '';
            }
        }

        // Update active files list
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'activeFiles') {
                const container = document.getElementById('activeFilesList');
                if (message.files.length === 0) {
                    container.innerHTML = '<div style="color: var(--text-secondary); font-size: 12px; text-align: center;">No files open</div>';
                } else {
                    var html = '';
                    for (var i = 0; i < message.files.length; i++) {
                        var f = message.files[i];
                        html += '<div class="file-item">' +
                            '<span class="file-icon">📄</span>' +
                            '<span class="file-name">' + f.name + '</span>' +
                            '<button class="file-share-btn" onclick="shareSpecificFile(\'' + f.path + '\')">Share</button>' +
                        '</div>';
                    }
                    container.innerHTML = html;
                }
            }
        });

        function shareSpecificFile(filePath) {
            vscode.postMessage({ command: 'shareSpecificFile', filePath: filePath });
        }

        // Request active files on load
        vscode.postMessage({ command: 'requestActiveFiles' });

        function openWhiteboard() {
            vscode.postMessage({ command: 'openWhiteboard' });
        }

        function shareTerminal() {
            vscode.postMessage({ command: 'shareTerminal' });
        }
    </script>
</body>
</html>`;
    }

    private loadSessionHistory(): void {
        try {
            const stored = this.context.globalState.get<SessionHistory[]>('sessionHistory', []);
            this.sessionHistory = stored;
        } catch (err) {
            console.error('Failed to load session history:', err);
        }
    }

    private saveSessionHistory(): void {
        try {
            this.context.globalState.update('sessionHistory', this.sessionHistory);
        } catch (err) {
            console.error('Failed to save session history:', err);
        }
    }

    private addToHistory(sessionId: string, peers: string[]): void {
        if (!this.sessionStartTime) return;
        
        const duration = Date.now() - this.sessionStartTime;
        const history: SessionHistory = {
            sessionId,
            timestamp: Date.now(),
            peers,
            filesSynced: 0,
            duration
        };
        
        this.sessionHistory.push(history);
        // Keep only last 20 sessions
        if (this.sessionHistory.length > 20) {
            this.sessionHistory = this.sessionHistory.slice(-20);
        }
        
        this.saveSessionHistory();
    }

    dispose(): void {
        // Save current session to history if active
        const sessionId = this.p2pProvider.getSessionId();
        if (sessionId && this.sessionStartTime) {
            this.addToHistory(sessionId, this.p2pProvider.getPeers().map(p => p.id));
        }
    }
}
