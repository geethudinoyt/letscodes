import * as vscode from 'vscode';
import * as Y from 'yjs';
import { P2PCollaborationProvider, Message } from './p2pProvider';

export class DocumentSync implements vscode.Disposable {
    private ytextMap: Map<string, Y.Text> = new Map();
    private decorationType: vscode.TextEditorDecorationType;
    private editHistory: Map<string, any[]> = new Map();
    private showHistory: boolean = false;
    private localUpdate: boolean = false;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderRadius: '2px'
        });

        this.p2pProvider.registerMessageHandler('document-change', (msg) => {
            this.handleRemoteChange(msg);
        });

        this.p2pProvider.registerMessageHandler('ydoc-update', () => {
            this.applyYjsUpdates();
        });
    }

    handleLocalChange(event: vscode.TextDocumentChangeEvent): void {
        if (this.localUpdate) return;

        const uri = event.document.uri.toString();
        const ytext = this.getOrCreateYText(uri);

        event.contentChanges.forEach(change => {
            const startPos = change.rangeOffset;
            const deleteCount = change.rangeLength;
            
            if (deleteCount > 0) {
                ytext.delete(startPos, deleteCount);
            }
            if (change.text) {
                ytext.insert(startPos, change.text);
            }
        });

        // Track in history
        this.trackEdit(uri, event);

        // Broadcast to peers via Yjs
        this.p2pProvider.broadcastMessage({
            type: 'document-change',
            data: {
                uri,
                changes: event.contentChanges.map(c => ({
                    range: c.range,
                    text: c.text,
                    rangeOffset: c.rangeOffset,
                    rangeLength: c.rangeLength
                }))
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    handleRemoteChange(message: Message): void {
        const { uri, changes } = message.data;
        
        const editor = vscode.window.visibleTextEditors.find(
            e => e.document.uri.toString() === uri
        );
        
        if (!editor) return;

        this.localUpdate = true;
        
        editor.edit(editBuilder => {
            changes.forEach((change: any) => {
                const range = new vscode.Range(
                    change.range.start.line,
                    change.range.start.character,
                    change.range.end.line,
                    change.range.end.character
                );
                editBuilder.replace(range, change.text);
            });
        }).then(() => {
            this.localUpdate = false;
            this.showEditDecorations(editor, changes, message.sender);
        });
    }

    syncDocument(document: vscode.TextDocument): void {
        if (!this.p2pProvider.isInSession()) return;

        const uri = document.uri.toString();
        const ytext = this.getOrCreateYText(uri);
        
        // Request document state from host
        this.p2pProvider.broadcastMessage({
            type: 'request-document',
            data: { uri },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private getOrCreateYText(uri: string): Y.Text {
        if (!this.ytextMap.has(uri)) {
            const ytext = new Y.Text();
            this.ytextMap.set(uri, ytext);
            
            const ydoc = this.p2pProvider.getYDoc();
            ydoc.getMap('documents').set(uri, ytext);
        }
        return this.ytextMap.get(uri)!;
    }

    private applyYjsUpdates(): void {
        // Yjs handles synchronization automatically
        // This is called when we receive updates from other peers
    }

    private trackEdit(uri: string, event: vscode.TextDocumentChangeEvent): void {
        if (!this.editHistory.has(uri)) {
            this.editHistory.set(uri, []);
        }
        
        const history = this.editHistory.get(uri)!;
        history.push({
            timestamp: Date.now(),
            changes: event.contentChanges,
            peerId: this.p2pProvider.getMyPeerId()
        });
        
        // Keep only last 100 edits
        if (history.length > 100) {
            history.shift();
        }
    }

    toggleEditHistory(): void {
        this.showHistory = !this.showHistory;
        
        if (this.showHistory) {
            vscode.window.showInformationMessage('Edit history enabled');
        } else {
            vscode.window.showInformationMessage('Edit history disabled');
            // Clear decorations
            vscode.window.visibleTextEditors.forEach(editor => {
                editor.setDecorations(this.decorationType, []);
            });
        }
    }

    private showEditDecorations(
        editor: vscode.TextEditor,
        changes: any[],
        senderId: string
    ): void {
        if (!this.showHistory) return;

        const decorations: vscode.DecorationOptions[] = changes.map(change => ({
            range: new vscode.Range(
                change.range.start.line,
                change.range.start.character,
                change.range.end.line,
                change.range.end.character
            ),
            hoverMessage: `Edited by ${senderId}`
        }));

        editor.setDecorations(this.decorationType, decorations);

        // Clear after 3 seconds
        setTimeout(() => {
            editor.setDecorations(this.decorationType, []);
        }, 3000);
    }

    getEditHistory(uri: string): any[] {
        return this.editHistory.get(uri) || [];
    }

    dispose(): void {
        this.decorationType.dispose();
    }
}
