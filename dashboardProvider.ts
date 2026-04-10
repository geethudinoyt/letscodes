import * as vscode from 'vscode';
import { P2PCollaborationProvider } from './p2pProvider';

export interface ActivityData {
    edits: number;
    chatMessages: number;
    filesShared: number;
    timeSpent: number;
    startTime: number;
    copilotEdits: number;
}

export interface PeerActivity {
    peerId: string;
    peerName: string;
    edits: number;
    filesModified: string[];
    lastActive: number;
}

export class DashboardProvider implements vscode.Disposable {
    private panel: vscode.WebviewPanel | undefined;
    private activity: ActivityData = {
        edits: 0,
        chatMessages: 0,
        filesShared: 0,
        timeSpent: 0,
        startTime: Date.now(),
        copilotEdits: 0
    };
    private peerActivities: Map<string, PeerActivity> = new Map();
    private updateInterval: NodeJS.Timeout | undefined;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        // Track activity
        this.p2pProvider.onMessage(() => {
            this.activity.chatMessages++;
            this.updateDashboard();
        });

        // Start update interval
        this.updateInterval = setInterval(() => {
            this.activity.timeSpent = Date.now() - this.activity.startTime;
            this.updateDashboard();
        }, 5000);
    }

    show(): void {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'letscodeDashboard',
            'Activity Dashboard',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.updateDashboard();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    updateDashboard(): void {
        if (!this.panel) return;

        this.panel.webview.html = this.getHtmlForWebview();
        
        this.panel.webview.postMessage({
            command: 'updateData',
            data: {
                activity: this.activity,
                peers: Array.from(this.peerActivities.values()),
                sessionId: this.p2pProvider.getSessionId(),
                isHost: this.p2pProvider.isSessionHost(),
                connectedPeers: this.p2pProvider.getPeers().length
            }
        });
    }

    trackEdit(): void {
        this.activity.edits++;
        this.updateDashboard();
    }

    trackFileShare(): void {
        this.activity.filesShared++;
        this.updateDashboard();
    }

    trackCopilotEdit(): void {
        this.activity.copilotEdits++;
        this.updateDashboard();
    }

    updatePeerActivity(peerId: string, peerName: string, fileModified: string): void {
        const existing = this.peerActivities.get(peerId) || {
            peerId,
            peerName,
            edits: 0,
            filesModified: [],
            lastActive: Date.now()
        };

        existing.edits++;
        if (!existing.filesModified.includes(fileModified)) {
            existing.filesModified.push(fileModified);
        }
        existing.lastActive = Date.now();

        this.peerActivities.set(peerId, existing);
        this.updateDashboard();
    }

    private getHtmlForWebview(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activity Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            padding: 24px;
        }
        .header {
            margin-bottom: 24px;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            background: linear-gradient(135deg, #6366f1, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        .subtitle { color: #94a3b8; font-size: 14px; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .stat-card {
            background: #1e293b;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #6366f1;
            margin-bottom: 4px;
        }
        .stat-label {
            font-size: 13px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .section {
            background: #1e293b;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .peer-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #334155;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        .peer-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6366f1, #ec4899);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 16px;
        }
        .peer-info { flex: 1; }
        .peer-name { font-weight: 500; font-size: 14px; }
        .peer-stats { font-size: 12px; color: #94a3b8; }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
        }
        .status-host { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
        .status-peer { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .progress-bar {
            height: 8px;
            background: #334155;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            border-radius: 4px;
            transition: width 0.3s;
        }
        .time-display {
            font-family: 'Courier New', monospace;
            font-size: 28px;
            color: #f8fafc;
            text-align: center;
            margin: 16px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Activity Dashboard</h1>
        <p class="subtitle">Real-time collaboration metrics</p>
    </div>

    <div class="time-display" id="timer">00:00:00</div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value" id="totalEdits">0</div>
            <div class="stat-label">Total Edits</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="chatMessages">0</div>
            <div class="stat-label">Chat Messages</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="filesShared">0</div>
            <div class="stat-label">Files Shared</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="copilotEdits">0</div>
            <div class="stat-label">AI Suggestions</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">
            👥 Team Activity
            <span id="peerCount" style="margin-left: auto; font-size: 12px; color: #94a3b8;">0 connected</span>
        </div>
        <div id="peerList"></div>
    </div>

    <div class="section">
        <div class="section-title">📈 Session Progress</div>
        <div class="progress-bar">
            <div class="progress-fill" id="progressFill" style="width: 0%"></div>
        </div>
        <p style="margin-top: 8px; font-size: 12px; color: #94a3b8; text-align: center;">
            Based on edit activity and file modifications
        </p>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function formatTime(ms) {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / 60000) % 60);
            const hours = Math.floor(ms / 3600000);
            return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateData') {
                const { activity, peers, sessionId, isHost, connectedPeers } = message.data;

                document.getElementById('totalEdits').textContent = activity.edits;
                document.getElementById('chatMessages').textContent = activity.chatMessages;
                document.getElementById('filesShared').textContent = activity.filesShared;
                document.getElementById('copilotEdits').textContent = activity.copilotEdits;
                document.getElementById('timer').textContent = formatTime(activity.timeSpent);
                document.getElementById('peerCount').textContent = \`\${connectedPeers} connected\`;

                const peerList = document.getElementById('peerList');
                peerList.innerHTML = peers.map(peer => \`
                    <div class="peer-item">
                        <div class="peer-avatar">\${(peer.peerName || peer.peerId).charAt(0).toUpperCase()}</div>
                        <div class="peer-info">
                            <div class="peer-name">\${peer.peerName || peer.peerId}</div>
                            <div class="peer-stats">\${peer.edits} edits • \${peer.filesModified.length} files</div>
                        </div>
                        <div class="status-badge \${peer.peerId === 'self' ? 'status-host' : 'status-peer'}">
                            \${peer.peerId === 'self' ? 'You' : 'Active'}
                        </div>
                    </div>
                \`).join('');

                // Calculate progress based on activity
                const progress = Math.min(100, (activity.edits + activity.filesShared * 5) / 2);
                document.getElementById('progressFill').style.width = \`\${progress}%\`;
            }
        });

        // Update timer every second
        setInterval(() => {
            const timerEl = document.getElementById('timer');
            const parts = timerEl.textContent.split(':');
            let [hours, minutes, seconds] = parts.map(Number);
            seconds++;
            if (seconds >= 60) { seconds = 0; minutes++; }
            if (minutes >= 60) { minutes = 0; hours++; }
            timerEl.textContent = \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }, 1000);
    </script>
</body>
</html>`;
    }

    dispose(): void {
        this.panel?.dispose();
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}
