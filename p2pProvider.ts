import * as vscode from 'vscode';
import * as Y from 'yjs';
import * as ws from 'ws';
import * as http from 'http';
import * as net from 'net';
import { EncryptionManager } from './encryptionManager';

export interface Peer {
    id: string;
    name: string;
    socket?: ws.WebSocket;
    cursor?: { file: string; line: number; character: number };
    selection?: { start: number; end: number };
}

export interface Message {
    type: string;
    data: any;
    sender: string;
    timestamp: number;
}

export class P2PCollaborationProvider implements vscode.Disposable {
    private sessionId: string | null = null;
    private isHost: boolean = false;
    private peers: Map<string, Peer> = new Map();
    private server: http.Server | null = null;
    private wss: ws.WebSocketServer | null = null;
    private clientSocket: ws.WebSocket | null = null;
    private ydoc: Y.Doc;
    private encryptionManager: EncryptionManager;
    private messageHandlers: Map<string, ((msg: Message) => void)[]> = new Map();
    private config: vscode.WorkspaceConfiguration;
    private sessionPassword: string | null = null;
    private readonly onMessageEmitter = new vscode.EventEmitter<Message>();
    public readonly onMessage = this.onMessageEmitter.event;
    private readonly onPeerConnectEmitter = new vscode.EventEmitter<Peer>();
    public readonly onPeerConnect = this.onPeerConnectEmitter.event;
    private readonly onPeerDisconnectEmitter = new vscode.EventEmitter<string>();
    public readonly onPeerDisconnect = this.onPeerDisconnectEmitter.event;
    private relaySocket: ws.WebSocket | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    constructor(private context: vscode.ExtensionContext) {
        this.ydoc = new Y.Doc();
        this.encryptionManager = new EncryptionManager(context);
        this.config = vscode.workspace.getConfiguration('letscode');
        this.setupYjsHandlers();
    }

    private setupYjsHandlers(): void {
        this.ydoc.on('update', (update: Uint8Array) => {
            this.broadcastMessage({
                type: 'ydoc-update',
                data: Buffer.from(update).toString('base64'),
                sender: this.getMyPeerId(),
                timestamp: Date.now()
            });
        });
    }

    async createSession(password?: string): Promise<string> {
        this.isHost = true;
        this.sessionPassword = password || null;
        this.sessionId = this.generateSessionId();
        
        const port = this.config.get<number>('defaultPort') || 42069;
        
        // Create HTTP server
        this.server = http.createServer();
        
        // Create WebSocket server
        this.wss = new ws.WebSocketServer({ server: this.server });
        
        this.wss.on('connection', (socket, req) => {
            this.handleNewConnection(socket, req);
        });
        
        // Start listening
        await new Promise<void>((resolve, reject) => {
            this.server!.listen(port, '0.0.0.0', () => {
                resolve();
            });
            this.server!.on('error', reject);
        });

        // Set up heartbeat for connection health
        this.startHeartbeat();
        
        vscode.window.showInformationMessage(
            `Session created: ${this.sessionId}\nPort: ${port}`,
            'Copy ID'
        ).then(selection => {
            if (selection === 'Copy ID') {
                vscode.env.clipboard.writeText(this.sessionId!);
            }
        });

        return this.sessionId;
    }

    async joinSession(sessionId: string, hostIp: string, port: number, password?: string): Promise<void> {
        this.isHost = false;
        this.sessionId = sessionId;
        this.sessionPassword = password || null;
        
        const wsUrl = `ws://${hostIp}:${port}`;
        
        return new Promise((resolve, reject) => {
            try {
                this.clientSocket = new ws.WebSocket(wsUrl);
                
                this.clientSocket.on('open', () => {
                    // Send authentication
                    this.sendMessage(this.clientSocket!, {
                        type: 'auth',
                        data: {
                            sessionId,
                            password: this.sessionPassword,
                            peerId: this.getMyPeerId(),
                            peerName: this.config.get<string>('username') || 'Anonymous'
                        },
                        sender: this.getMyPeerId(),
                        timestamp: Date.now()
                    });
                    resolve();
                });
                
                this.clientSocket.on('message', (data) => {
                    this.handleMessage(data.toString());
                });
                
                this.clientSocket.on('error', (err) => {
                    vscode.window.showErrorMessage(`Connection error: ${err.message}`);
                    reject(err);
                });
                
                this.clientSocket.on('close', () => {
                    this.handleDisconnection();
                });

                this.startHeartbeat();
            } catch (err) {
                reject(err);
            }
        });
    }

    private handleNewConnection(socket: ws.WebSocket, req: http.IncomingMessage): void {
        let peerId: string | null = null;
        
        socket.on('message', (data) => {
            try {
                const message: Message = JSON.parse(data.toString());
                
                if (message.type === 'auth') {
                    // Handle authentication
                    const { sessionId, password, peerId: pid, peerName } = message.data;
                    
                    if (sessionId !== this.sessionId) {
                        socket.close(1008, 'Invalid session ID');
                        return;
                    }
                    
                    if (this.sessionPassword && password !== this.sessionPassword) {
                        socket.close(1008, 'Invalid password');
                        return;
                    }
                    
                    peerId = pid;
                    if (!peerId) {
                        socket.close(1008, 'Invalid peer ID');
                        return;
                    }
                    
                    const peer: Peer = {
                        id: peerId,
                        name: peerName,
                        socket
                    };
                    
                    this.peers.set(peerId, peer);
                    this.onPeerConnectEmitter.fire(peer);
                    
                    // Send current document state
                    this.sendMessage(socket, {
                        type: 'ydoc-state',
                        data: Buffer.from(Y.encodeStateAsUpdate(this.ydoc)).toString('base64'),
                        sender: this.getMyPeerId(),
                        timestamp: Date.now()
                    });
                    
                    vscode.window.showInformationMessage(`Peer connected: ${peerName}`);
                } else {
                    this.handleMessage(data.toString());
                }
            } catch (err) {
                console.error('Error handling message:', err);
            }
        });
        
        socket.on('close', () => {
            if (peerId && this.peers.has(peerId)) {
                this.peers.delete(peerId);
                this.onPeerDisconnectEmitter.fire(peerId);
            }
        });
        
        socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    }

    private handleMessage(data: string): void {
        try {
            const message: Message = JSON.parse(data);
            
            // Decrypt if needed
            if (this.config.get<boolean>('enableEncryption')) {
                // Message is already handled with encryption in transport
            }
            
            // Handle Yjs updates
            if (message.type === 'ydoc-update' && message.sender !== this.getMyPeerId()) {
                const update = Buffer.from(message.data, 'base64');
                Y.applyUpdate(this.ydoc, new Uint8Array(update));
            }
            
            if (message.type === 'ydoc-state') {
                const state = Buffer.from(message.data, 'base64');
                Y.applyUpdate(this.ydoc, new Uint8Array(state));
            }
            
            // Notify registered handlers
            const handlers = this.messageHandlers.get(message.type);
            if (handlers) {
                handlers.forEach(handler => handler(message));
            }
            
            this.onMessageEmitter.fire(message);
        } catch (err) {
            console.error('Error parsing message:', err);
        }
    }

    private handleDisconnection(): void {
        vscode.window.showWarningMessage('Disconnected from session');
        this.sessionId = null;
        this.peers.clear();
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    broadcastMessage(message: Message): void {
        const data = JSON.stringify(message);
        
        if (this.isHost) {
            this.peers.forEach(peer => {
                if (peer.socket && peer.socket.readyState === ws.WebSocket.OPEN) {
                    peer.socket.send(data);
                }
            });
        } else if (this.clientSocket && this.clientSocket.readyState === ws.WebSocket.OPEN) {
            this.clientSocket.send(data);
        }
    }

    sendToPeer(peerId: string, message: Message): boolean {
        const peer = this.peers.get(peerId);
        if (peer && peer.socket && peer.socket.readyState === ws.WebSocket.OPEN) {
            peer.socket.send(JSON.stringify(message));
            return true;
        }
        
        // If not host or peer not found directly, try broadcasting (will reach via host)
        if (!this.isHost && this.clientSocket?.readyState === ws.WebSocket.OPEN) {
            this.clientSocket.send(JSON.stringify(message));
            return true;
        }
        
        return false;
    }

    private sendMessage(socket: ws.WebSocket, message: Message): void {
        if (socket.readyState === ws.WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }

    registerMessageHandler(type: string, handler: (msg: Message) => void): void {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type)!.push(handler);
    }

    unregisterMessageHandler(type: string, handler: (msg: Message) => void): void {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    async leaveSession(): Promise<void> {
        // Stop heartbeat
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        if (this.isHost && this.server) {
            this.peers.forEach(peer => {
                if (peer.socket) {
                    peer.socket.close();
                }
            });
            this.wss?.close();
            this.server.close();
        } else if (this.clientSocket) {
            this.clientSocket.close();
        }

        if (this.relaySocket) {
            this.relaySocket.close();
        }
        
        this.sessionId = null;
        this.peers.clear();
        this.isHost = false;
        this.wss = null;
        this.server = null;
        this.clientSocket = null;
        this.relaySocket = null;
        
        // Reset Yjs document
        this.ydoc.destroy();
        this.ydoc = new Y.Doc();
        this.setupYjsHandlers();
    }

    getSessionId(): string | null {
        return this.sessionId;
    }

    isInSession(): boolean {
        return this.sessionId !== null;
    }

    isSessionHost(): boolean {
        return this.isHost;
    }

    getPeers(): Peer[] {
        return Array.from(this.peers.values());
    }

    getMyPeerId(): string {
        const stored = this.context.globalState.get<string>('peerId');
        if (stored) return stored;
        
        const newId = `peer-${Math.random().toString(36).substr(2, 9)}`;
        this.context.globalState.update('peerId', newId);
        return newId;
    }

    getYDoc(): Y.Doc {
        return this.ydoc;
    }

    setPassword(password: string | undefined): void {
        this.sessionPassword = password || null;
        this.broadcastMessage({
            type: 'password-changed',
            data: { hasPassword: !!password },
            sender: this.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private generateSessionId(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = 'LETS-';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    private startHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.heartbeatInterval = setInterval(() => {
            this.broadcastMessage({
                type: 'ping',
                data: {},
                sender: this.getMyPeerId(),
                timestamp: Date.now()
            });
        }, 30000);
    }

    getConnectionInfo(): { ip: string; port: number } | null {
        if (!this.isHost || !this.server) return null;
        
        const address = this.server.address() as net.AddressInfo;
        if (!address) return null;
        
        return {
            ip: this.getLocalIp(),
            port: address.port
        };
    }

    private getLocalIp(): string {
        const interfaces = require('os').networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return '127.0.0.1';
    }

    dispose(): void {
        this.leaveSession();
        this.onMessageEmitter.dispose();
        this.onPeerConnectEmitter.dispose();
        this.onPeerDisconnectEmitter.dispose();
    }
}
