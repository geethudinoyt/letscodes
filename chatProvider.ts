import * as vscode from 'vscode';
import { P2PCollaborationProvider, Peer } from './p2pProvider';
import { ChatManager, ChatMessage } from './chatManager';

export class ChatProvider {
    public static readonly viewType = 'letscode.chatView';
    private _panel?: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly p2pProvider: P2PCollaborationProvider,
        private readonly chatManager: ChatManager
    ) {
        // Listen for new messages
        this.chatManager.onMessage((msg) => {
            this.postMessageToWebview({
                type: 'newMessage',
                message: msg
            });
        });

        // Listen for peer changes
        this.p2pProvider.onPeerConnect(() => this.updatePeerList());
        this.p2pProvider.onPeerDisconnect(() => this.updatePeerList());
    }

    public show(): void {
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.Beside);
        } else {
            this.createPanel();
        }
    }

    private createPanel(): void {
        this._panel = vscode.window.createWebviewPanel(
            ChatProvider.viewType,
            'Let\'s Code - Team Chat',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.context.extensionUri]
            }
        );

        this._panel.webview.html = this.getHtmlForWebview(this._panel.webview);

        this._panel.onDidDispose(() => {
            this._panel = undefined;
        }, null, this.disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        this.chatManager.sendMessage(message.text, 'text');
                        break;
                    case 'sendFile':
                        const uris = await vscode.window.showOpenDialog({
                            canSelectFiles: true,
                            canSelectFolders: false,
                            canSelectMany: false
                        });
                        if (uris && uris[0]) {
                            const content = await vscode.workspace.fs.readFile(uris[0]);
                            const base64 = Buffer.from(content).toString('base64');
                            this.chatManager.sendFileMessage(
                                uris[0].fsPath.split(/[\\/]/).pop() || 'file',
                                base64
                            );
                        }
                        break;
                    case 'requestHistory':
                        this.sendMessageHistory();
                        break;
                    case 'requestPeers':
                        this.updatePeerList();
                        break;
                    case 'clearChat':
                        this.chatManager.clearHistory();
                        this.sendMessageHistory();
                        break;
                }
            },
            undefined,
            this.disposables
        );

        // Send initial data
        this.sendMessageHistory();
        this.updatePeerList();
        this.updateConnectionStatus();
    }

    private sendMessageHistory(): void {
        const messages = this.chatManager.getMessages();
        this.postMessageToWebview({
            type: 'messageHistory',
            messages: messages
        });
    }

    private updatePeerList(): void {
        const peers = this.p2pProvider.getPeers();
        const me = this.p2pProvider.getMyPeerId();
        const config = vscode.workspace.getConfiguration('letscode');
        const myName = config.get<string>('username') || 'Me';
        
        this.postMessageToWebview({
            type: 'peerList',
            peers: [
                { id: me, name: myName, isMe: true },
                ...peers.map((p: Peer) => ({ id: p.id, name: p.name || `Peer ${p.id.substr(0, 6)}`, isMe: false }))
            ]
        });
    }

    private updateConnectionStatus(): void {
        const sessionId = this.p2pProvider.getSessionId();
        const isHost = this.p2pProvider.isSessionHost();
        
        this.postMessageToWebview({
            type: 'connectionStatus',
            connected: !!sessionId,
            sessionId: sessionId || null,
            isHost: isHost
        });
    }

    private postMessageToWebview(message: any): void {
        if (this._panel) {
            this._panel.webview.postMessage(message);
        }
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        if (this._panel) {
            this._panel.dispose();
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const sessionId = this.p2pProvider.getSessionId();
        const messages = this.chatManager.getMessages();
        const peers = this.p2pProvider.getPeers();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Let's Code - Chat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --bg-hover: #475569;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #6366f1;
            --accent-hover: #4f46e5;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            --border: rgba(255, 255, 255, 0.1);
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .header {
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border);
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .header-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .connection-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .connection-badge.connected {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success);
        }

        .connection-badge.disconnected {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error);
        }

        .header-actions {
            display: flex;
            gap: 8px;
        }

        .icon-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .icon-btn:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        .peer-list {
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border);
            padding: 8px 16px;
            display: flex;
            gap: 8px;
            overflow-x: auto;
            scrollbar-width: none;
        }

        .peer-list::-webkit-scrollbar {
            display: none;
        }

        .peer-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: var(--bg-tertiary);
            border-radius: 20px;
            font-size: 12px;
            white-space: nowrap;
        }

        .peer-chip.me {
            background: var(--accent);
            color: white;
        }

        .peer-avatar {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
        }

        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .message {
            max-width: 85%;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
        }

        .message-sender {
            font-size: 12px;
            font-weight: 600;
            color: var(--accent);
        }

        .message-time {
            font-size: 11px;
            color: var(--text-secondary);
        }

        .message-bubble {
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .message.me .message-bubble {
            background: var(--accent);
            color: white;
            border-bottom-right-radius: 4px;
        }

        .message.other .message-bubble {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border-bottom-left-radius: 4px;
        }

        .message.system {
            align-self: center;
            max-width: 100%;
        }

        .message.system .message-bubble {
            background: transparent;
            color: var(--text-secondary);
            font-size: 12px;
            font-style: italic;
            text-align: center;
        }

        .message.file .message-bubble {
            background: var(--bg-tertiary);
            border: 1px solid var(--accent);
        }

        .file-message {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .file-icon {
            font-size: 20px;
        }

        .input-container {
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            padding: 12px 16px;
            display: flex;
            gap: 8px;
            align-items: flex-end;
        }

        .message-input {
            flex: 1;
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 10px 16px;
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
            resize: none;
            min-height: 40px;
            max-height: 120px;
            font-family: inherit;
        }

        .message-input:focus {
            border-color: var(--accent);
        }

        .message-input::placeholder {
            color: var(--text-secondary);
        }

        .send-btn, .attach-btn {
            background: var(--accent);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
        }

        .send-btn:hover {
            background: var(--accent-hover);
            transform: scale(1.05);
        }

        .send-btn:disabled {
            background: var(--bg-tertiary);
            cursor: not-allowed;
            transform: none;
        }

        .attach-btn {
            background: var(--bg-tertiary);
        }

        .attach-btn:hover {
            background: var(--bg-hover);
        }

        .empty-state {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            text-align: center;
            padding: 32px;
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        .empty-state-text {
            font-size: 14px;
        }

        .typing-indicator {
            padding: 8px 16px;
            font-size: 12px;
            color: var(--text-secondary);
            font-style: italic;
            height: 24px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <span class="header-title">💬 Team Chat</span>
            <span id="connectionBadge" class="connection-badge disconnected">Offline</span>
        </div>
        <div class="header-actions">
            <button class="icon-btn" id="clearBtn" title="Clear chat">🗑️</button>
            <button class="icon-btn" id="refreshBtn" title="Refresh">🔄</button>
        </div>
    </div>

    <div class="peer-list" id="peerList">
        <div class="peer-chip me">
            <span class="peer-avatar">👤</span>
            <span>Me</span>
        </div>
    </div>

    <div class="messages-container" id="messagesContainer">
        <div class="empty-state" id="emptyState">
            <div class="empty-state-icon">💬</div>
            <div class="empty-state-text">No messages yet.<br>Start the conversation!</div>
        </div>
    </div>

    <div class="typing-indicator" id="typingIndicator"></div>

    <div class="input-container">
        <button class="attach-btn" id="attachBtn" title="Share file">📎</button>
        <textarea 
            class="message-input" 
            id="messageInput" 
            placeholder="Type a message..."
            rows="1"
        ></textarea>
        <button class="send-btn" id="sendBtn">➤</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messagesContainer');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const attachBtn = document.getElementById('attachBtn');
        const peerList = document.getElementById('peerList');
        const connectionBadge = document.getElementById('connectionBadge');
        const emptyState = document.getElementById('emptyState');
        const typingIndicator = document.getElementById('typingIndicator');
        const clearBtn = document.getElementById('clearBtn');
        const refreshBtn = document.getElementById('refreshBtn');

        let messages = [];
        let currentUserId = '';

        // Request initial data
        vscode.postMessage({ command: 'requestHistory' });
        vscode.postMessage({ command: 'requestPeers' });

        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Send message on Enter (Shift+Enter for new line)
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendBtn.addEventListener('click', sendMessage);

        attachBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'sendFile' });
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Clear all chat history?')) {
                vscode.postMessage({ command: 'clearChat' });
            }
        });

        refreshBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'requestHistory' });
            vscode.postMessage({ command: 'requestPeers' });
        });

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            vscode.postMessage({
                command: 'sendMessage',
                text: text
            });

            messageInput.value = '';
            messageInput.style.height = 'auto';
        }

        function formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        function renderMessage(msg) {
            const messageEl = document.createElement('div');
            messageEl.className = 'message';
            
            if (msg.type === 'system') {
                messageEl.classList.add('system');
                messageEl.innerHTML = '<div class="message-bubble">' + msg.text + '</div>';
            } else {
                const isMe = msg.sender === currentUserId || msg.sender === 'system' && msg.senderName === 'Me';
                messageEl.classList.add(isMe ? 'me' : 'other');
                if (msg.type === 'file') {
                    messageEl.classList.add('file');
                }

                var bubbleContent = msg.type === 'file' 
                    ? '<div class="file-message">📄 <span>' + msg.text + '</span></div>'
                    : msg.text;
                messageEl.innerHTML = '<div class="message-header"><span class="message-sender">' + msg.senderName + '</span><span class="message-time">' + formatTime(msg.timestamp) + '</span></div><div class="message-bubble">' + bubbleContent + '</div>';
            }

            return messageEl;
        }

        function renderMessages() {
            if (messages.length === 0) {
                emptyState.style.display = 'flex';
                messagesContainer.innerHTML = '';
                messagesContainer.appendChild(emptyState);
                return;
            }

            emptyState.style.display = 'none';
            messagesContainer.innerHTML = '';
            
            messages.forEach(msg => {
                messagesContainer.appendChild(renderMessage(msg));
            });

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function updatePeerList(peers) {
            const me = peers.find(p => p.isMe);
            if (me) currentUserId = me.id;

            peerList.innerHTML = peers.map(peer => 
                '<div class="peer-chip ' + (peer.isMe ? 'me' : '') + '">' +
                    '<span class="peer-avatar">' + (peer.isMe ? '👤' : '👥') + '</span>' +
                    '<span>' + peer.name + '</span>' +
                '</div>'
            ).join('');
        }

        function updateConnectionStatus(status) {
            if (status.connected) {
                connectionBadge.textContent = status.isHost ? 'Host' : 'Connected';
                connectionBadge.className = 'connection-badge connected';
                sendBtn.disabled = false;
            } else {
                connectionBadge.textContent = 'Offline';
                connectionBadge.className = 'connection-badge disconnected';
                sendBtn.disabled = true;
            }
        }

        // Handle messages from extension
        window.addEventListener('message', (event) => {
            const message = event.data;

            switch (message.type) {
                case 'messageHistory':
                    messages = message.messages || [];
                    renderMessages();
                    break;
                case 'newMessage':
                    messages.push(message.message);
                    if (messages.length > 100) messages.shift();
                    renderMessages();
                    break;
                case 'peerList':
                    updatePeerList(message.peers);
                    break;
                case 'connectionStatus':
                    updateConnectionStatus(message);
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}
