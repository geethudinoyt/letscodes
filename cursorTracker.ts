import * as vscode from 'vscode';
import { P2PCollaborationProvider, Message } from './p2pProvider';

interface CursorInfo {
    peerId: string;
    peerName: string;
    uri: string;
    position: vscode.Position;
    selection: vscode.Range | null;
    color: string;
}

export class CursorTracker implements vscode.Disposable {
    private cursors: Map<string, CursorInfo> = new Map();
    private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();
    private followingPeerId: string | null = null;
    private onCursorUpdate = new vscode.EventEmitter<CursorInfo>();
    private updateThrottle: Map<string, number> = new Map();
    private readonly THROTTLE_MS = 50;

    private cursorColors = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
        '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
    ];

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.p2pProvider.registerMessageHandler('cursor-update', (msg) => {
            this.handleRemoteCursorUpdate(msg);
        });

        // Start periodic cursor position updates
        setInterval(() => {
            if (this.p2pProvider.isInSession()) {
                this.broadcastCursorPosition();
            }
        }, 100);
    }

    updateCursorPosition(event: vscode.TextEditorSelectionChangeEvent): void {
        if (!this.p2pProvider.isInSession()) return;

        const now = Date.now();
        const lastUpdate = this.updateThrottle.get('local') || 0;
        
        if (now - lastUpdate < this.THROTTLE_MS) return;
        this.updateThrottle.set('local', now);

        const editor = event.textEditor;
        const position = event.selections[0].active;
        const selection = event.selections[0].isEmpty ? null : event.selections[0];

        this.p2pProvider.broadcastMessage({
            type: 'cursor-update',
            data: {
                uri: editor.document.uri.toString(),
                position: { line: position.line, character: position.character },
                selection: selection ? {
                    start: { line: selection.start.line, character: selection.start.character },
                    end: { line: selection.end.line, character: selection.end.character }
                } : null
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private handleRemoteCursorUpdate(message: Message): void {
        const { uri, position, selection } = message.data;
        const peerId = message.sender;
        
        const peers = this.p2pProvider.getPeers();
        const peer = peers.find(p => p.id === peerId);
        
        const cursorInfo: CursorInfo = {
            peerId,
            peerName: peer?.name || `Peer ${peerId.substr(0, 6)}`,
            uri,
            position: new vscode.Position(position.line, position.character),
            selection: selection ? new vscode.Range(
                selection.start.line,
                selection.start.character,
                selection.end.line,
                selection.end.character
            ) : null,
            color: this.getPeerColor(peerId)
        };

        this.cursors.set(peerId, cursorInfo);
        this.onCursorUpdate.fire(cursorInfo);

        // Update decorations
        this.updateCursorDecorations(cursorInfo);

        // Auto-follow if following this peer
        if (this.followingPeerId === peerId) {
            this.jumpToCursor(cursorInfo);
        }
    }

    private updateCursorDecorations(cursorInfo: CursorInfo): void {
        const editor = vscode.window.visibleTextEditors.find(
            e => e.document.uri.toString() === cursorInfo.uri
        );
        
        if (!editor) return;

        // Create or get decoration type for this peer
        if (!this.decorationTypes.has(cursorInfo.peerId)) {
            const decorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: `${cursorInfo.color}40`,
                border: `2px solid ${cursorInfo.color}`,
                overviewRulerColor: cursorInfo.color,
                overviewRulerLane: vscode.OverviewRulerLane.Right
            });
            this.decorationTypes.set(cursorInfo.peerId, decorationType);
        }

        const decorationType = this.decorationTypes.get(cursorInfo.peerId)!;
        const decorations: vscode.DecorationOptions[] = [];

        // Add cursor position
        const cursorRange = new vscode.Range(
            cursorInfo.position,
            cursorInfo.position.translate(0, 1)
        );
        decorations.push({
            range: cursorRange,
            hoverMessage: `${cursorInfo.peerName}'s cursor`
        });

        // Add selection if exists
        if (cursorInfo.selection) {
            decorations.push({
                range: cursorInfo.selection,
                hoverMessage: `${cursorInfo.peerName}'s selection`
            });
        }

        editor.setDecorations(decorationType, decorations);
    }

    private jumpToCursor(cursorInfo: CursorInfo): void {
        vscode.workspace.openTextDocument(vscode.Uri.parse(cursorInfo.uri))
            .then(doc => vscode.window.showTextDocument(doc))
            .then(editor => {
                editor.revealRange(
                    new vscode.Range(cursorInfo.position, cursorInfo.position),
                    vscode.TextEditorRevealType.InCenter
                );
            });
    }

    startFollowing(peerId: string): void {
        this.followingPeerId = peerId;
        const peers = this.p2pProvider.getPeers();
        const peer = peers.find(p => p.id === peerId);
        vscode.window.showInformationMessage(`Now following ${peer?.name || peerId}`);

        // Jump to their current position
        const cursorInfo = this.cursors.get(peerId);
        if (cursorInfo) {
            this.jumpToCursor(cursorInfo);
        }
    }

    stopFollowing(): void {
        if (this.followingPeerId) {
            const peers = this.p2pProvider.getPeers();
            const peer = peers.find(p => p.id === this.followingPeerId);
            vscode.window.showInformationMessage(`Stopped following ${peer?.name || this.followingPeerId}`);
        }
        this.followingPeerId = null;
    }

    private broadcastCursorPosition(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const position = editor.selection.active;
        const selection = editor.selection.isEmpty ? null : {
            start: { line: editor.selection.start.line, character: editor.selection.start.character },
            end: { line: editor.selection.end.line, character: editor.selection.end.character }
        };

        this.p2pProvider.broadcastMessage({
            type: 'cursor-update',
            data: {
                uri: editor.document.uri.toString(),
                position: { line: position.line, character: position.character },
                selection
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private getPeerColor(peerId: string): string {
        let hash = 0;
        for (let i = 0; i < peerId.length; i++) {
            hash = peerId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % this.cursorColors.length;
        return this.cursorColors[index];
    }

    getCursors(): CursorInfo[] {
        return Array.from(this.cursors.values());
    }

    dispose(): void {
        this.onCursorUpdate.dispose();
        this.decorationTypes.forEach(type => type.dispose());
    }
}
