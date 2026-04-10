import * as vscode from 'vscode';
import { P2PCollaborationProvider, Message } from './p2pProvider';

export interface ChatMessage {
    id: string;
    text: string;
    sender: string;
    senderName: string;
    timestamp: number;
    type: 'text' | 'system' | 'file';
}

export class ChatManager implements vscode.Disposable {
    private messages: ChatMessage[] = [];
    private onMessageReceived = new vscode.EventEmitter<ChatMessage>();
    public readonly onMessage = this.onMessageReceived.event;
    private maxMessages = 100;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.p2pProvider.registerMessageHandler('chat', (msg) => {
            this.handleIncomingMessage(msg);
        });

        this.p2pProvider.registerMessageHandler('system', (msg) => {
            this.handleSystemMessage(msg);
        });

        this.p2pProvider.onPeerConnect((peer) => {
            this.addSystemMessage(`${peer.name} joined the session`);
        });

        this.p2pProvider.onPeerDisconnect((peerId) => {
            const peers = this.p2pProvider.getPeers();
            const peer = peers.find(p => p.id === peerId);
            const name = peer?.name || 'Unknown';
            this.addSystemMessage(`${name} left the session`);
        });
    }

    sendMessage(text: string, type: 'text' | 'file' = 'text'): void {
        const config = vscode.workspace.getConfiguration('letscode');
        const username = config.get<string>('username') || 'Anonymous';
        
        const message: ChatMessage = {
            id: this.generateId(),
            text,
            sender: this.p2pProvider.getMyPeerId(),
            senderName: username,
            timestamp: Date.now(),
            type
        };

        this.messages.push(message);
        this.trimMessages();

        this.p2pProvider.broadcastMessage({
            type: 'chat',
            data: message,
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.onMessageReceived.fire(message);
    }

    sendFileMessage(fileName: string, fileData: string): void {
        this.p2pProvider.broadcastMessage({
            type: 'file-share',
            data: { fileName, fileData },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.sendMessage(`Shared file: ${fileName}`, 'file');
    }

    private handleIncomingMessage(message: Message): void {
        const chatMsg = message.data as ChatMessage;
        chatMsg.senderName = chatMsg.senderName || `Peer ${chatMsg.sender.substr(0, 6)}`;
        
        this.messages.push(chatMsg);
        this.trimMessages();
        
        this.onMessageReceived.fire(chatMsg);
        
        // Show notification for new messages
        if (chatMsg.type === 'text') {
            vscode.window.showInformationMessage(
                `${chatMsg.senderName}: ${chatMsg.text.substring(0, 50)}${chatMsg.text.length > 50 ? '...' : ''}`,
                'Reply'
            ).then(selection => {
                if (selection === 'Reply') {
                    vscode.commands.executeCommand('letscode.sendChatMessage');
                }
            });
        }
    }

    private handleSystemMessage(message: Message): void {
        const systemMsg: ChatMessage = {
            id: this.generateId(),
            text: message.data.text,
            sender: 'system',
            senderName: 'System',
            timestamp: Date.now(),
            type: 'system'
        };

        this.messages.push(systemMsg);
        this.onMessageReceived.fire(systemMsg);
    }

    private addSystemMessage(text: string): void {
        const message: ChatMessage = {
            id: this.generateId(),
            text,
            sender: 'system',
            senderName: 'System',
            timestamp: Date.now(),
            type: 'system'
        };

        this.messages.push(message);
        this.trimMessages();
        this.onMessageReceived.fire(message);

        this.p2pProvider.broadcastMessage({
            type: 'system',
            data: { text },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    getMessages(): ChatMessage[] {
        return [...this.messages];
    }

    clearHistory(): void {
        this.messages = [];
    }

    private trimMessages(): void {
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }
    }

    private generateId(): string {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    dispose(): void {
        this.onMessageReceived.dispose();
    }
}
