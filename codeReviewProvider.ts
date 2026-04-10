import * as vscode from 'vscode';
import { P2PCollaborationProvider, Message } from './p2pProvider';

export interface ReviewComment {
    id: string;
    uri: string;
    line: number;
    text: string;
    author: string;
    authorName: string;
    timestamp: number;
    resolved: boolean;
    replies: Reply[];
}

export interface Reply {
    id: string;
    text: string;
    author: string;
    authorName: string;
    timestamp: number;
}

export class CodeReviewProvider implements vscode.Disposable {
    private comments: Map<string, ReviewComment> = new Map();
    private decorationType: vscode.TextEditorDecorationType;
    private resolvedDecorationType: vscode.TextEditorDecorationType;
    private onCommentsChanged = new vscode.EventEmitter<ReviewComment[]>();

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.context.asAbsolutePath('media/comment-icon.svg'),
            overviewRulerColor: '#6366f1',
            overviewRulerLane: vscode.OverviewRulerLane.Left
        });

        this.resolvedDecorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: this.context.asAbsolutePath('media/comment-resolved-icon.svg'),
            overviewRulerColor: '#10b981',
            overviewRulerLane: vscode.OverviewRulerLane.Left
        });

        this.p2pProvider.registerMessageHandler('review-comment', (msg) => {
            this.handleRemoteComment(msg);
        });

        this.p2pProvider.registerMessageHandler('review-comment-reply', (msg) => {
            this.handleRemoteReply(msg);
        });

        this.p2pProvider.registerMessageHandler('review-comment-resolve', (msg) => {
            this.handleRemoteResolve(msg);
        });

        // Update decorations when editor changes
        vscode.window.onDidChangeActiveTextEditor(() => {
            this.updateDecorations();
        });
    }

    addComment(uri: vscode.Uri, range: vscode.Range, text: string): void {
        const config = vscode.workspace.getConfiguration('letscode');
        const username = config.get<string>('username') || 'Anonymous';

        const comment: ReviewComment = {
            id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            uri: uri.toString(),
            line: range.start.line,
            text,
            author: this.p2pProvider.getMyPeerId(),
            authorName: username,
            timestamp: Date.now(),
            resolved: false,
            replies: []
        };

        this.comments.set(comment.id, comment);
        this.broadcastComment(comment);
        this.updateDecorations();
        this.showCommentThread(comment);

        vscode.window.showInformationMessage('Review comment added');
    }

    replyToComment(commentId: string, text: string): void {
        const comment = this.comments.get(commentId);
        if (!comment) return;

        const config = vscode.workspace.getConfiguration('letscode');
        const username = config.get<string>('username') || 'Anonymous';

        const reply: Reply = {
            id: `reply-${Date.now()}`,
            text,
            author: this.p2pProvider.getMyPeerId(),
            authorName: username,
            timestamp: Date.now()
        };

        comment.replies.push(reply);
        this.comments.set(commentId, comment);

        this.p2pProvider.broadcastMessage({
            type: 'review-comment-reply',
            data: { commentId, reply },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.showCommentThread(comment);
    }

    resolveComment(commentId: string): void {
        const comment = this.comments.get(commentId);
        if (!comment) return;

        comment.resolved = true;
        this.comments.set(commentId, comment);

        this.p2pProvider.broadcastMessage({
            type: 'review-comment-resolve',
            data: { commentId },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.updateDecorations();
        vscode.window.showInformationMessage('Comment resolved');
    }

    private broadcastComment(comment: ReviewComment): void {
        this.p2pProvider.broadcastMessage({
            type: 'review-comment',
            data: comment,
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private handleRemoteComment(message: Message): void {
        const comment = message.data as ReviewComment;
        this.comments.set(comment.id, comment);
        this.updateDecorations();

        const peers = this.p2pProvider.getPeers();
        const peer = peers.find(p => p.id === message.sender);
        vscode.window.showInformationMessage(
            `New review comment from ${peer?.name || 'a peer'}`
        );
    }

    private handleRemoteReply(message: Message): void {
        const { commentId, reply } = message.data;
        const comment = this.comments.get(commentId);
        if (comment) {
            comment.replies.push(reply);
            this.comments.set(commentId, comment);

            // Show notification
            const peers = this.p2pProvider.getPeers();
            const peer = peers.find(p => p.id === message.sender);
            vscode.window.showInformationMessage(
                `New reply from ${peer?.name || 'a peer'} on your comment`
            );
        }
    }

    private handleRemoteResolve(message: Message): void {
        const { commentId } = message.data;
        const comment = this.comments.get(commentId);
        if (comment) {
            comment.resolved = true;
            this.comments.set(commentId, comment);
            this.updateDecorations();
        }
    }

    private updateDecorations(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const uri = editor.document.uri.toString();
        const fileComments = Array.from(this.comments.values())
            .filter(c => c.uri === uri);

        const unresolvedDecorations: vscode.DecorationOptions[] = [];
        const resolvedDecorations: vscode.DecorationOptions[] = [];

        fileComments.forEach(comment => {
            const decoration = {
                range: new vscode.Range(comment.line, 0, comment.line, 0),
                hoverMessage: this.formatHoverMessage(comment)
            };

            if (comment.resolved) {
                resolvedDecorations.push(decoration);
            } else {
                unresolvedDecorations.push(decoration);
            }
        });

        editor.setDecorations(this.decorationType, unresolvedDecorations);
        editor.setDecorations(this.resolvedDecorationType, resolvedDecorations);
    }

    private formatHoverMessage(comment: ReviewComment): vscode.MarkdownString {
        const lines = [
            `**${comment.authorName}** • ${new Date(comment.timestamp).toLocaleString()}`,
            '',
            comment.text,
            ''
        ];

        if (comment.replies.length > 0) {
            lines.push('**Replies:**');
            comment.replies.forEach(reply => {
                lines.push(`• ${reply.authorName}: ${reply.text}`);
            });
        }

        if (comment.resolved) {
            lines.push('', '*✓ Resolved*');
        }

        const markdown = new vscode.MarkdownString(lines.join('\n'));
        markdown.isTrusted = true;
        return markdown;
    }

    private async showCommentThread(comment: ReviewComment): Promise<void> {
        const uri = vscode.Uri.parse(comment.uri);
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);

        const position = new vscode.Position(comment.line, 0);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);

        // Show comment in information message with actions
        const actions = ['Reply', 'Resolve'];
        const result = await vscode.window.showInformationMessage(
            `${comment.authorName}: ${comment.text.substring(0, 100)}${comment.text.length > 100 ? '...' : ''}`,
            ...actions
        );

        if (result === 'Reply') {
            const reply = await vscode.window.showInputBox({ prompt: 'Enter your reply' });
            if (reply) {
                this.replyToComment(comment.id, reply);
            }
        } else if (result === 'Resolve') {
            this.resolveComment(comment.id);
        }
    }

    getComments(uri?: vscode.Uri): ReviewComment[] {
        const comments = Array.from(this.comments.values());
        if (uri) {
            return comments.filter(c => c.uri === uri.toString());
        }
        return comments;
    }

    getUnresolvedCount(): number {
        return Array.from(this.comments.values()).filter(c => !c.resolved).length;
    }

    dispose(): void {
        this.decorationType.dispose();
        this.resolvedDecorationType.dispose();
        this.onCommentsChanged.dispose();
    }
}
