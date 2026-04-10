import * as vscode from 'vscode';
import { P2PCollaborationProvider } from './p2pProvider';

export interface CopilotEdit {
    timestamp: number;
    fileUri: string;
    lineCount: number;
    detected: boolean;
}

export class CopilotTracker implements vscode.Disposable {
    private enabled: boolean = true;
    private edits: CopilotEdit[] = [];
    private recentEditTimes: number[] = [];
    private readonly RAPID_EDIT_THRESHOLD = 500; // ms between edits
    private readonly LARGE_INSERT_THRESHOLD = 50; // lines
    private onCopilotDetected = new vscode.EventEmitter<CopilotEdit>();

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        const config = vscode.workspace.getConfiguration('letscode');
        this.enabled = config.get<boolean>('trackCopilotEdits') ?? true;

        // Track edits
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (this.enabled && this.p2pProvider.isInSession()) {
                this.analyzeEdit(event);
            }
        });
    }

    toggle(): void {
        this.enabled = !this.enabled;
        
        const config = vscode.workspace.getConfiguration('letscode');
        config.update('trackCopilotEdits', this.enabled, true);
        
        vscode.window.showInformationMessage(
            `Copilot tracking ${this.enabled ? 'enabled' : 'disabled'}`
        );
    }

    private analyzeEdit(event: vscode.TextDocumentChangeEvent): void {
        const now = Date.now();
        this.recentEditTimes.push(now);
        
        // Keep only last 10 edit times
        this.recentEditTimes = this.recentEditTimes.filter(t => now - t < 5000);

        // Check for rapid edits (indicative of Copilot)
        const isRapidEdit = this.recentEditTimes.length >= 3 &&
            this.recentEditTimes[this.recentEditTimes.length - 1] - 
            this.recentEditTimes[this.recentEditTimes.length - 3] < 1000;

        let totalLines = 0;
        let isLargeInsert = false;

        event.contentChanges.forEach(change => {
            if (change.text) {
                const lines = change.text.split('\n').length;
                totalLines += lines;
                
                if (lines > this.LARGE_INSERT_THRESHOLD) {
                    isLargeInsert = true;
                }
            }
        });

        const isCopilotEdit = (isRapidEdit && totalLines > 10) || isLargeInsert;

        const edit: CopilotEdit = {
            timestamp: now,
            fileUri: event.document.uri.toString(),
            lineCount: totalLines,
            detected: isCopilotEdit
        };

        this.edits.push(edit);

        if (isCopilotEdit) {
            this.onCopilotDetected.fire(edit);
            this.notifyCopilotEdit(event.document, totalLines);
        }

        // Broadcast edit info
        this.p2pProvider.broadcastMessage({
            type: 'edit-track',
            data: {
                fileUri: event.document.uri.toString(),
                lineCount: totalLines,
                isCopilotEdit
            },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: now
        });
    }

    private notifyCopilotEdit(document: vscode.TextDocument, lineCount: number): void {
        const config = vscode.workspace.getConfiguration('letscode');
        const username = config.get<string>('username') || 'Anonymous';

        // Don't show notification for every detection, just occasionally
        if (Math.random() < 0.3) {
            vscode.window.showInformationMessage(
                `${username} added ${lineCount} lines (AI-assisted)`,
                'View Stats'
            ).then(selection => {
                if (selection === 'View Stats') {
                    vscode.commands.executeCommand('letscode.openDashboard');
                }
            });
        }
    }

    getStats(): {
        totalEdits: number;
        copilotEdits: number;
        copilotPercentage: number;
        linesByCopilot: number;
    } {
        const totalEdits = this.edits.length;
        const copilotEdits = this.edits.filter(e => e.detected).length;
        const linesByCopilot = this.edits
            .filter(e => e.detected)
            .reduce((sum, e) => sum + e.lineCount, 0);

        return {
            totalEdits,
            copilotEdits,
            copilotPercentage: totalEdits > 0 ? Math.round((copilotEdits / totalEdits) * 100) : 0,
            linesByCopilot
        };
    }

    getEdits(): CopilotEdit[] {
        return [...this.edits];
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    dispose(): void {
        this.onCopilotDetected.dispose();
    }
}
