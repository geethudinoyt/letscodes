import * as vscode from 'vscode';
import { P2PCollaborationProvider, Peer } from './p2pProvider';
import { SidebarProvider } from './sidebarProvider';
import { DocumentSync } from './documentSync';
import { ChatManager, ChatMessage } from './chatManager';
import { CursorTracker } from './cursorTracker';
import { TerminalSharing } from './terminalSharing';
import { TaskBoardProvider } from './taskBoardProvider';
import { CodeReviewProvider } from './codeReviewProvider';
import { WhiteboardProvider } from './whiteboardProvider';
import { DashboardProvider } from './dashboardProvider';
import { FileSyncManager } from './fileSyncManager';
import { GitSyncManager } from './gitSyncManager';
import { CopilotTracker } from './copilotTracker';
import { SessionPersistence } from './sessionPersistence';
import { EncryptionManager } from './encryptionManager';
import { ProjectUpdateManager } from './projectUpdateManager';
import { ChatProvider } from './chatProvider';
import { AutoSyncManager } from './autoSyncManager';
import { FileHistoryManager } from './fileHistoryManager';
import { ExtensionRecommendationProvider } from './extensionRecommendationProvider';

let p2pProvider: P2PCollaborationProvider;
let sidebarProvider: SidebarProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('Let\'s Code extension is now active');
    
    // Initialize core providers
    p2pProvider = new P2PCollaborationProvider(context);
    const chatManager = new ChatManager(p2pProvider, context);
    sidebarProvider = new SidebarProvider(context, p2pProvider, chatManager);
    
    const documentSync = new DocumentSync(p2pProvider, context);
    const cursorTracker = new CursorTracker(p2pProvider, context);
    const terminalSharing = new TerminalSharing(p2pProvider, context);
    const taskBoardProvider = new TaskBoardProvider(p2pProvider, context);
    const codeReviewProvider = new CodeReviewProvider(p2pProvider, context);
    const whiteboardProvider = new WhiteboardProvider(p2pProvider, context);
    const dashboardProvider = new DashboardProvider(p2pProvider, context);
    const fileSyncManager = new FileSyncManager(p2pProvider, context);
    const gitSyncManager = new GitSyncManager(p2pProvider, context);
    const copilotTracker = new CopilotTracker(p2pProvider, context);
    const sessionPersistence = new SessionPersistence(p2pProvider, context);
    const encryptionManager = new EncryptionManager(context);
    const projectUpdateManager = new ProjectUpdateManager(p2pProvider, context);
    const chatProvider = new ChatProvider(context, p2pProvider, chatManager);
    const autoSyncManager = new AutoSyncManager(p2pProvider, context);
    const fileHistoryManager = new FileHistoryManager(p2pProvider, context);
    const extensionRecommendationProvider = new ExtensionRecommendationProvider(p2pProvider, context);

    // Register sidebar webview
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('letscode.sidebarView', sidebarProvider, {
            webviewOptions: { retainContextWhenHidden: true }
        })
    );

    // Register commands
    registerCommands(context, {
        p2pProvider,
        sidebarProvider,
        documentSync,
        chatManager,
        cursorTracker,
        terminalSharing,
        taskBoardProvider,
        codeReviewProvider,
        whiteboardProvider,
        dashboardProvider,
        fileSyncManager,
        gitSyncManager,
        copilotTracker,
        sessionPersistence,
        encryptionManager,
        projectUpdateManager,
        chatProvider,
        autoSyncManager,
        fileHistoryManager,
        extensionRecommendationProvider
    });

    // Set up event listeners
    setupEventListeners(context, p2pProvider, documentSync, cursorTracker);

    // Restore session if available
    sessionPersistence.restoreSessionIfNeeded();
}

function registerCommands(
    context: vscode.ExtensionContext,
    providers: {
        p2pProvider: P2PCollaborationProvider;
        sidebarProvider: SidebarProvider;
        documentSync: DocumentSync;
        chatManager: ChatManager;
        cursorTracker: CursorTracker;
        terminalSharing: TerminalSharing;
        taskBoardProvider: TaskBoardProvider;
        codeReviewProvider: CodeReviewProvider;
        whiteboardProvider: WhiteboardProvider;
        dashboardProvider: DashboardProvider;
        fileSyncManager: FileSyncManager;
        gitSyncManager: GitSyncManager;
        copilotTracker: CopilotTracker;
        sessionPersistence: SessionPersistence;
        encryptionManager: EncryptionManager;
        projectUpdateManager: ProjectUpdateManager;
        chatProvider: ChatProvider;
        autoSyncManager: AutoSyncManager;
        fileHistoryManager: FileHistoryManager;
        extensionRecommendationProvider: ExtensionRecommendationProvider;
    }
) {
    const commands: { [key: string]: () => Promise<void> | void } = {
        'letscode.createSession': async () => {
            const password = await vscode.window.showInputBox({
                prompt: 'Set session password (optional)',
                password: true,
                placeHolder: 'Leave empty for no password'
            });
            
            await providers.p2pProvider.createSession(password);
            providers.sidebarProvider.updateWebview();
            
            vscode.window.showInformationMessage(
                `Session created! Share your Project ID with teammates.`
            );
        },

        'letscode.joinSession': async () => {
            const sessionId = await vscode.window.showInputBox({
                prompt: 'Enter Project ID',
                placeHolder: 'e.g., LETS-X8B2-9A1F',
                validateInput: (value) => {
                    if (!value || value.length < 8) {
                        return 'Please enter a valid Project ID';
                    }
                    return null;
                }
            });

            if (!sessionId) return;

            const hostIp = await vscode.window.showInputBox({
                prompt: 'Enter Host IP Address',
                placeHolder: 'e.g., 192.168.1.100',
                validateInput: (value) => {
                    if (!value || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
                        return 'Please enter a valid IP address';
                    }
                    return null;
                }
            });

            if (!hostIp) return;

            const port = await vscode.window.showInputBox({
                prompt: 'Enter Port',
                placeHolder: '42069',
                value: '42069'
            });

            const password = await vscode.window.showInputBox({
                prompt: 'Enter session password (if required)',
                password: true,
                placeHolder: 'Leave empty if no password'
            });

            await providers.p2pProvider.joinSession(sessionId, hostIp, parseInt(port || '42069'), password);
            providers.sidebarProvider.updateWebview();
            
            vscode.window.showInformationMessage('Connected to session!');
        },

        'letscode.leaveSession': async () => {
            await providers.p2pProvider.leaveSession();
            providers.sidebarProvider.updateWebview();
            vscode.window.showInformationMessage('Left the session.');
        },

        'letscode.copySessionId': () => {
            const sessionId = providers.p2pProvider.getSessionId();
            if (sessionId) {
                vscode.env.clipboard.writeText(sessionId);
                vscode.window.showInformationMessage('Project ID copied to clipboard!');
            }
        },

        'letscode.toggleEditHistory': () => {
            providers.documentSync.toggleEditHistory();
        },

        'letscode.sendChatMessage': async () => {
            const message = await vscode.window.showInputBox({
                prompt: 'Enter message',
                placeHolder: 'Type your message...'
            });
            if (message) {
                providers.chatManager.sendMessage(message);
            }
        },

        'letscode.syncFiles': async () => {
            await providers.fileSyncManager.syncAllFiles();
            vscode.window.showInformationMessage('Files synced with peers!');
        },

        'letscode.setPassword': async () => {
            const password = await vscode.window.showInputBox({
                prompt: 'Set new session password',
                password: true,
                placeHolder: 'Leave empty to remove password'
            });
            providers.p2pProvider.setPassword(password);
        },

        'letscode.followPeer': async () => {
            const peers = providers.p2pProvider.getPeers();
            if (peers.length === 0) {
                vscode.window.showWarningMessage('No peers connected');
                return;
            }
            
            const peer = await vscode.window.showQuickPick(
                peers.map((p: Peer) => ({ label: p.name || p.id, id: p.id })),
                { placeHolder: 'Select peer to follow' }
            ) as { label: string; id: string } | undefined;
            
            if (peer) {
                providers.cursorTracker.startFollowing(peer.id);
            }
        },

        'letscode.stopFollowing': () => {
            providers.cursorTracker.stopFollowing();
        },

        'letscode.openDashboard': () => {
            providers.dashboardProvider.show();
        },

        'letscode.openTaskBoard': () => {
            providers.taskBoardProvider.show();
        },

        'letscode.addReviewComment': async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;
            
            const selection = editor.selection;
            const comment = await vscode.window.showInputBox({
                prompt: 'Enter review comment'
            });
            
            if (comment) {
                providers.codeReviewProvider.addComment(
                    editor.document.uri,
                    selection,
                    comment
                );
            }
        },

        'letscode.shareTerminal': () => {
            providers.terminalSharing.toggleSharing();
        },

        'letscode.openWhiteboard': () => {
            providers.whiteboardProvider.show();
        },

        'letscode.openChat': () => {
            providers.chatProvider.show();
        },

        'letscode.shareFile': async () => {
            const uris = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false
            });
            
            if (uris && uris[0]) {
                await providers.fileSyncManager.shareFile(uris[0]);
            }
        },

        'letscode.toggleGitSync': () => {
            providers.gitSyncManager.toggle();
        },

        'letscode.openWebDashboard': () => {
            const sessionId = providers.p2pProvider.getSessionId();
            if (sessionId) {
                vscode.env.openExternal(vscode.Uri.parse(`http://localhost:3000/dashboard/${sessionId}`));
            }
        },

        'letscode.saveSession': () => {
            providers.sessionPersistence.saveSession();
            vscode.window.showInformationMessage('Session saved!');
        },

        'letscode.restoreSession': () => {
            providers.sessionPersistence.restoreSession();
        },

        'letscode.toggleCopilotTracking': () => {
            providers.copilotTracker.toggle();
        },

        'letscode.shareBreakpoints': () => {
            const session = vscode.debug.activeDebugSession;
            if (session) {
                providers.p2pProvider.broadcastMessage({
                    type: 'breakpoint',
                    data: { sessionName: session.name },
                    sender: providers.p2pProvider.getMyPeerId(),
                    timestamp: Date.now()
                });
            }
        },

        // Group Messaging Commands
        'letscode.sendGroupMessage': async () => {
            const message = await vscode.window.showInputBox({
                prompt: 'Send message to all peers',
                placeHolder: 'Type your group message...'
            });
            if (message) {
                providers.chatManager.sendMessage(message, 'text');
                vscode.window.showInformationMessage('Message sent to group!');
            }
        },

        'letscode.showChatHistory': () => {
            const messages = providers.chatManager.getMessages();
            if (messages.length === 0) {
                vscode.window.showInformationMessage('No messages yet');
                return;
            }
            
            const recentMessages = messages.slice(-10).map((m: ChatMessage) => 
                `${m.senderName}: ${m.text.substring(0, 40)}${m.text.length > 40 ? '...' : ''}`
            );
            
            vscode.window.showQuickPick(recentMessages, {
                placeHolder: 'Recent messages (select to reply)',
                canPickMany: false
            }).then(selected => {
                if (selected) {
                    vscode.commands.executeCommand('letscode.sendGroupMessage');
                }
            });
        },

        // Project Update Commands
        'letscode.shareProjectStructure': () => {
            providers.projectUpdateManager.shareProjectStructure();
        },

        'letscode.notifyFileChange': async () => {
            const file = await vscode.window.showInputBox({
                prompt: 'File path (relative to workspace)',
                placeHolder: 'src/components/App.tsx'
            });
            
            if (file) {
                providers.projectUpdateManager.notifyFileChange(
                    vscode.Uri.file(file), 
                    'modified'
                );
            }
        },

        'letscode.showProjectUpdates': () => {
            const updates = providers.projectUpdateManager.getUpdates();
            if (updates.length === 0) {
                vscode.window.showInformationMessage('No project updates yet');
                return;
            }
            
            const recentUpdates = updates.slice(-10).map((u: { senderName: string; description: string }) => 
                `${u.senderName} - ${u.description}`
            );
            
            vscode.window.showQuickPick(recentUpdates, {
                placeHolder: 'Recent project updates'
            });
        },

        // Enhanced File Sharing
        'letscode.shareMultipleFiles': async () => {
            const uris = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: true,
                openLabel: 'Share Files with Peers'
            });
            
            if (uris && uris.length > 0) {
                for (const uri of uris) {
                    await providers.fileSyncManager.shareFile(uri);
                }
                vscode.window.showInformationMessage(`Shared ${uris.length} file(s) with peers`);
            }
        },

        'letscode.requestFileFromPeer': async () => {
            const peers = providers.p2pProvider.getPeers();
            if (peers.length === 0) {
                vscode.window.showWarningMessage('No peers connected');
                return;
            }
            
            const peer = await vscode.window.showQuickPick(
                peers.map((p: Peer) => ({ label: p.name || p.id, id: p.id })),
                { placeHolder: 'Select peer to request file from' }
            ) as { label: string; id: string } | undefined;
            
            if (peer) {
                const filePath = await vscode.window.showInputBox({
                    prompt: 'Enter file path to request',
                    placeHolder: 'e.g., src/utils/helpers.ts'
                });
                
                if (filePath) {
                    providers.p2pProvider.sendToPeer(peer.id, {
                        type: 'file-request',
                        data: { filePath },
                        sender: providers.p2pProvider.getMyPeerId(),
                        timestamp: Date.now()
                    });
                    vscode.window.showInformationMessage(`File request sent to ${peer.label}`);
                }
            }
        },

        // Session Info Commands
        'letscode.showSessionInfo': () => {
            const sessionId = providers.p2pProvider.getSessionId();
            const peers = providers.p2pProvider.getPeers();
            const connectionInfo = providers.p2pProvider.getConnectionInfo();
            
            if (!sessionId) {
                vscode.window.showWarningMessage('Not in a session');
                return;
            }
            
            const info = [
                `Session ID: ${sessionId}`,
                `Role: ${providers.p2pProvider.isSessionHost() ? 'Host' : 'Client'}`,
                `Connected Peers: ${peers.length}`,
                peers.length > 0 ? `Peers: ${peers.map((p: Peer) => p.name || p.id.substr(0, 6)).join(', ')}` : '',
                connectionInfo ? `Host IP: ${connectionInfo.ip}:${connectionInfo.port}` : ''
            ].filter(Boolean);
            
            vscode.window.showInformationMessage(info.join(' | '));
        },

        'letscode.copyConnectionDetails': () => {
            const sessionId = providers.p2pProvider.getSessionId();
            const connectionInfo = providers.p2pProvider.getConnectionInfo();
            
            if (!sessionId) {
                vscode.window.showWarningMessage('Not in a session');
                return;
            }
            
            const details = connectionInfo 
                ? `Project ID: ${sessionId}\nHost IP: ${connectionInfo.ip}\nPort: ${connectionInfo.port}`
                : `Project ID: ${sessionId}`;
            
            vscode.env.clipboard.writeText(details);
            vscode.window.showInformationMessage('Connection details copied to clipboard!');
        },

        'letscode.toggleAutoSync': () => {
            providers.autoSyncManager.toggleAutoSync();
        },

        'letscode.shareEntireProject': () => {
            providers.autoSyncManager.shareEntireProject();
        },

        'letscode.requestProjectSync': async () => {
            const peers = providers.p2pProvider.getPeers();
            if (peers.length === 0) {
                vscode.window.showWarningMessage('No peers connected');
                return;
            }
            
            const peer = await vscode.window.showQuickPick(
                peers.map((p: Peer) => ({ label: p.name || p.id, id: p.id })),
                { placeHolder: 'Select peer to sync project from' }
            ) as { label: string; id: string } | undefined;
            
            if (peer) {
                providers.autoSyncManager.requestProjectSyncFromPeer(peer.id);
            }
        },

        'letscode.toggleTerminalBroadcast': () => {
            providers.terminalSharing.toggleBroadcastMode();
        },

        'letscode.broadcastCommand': async () => {
            const command = await vscode.window.showInputBox({
                prompt: 'Enter command to execute on all devices',
                placeHolder: 'e.g., npm install'
            });
            
            if (command) {
                await providers.terminalSharing.broadcastAndExecute(command);
            }
        },

        'letscode.createCommit': async () => {
            const message = await vscode.window.showInputBox({
                prompt: 'Enter commit message',
                placeHolder: 'e.g., Fixed login bug'
            });
            
            if (message) {
                await providers.fileHistoryManager.createCommit(message);
            }
        },

        'letscode.showFileHistory': async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No file open');
                return;
            }
            
            const history = providers.fileHistoryManager.getFileHistory(editor.document.uri.fsPath);
            if (!history || history.versions.length === 0) {
                vscode.window.showInformationMessage('No history for this file');
                return;
            }
            
            const items = history.versions.map(v => ({
                label: `Version ${history.versions.indexOf(v) + 1}`,
                description: `${v.authorName} - ${new Date(v.timestamp).toLocaleString()}`,
                detail: v.message || 'No message',
                versionId: v.versionId
            }));
            
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select version to restore'
            });
            
            if (selected) {
                await providers.fileHistoryManager.restoreVersion(editor.document.uri.fsPath, selected.versionId);
            }
        },

        'letscode.showCommits': () => {
            const commits = providers.fileHistoryManager.getCommits();
            if (commits.length === 0) {
                vscode.window.showInformationMessage('No commits yet');
                return;
            }
            
            const outputChannel = vscode.window.createOutputChannel('Let\'s Code - Commits');
            commits.forEach(commit => {
                outputChannel.appendLine(`[${new Date(commit.timestamp).toLocaleString()}] ${commit.authorName}: ${commit.message} (${commit.files.length} files)`);
            });
            outputChannel.show();
            
            vscode.window.showInformationMessage(`Showing ${commits.length} commits in output channel`);
        },

        'letscode.showExtensionRecommendations': async () => {
            const recommendations = providers.extensionRecommendationProvider.getRecommendations();
            
            if (recommendations.length === 0) {
                vscode.window.showInformationMessage('No extension recommendations from peers');
                return;
            }
            
            const items = recommendations.filter(r => r.priority === 'high').map(r => ({
                label: r.name,
                description: `${r.publisher} - Used by ${r.peerCount} peers`,
                detail: r.description?.substring(0, 100) || '',
                extensionId: r.id
            }));
            
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select extension to install'
            });
            
            if (selected) {
                await providers.extensionRecommendationProvider.installExtension(selected.extensionId);
            }
        },

        'letscode.recommendExtension': async () => {
            const myExtensions = providers.extensionRecommendationProvider.getMyExtensions();
            
            const items = myExtensions.map(ext => ({
                label: ext.name,
                description: ext.publisher,
                detail: ext.description?.substring(0, 100) || '',
                extensionId: ext.id
            }));
            
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select extension to recommend to peers'
            });
            
            if (selected) {
                await providers.extensionRecommendationProvider.recommendExtensionToPeers(selected.extensionId);
            }
        }
    };

    Object.entries(commands).forEach(([command, handler]) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(command, handler)
        );
    });
}

function setupEventListeners(
    context: vscode.ExtensionContext,
    p2pProvider: P2PCollaborationProvider,
    documentSync: DocumentSync,
    cursorTracker: CursorTracker
) {
    // Listen for text document changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (p2pProvider.isInSession()) {
                documentSync.handleLocalChange(event);
            }
        })
    );

    // Listen for cursor position changes
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection((event) => {
            if (p2pProvider.isInSession()) {
                cursorTracker.updateCursorPosition(event);
            }
        })
    );

    // Listen for active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && p2pProvider.isInSession()) {
                documentSync.syncDocument(editor.document);
            }
        })
    );
}

export function deactivate() {
    if (p2pProvider) {
        p2pProvider.dispose();
    }
    if (sidebarProvider) {
        sidebarProvider.dispose();
    }
}
