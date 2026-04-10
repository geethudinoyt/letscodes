import * as vscode from 'vscode';
import { P2PCollaborationProvider } from './p2pProvider';

export interface SavedSession {
    sessionId: string;
    isHost: boolean;
    hostIp?: string;
    port: number;
    password?: string;
    savedAt: number;
    projectPath: string;
}

export class SessionPersistence implements vscode.Disposable {
    private readonly SESSION_KEY = 'letscode.savedSession';
    private autoSaveInterval: NodeJS.Timeout | undefined;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        // Set up auto-save if enabled
        const config = vscode.workspace.getConfiguration('letscode');
        if (config.get<boolean>('autoSaveSession')) {
            this.startAutoSave();
        }

        // Listen for session changes
        this.p2pProvider.onPeerConnect(() => {
            this.saveSession();
        });
    }

    startAutoSave(): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            if (this.p2pProvider.isInSession()) {
                this.saveSession();
            }
        }, 60000); // Save every minute
    }

    saveSession(): void {
        if (!this.p2pProvider.isInSession()) return;

        const connectionInfo = this.p2pProvider.getConnectionInfo();
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        const session: SavedSession = {
            sessionId: this.p2pProvider.getSessionId()!,
            isHost: this.p2pProvider.isSessionHost(),
            hostIp: connectionInfo?.ip,
            port: connectionInfo?.port || 42069,
            savedAt: Date.now(),
            projectPath: workspaceFolder?.uri.fsPath || ''
        };

        this.context.globalState.update(this.SESSION_KEY, session);
    }

    async restoreSession(): Promise<void> {
        const session = this.context.globalState.get<SavedSession>(this.SESSION_KEY);
        
        if (!session) {
            vscode.window.showInformationMessage('No saved session found');
            return;
        }

        // Check if session is recent (within 24 hours)
        const isRecent = Date.now() - session.savedAt < 24 * 60 * 60 * 1000;
        
        if (!isRecent) {
            const result = await vscode.window.showWarningMessage(
                'Saved session is older than 24 hours. Restore anyway?',
                'Yes', 'No'
            );
            if (result !== 'Yes') return;
        }

        try {
            if (session.isHost) {
                await this.p2pProvider.createSession();
            } else if (session.hostIp) {
                await this.p2pProvider.joinSession(
                    session.sessionId,
                    session.hostIp,
                    session.port,
                    session.password
                );
            }

            vscode.window.showInformationMessage('Session restored successfully');
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to restore session: ${err}`);
        }
    }

    async restoreSessionIfNeeded(): Promise<void> {
        const session = this.context.globalState.get<SavedSession>(this.SESSION_KEY);
        
        if (!session) return;

        // Only auto-restore if very recent (within 1 hour)
        const isVeryRecent = Date.now() - session.savedAt < 60 * 60 * 1000;
        
        if (isVeryRecent) {
            const result = await vscode.window.showInformationMessage(
                `Restore previous session "${session.sessionId}"?`,
                'Yes', 'No'
            );
            
            if (result === 'Yes') {
                await this.restoreSession();
            }
        }
    }

    clearSavedSession(): void {
        this.context.globalState.update(this.SESSION_KEY, undefined);
    }

    getSavedSession(): SavedSession | undefined {
        return this.context.globalState.get<SavedSession>(this.SESSION_KEY);
    }

    dispose(): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}
