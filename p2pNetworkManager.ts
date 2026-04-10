import * as vscode from 'vscode';
import { EventEmitter } from 'events';

export interface NetworkPeer {
    id: string;
    name: string;
    deviceType: 'desktop' | 'laptop' | 'mobile' | 'server';
    status: 'online' | 'offline' | 'busy';
    storageAvailable: number;
    storageUsed: number;
    lastSeen: number;
    ip?: string;
    port?: number;
    capabilities: string[];
    isHost: boolean;
}

export interface DistributedFile {
    id: string;
    name: string;
    path: string;
    content: string;
    version: number;
    checksum: string;
    size: number;
    owner: string;
    replicas: string[];
    timestamp: number;
    synced: boolean;
}

export interface NetworkMessage {
    type: 'peer-discovery' | 'file-request' | 'file-offer' | 'sync-request' | 
          'sync-response' | 'heartbeat' | 'storage-query' | 'storage-response' |
          'collab-edit' | 'collab-cursor' | 'commit' | 'commit-request' |
          'terminal-command' | 'terminal-output' | 'chat' | 'extension-recommend';
    sender: string;
    target?: string;
    payload: any;
    timestamp: number;
    signature?: string;
}

export class P2PNetworkManager extends EventEmitter implements vscode.Disposable {
    private peers: Map<string, NetworkPeer> = new Map();
    private localFiles: Map<string, DistributedFile> = new Map();
    private remoteFiles: Map<string, DistributedFile> = new Map();
    private myNodeId: string;
    private isListening: boolean = false;
    private heartbeatInterval?: NodeJS.Timeout;
    private statusBarItem: vscode.StatusBarItem;
    private outputChannel: vscode.OutputChannel;
    private storageQuota: number = 1024 * 1024 * 1024; // 1GB default
    private storageUsed: number = 0;
    private messageQueue: NetworkMessage[] = [];

    constructor(private context: vscode.ExtensionContext) {
        super();
        this.myNodeId = this.generateNodeId();
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.outputChannel = vscode.window.createOutputChannel('Let\'s Code - P2P Network');
        
        this.initializeNetwork();
        this.setupEventListeners();
    }

    private generateNodeId(): string {
        const machineId = vscode.env.machineId;
        const sessionId = Math.random().toString(36).substr(2, 9);
        return `node-${machineId}-${sessionId}`;
    }

    private async initializeNetwork(): Promise<void> {
        this.outputChannel.appendLine(`🚀 Initializing P2P Network Node: ${this.myNodeId}`);
        
        // Load stored peers
        const storedPeers = this.context.globalState.get<NetworkPeer[]>('networkPeers', []);
        for (const peer of storedPeers) {
            if (peer.id !== this.myNodeId) {
                this.peers.set(peer.id, { ...peer, status: 'offline' });
            }
        }

        // Calculate storage
        await this.calculateStorage();
        
        // Start network services
        this.startHeartbeat();
        this.startMessageProcessor();
        
        this.updateStatusBar();
        this.outputChannel.appendLine(`✅ P2P Node ready with ${this.peers.size} known peers`);
    }

    private setupEventListeners(): void {
        // Listen for file changes
        vscode.workspace.onDidSaveTextDocument((doc) => {
            this.handleLocalFileChange(doc);
        });

        // Listen for file creation
        vscode.workspace.onDidCreateFiles((event) => {
            for (const file of event.files) {
                this.handleLocalFileCreate(file);
            }
        });

        // Listen for file deletion
        vscode.workspace.onDidDeleteFiles((event) => {
            for (const file of event.files) {
                this.handleLocalFileDelete(file);
            }
        });
    }

    private async calculateStorage(): Promise<void> {
        try {
            const storage = await vscode.workspace.fs.readDirectory(vscode.Uri.file(this.context.globalStorageUri.fsPath));
            let totalSize = 0;
            for (const [name, type] of storage) {
                if (type === vscode.FileType.File) {
                    const stat = await vscode.workspace.fs.stat(vscode.Uri.joinPath(this.context.globalStorageUri, name));
                    totalSize += stat.size;
                }
            }
            this.storageUsed = totalSize;
        } catch (err) {
            this.outputChannel.appendLine(`Storage calculation error: ${err}`);
        }
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            this.broadcastHeartbeat();
        }, 30000); // Every 30 seconds
    }

    private startMessageProcessor(): void {
        setInterval(() => {
            this.processMessageQueue();
        }, 100);
    }

    private broadcastHeartbeat(): void {
        const message: NetworkMessage = {
            type: 'heartbeat',
            sender: this.myNodeId,
            payload: {
                name: vscode.env.appHost,
                deviceType: 'desktop',
                storageAvailable: this.storageQuota - this.storageUsed,
                storageUsed: this.storageUsed,
                capabilities: ['file-sync', 'collab-edit', 'terminal-share', 'chat'],
                fileCount: this.localFiles.size
            },
            timestamp: Date.now()
        };
        
        this.broadcast(message);
    }

    public async connectToPeer(peerId: string, address?: string): Promise<boolean> {
        this.outputChannel.appendLine(`🔌 Connecting to peer: ${peerId}`);
        
        // Simulate connection (in real implementation, this would use WebRTC/WebSocket)
        const peer: NetworkPeer = {
            id: peerId,
            name: `Peer-${peerId.substr(0, 6)}`,
            deviceType: 'desktop',
            status: 'online',
            storageAvailable: 0,
            storageUsed: 0,
            lastSeen: Date.now(),
            capabilities: [],
            isHost: false
        };
        
        this.peers.set(peerId, peer);
        this.emit('peer-connected', peer);
        this.updateStatusBar();
        
        // Request sync
        this.requestSync(peerId);
        
        return true;
    }

    public async createTeamSession(sessionName: string): Promise<string> {
        const sessionId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.outputChannel.appendLine(`🌟 Creating team session: ${sessionName} (${sessionId})`);
        
        // Store session info
        const sessions = this.context.globalState.get<any[]>('teamSessions', []);
        sessions.push({
            id: sessionId,
            name: sessionName,
            host: this.myNodeId,
            created: Date.now(),
            peers: [this.myNodeId]
        });
        await this.context.globalState.update('teamSessions', sessions);
        
        // Broadcast session creation
        this.broadcast({
            type: 'peer-discovery',
            sender: this.myNodeId,
            payload: {
                event: 'session-created',
                sessionId,
                sessionName,
                host: this.myNodeId
            },
            timestamp: Date.now()
        });
        
        this.updateStatusBar();
        return sessionId;
    }

    public async joinTeamSession(sessionId: string): Promise<boolean> {
        this.outputChannel.appendLine(`🤝 Joining team session: ${sessionId}`);
        
        // Request to join
        this.broadcast({
            type: 'peer-discovery',
            sender: this.myNodeId,
            payload: {
                event: 'join-request',
                sessionId,
                peer: this.getMyPeerInfo()
            },
            timestamp: Date.now()
        });
        
        return true;
    }

    public async shareFile(uri: vscode.Uri): Promise<DistributedFile> {
        const content = await vscode.workspace.fs.readFile(uri);
        const contentString = Buffer.from(content).toString('utf8');
        
        const file: DistributedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: uri.path.split('/').pop() || 'unknown',
            path: uri.fsPath,
            content: contentString,
            version: 1,
            checksum: this.calculateChecksum(contentString),
            size: content.length,
            owner: this.myNodeId,
            replicas: [this.myNodeId],
            timestamp: Date.now(),
            synced: false
        };
        
        this.localFiles.set(file.id, file);
        this.storageUsed += file.size;
        
        // Replicate to other peers
        await this.replicateFile(file);
        
        this.updateStatusBar();
        this.outputChannel.appendLine(`📤 Shared file: ${file.name} (${file.size} bytes)`);
        
        return file;
    }

    public async replicateFile(file: DistributedFile): Promise<void> {
        // Select 2 peers with most available storage for replication
        const availablePeers = Array.from(this.peers.values())
            .filter(p => p.status === 'online' && p.id !== this.myNodeId)
            .sort((a, b) => b.storageAvailable - a.storageAvailable)
            .slice(0, 2);
        
        for (const peer of availablePeers) {
            this.sendToPeer(peer.id, {
                type: 'file-offer',
                sender: this.myNodeId,
                target: peer.id,
                payload: {
                    fileId: file.id,
                    name: file.name,
                    checksum: file.checksum,
                    size: file.size
                },
                timestamp: Date.now()
            });
            
            file.replicas.push(peer.id);
        }
        
        this.localFiles.set(file.id, file);
    }

    public async requestFile(fileId: string, fromPeer?: string): Promise<DistributedFile | null> {
        this.outputChannel.appendLine(`📥 Requesting file: ${fileId}`);
        
        // Check local cache
        if (this.localFiles.has(fileId)) {
            return this.localFiles.get(fileId)!;
        }
        
        if (this.remoteFiles.has(fileId)) {
            return this.remoteFiles.get(fileId)!;
        }
        
        // Request from network
        this.broadcast({
            type: 'file-request',
            sender: this.myNodeId,
            target: fromPeer,
            payload: { fileId },
            timestamp: Date.now()
        });
        
        return null;
    }

    public async syncWithPeer(peerId: string): Promise<void> {
        this.sendToPeer(peerId, {
            type: 'sync-request',
            sender: this.myNodeId,
            target: peerId,
            payload: {
                fileList: Array.from(this.localFiles.values()).map(f => ({
                    id: f.id,
                    name: f.name,
                    checksum: f.checksum,
                    version: f.version
                }))
            },
            timestamp: Date.now()
        });
    }

    public async broadcast(message: NetworkMessage): Promise<void> {
        for (const peerId of this.peers.keys()) {
            this.sendToPeer(peerId, message);
        }
    }

    public async sendToPeer(peerId: string, message: NetworkMessage): Promise<void> {
        // In real implementation, this would use WebRTC data channel
        // For now, we emit events that other components can listen to
        this.messageQueue.push({ ...message, target: peerId });
    }

    private processMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                this.handleMessage(message);
            }
        }
    }

    private handleMessage(message: NetworkMessage): void {
        switch (message.type) {
            case 'heartbeat':
                this.handleHeartbeat(message);
                break;
            case 'file-request':
                this.handleFileRequest(message);
                break;
            case 'file-offer':
                this.handleFileOffer(message);
                break;
            case 'sync-request':
                this.handleSyncRequest(message);
                break;
            case 'collab-edit':
                this.emit('collab-edit', message.payload);
                break;
            case 'chat':
                this.emit('chat-message', message.payload);
                break;
            case 'terminal-command':
                this.emit('terminal-command', message.payload);
                break;
        }
    }

    private handleHeartbeat(message: NetworkMessage): void {
        const peer = this.peers.get(message.sender);
        if (peer) {
            peer.status = 'online';
            peer.lastSeen = Date.now();
            peer.storageAvailable = message.payload.storageAvailable;
            peer.storageUsed = message.payload.storageUsed;
            peer.capabilities = message.payload.capabilities;
        } else {
            this.peers.set(message.sender, {
                id: message.sender,
                name: message.payload.name,
                deviceType: message.payload.deviceType,
                status: 'online',
                storageAvailable: message.payload.storageAvailable,
                storageUsed: message.payload.storageUsed,
                lastSeen: Date.now(),
                capabilities: message.payload.capabilities,
                isHost: false
            });
            this.emit('peer-connected', this.peers.get(message.sender));
        }
        this.updateStatusBar();
    }

    private handleFileRequest(message: NetworkMessage): void {
        const file = this.localFiles.get(message.payload.fileId);
        if (file && message.target === this.myNodeId) {
            this.sendToPeer(message.sender, {
                type: 'file-offer',
                sender: this.myNodeId,
                target: message.sender,
                payload: file,
                timestamp: Date.now()
            });
        }
    }

    private handleFileOffer(message: NetworkMessage): void {
        if (message.payload.content) {
            // Full file received
            const file: DistributedFile = {
                ...message.payload,
                replicas: [...message.payload.replicas, this.myNodeId],
                synced: true
            };
            this.remoteFiles.set(file.id, file);
            this.emit('file-received', file);
        }
    }

    private handleSyncRequest(message: NetworkMessage): void {
        // Compare file lists and send missing files
        const remoteFiles = message.payload.fileList;
        const missingFiles: string[] = [];
        
        for (const remoteFile of remoteFiles) {
            const localFile = this.localFiles.get(remoteFile.id);
            if (!localFile || localFile.version < remoteFile.version) {
                missingFiles.push(remoteFile.id);
            }
        }
        
        // Send response with files we have that peer doesn't
        const filesToOffer = Array.from(this.localFiles.values())
            .filter(f => !remoteFiles.find((rf: any) => rf.id === f.id && rf.version >= f.version));
        
        this.sendToPeer(message.sender, {
            type: 'sync-response',
            sender: this.myNodeId,
            target: message.sender,
            payload: {
                missingFiles,
                filesToOffer: filesToOffer.map(f => ({ id: f.id, name: f.name, checksum: f.checksum }))
            },
            timestamp: Date.now()
        });
    }

    private handleLocalFileChange(doc: vscode.TextDocument): void {
        const existingFile = Array.from(this.localFiles.values())
            .find(f => f.path === doc.uri.fsPath);
        
        if (existingFile) {
            existingFile.content = doc.getText();
            existingFile.version++;
            existingFile.checksum = this.calculateChecksum(existingFile.content);
            existingFile.timestamp = Date.now();
            existingFile.synced = false;
            
            this.localFiles.set(existingFile.id, existingFile);
            this.replicateFile(existingFile);
            
            this.emit('file-updated', existingFile);
        }
    }

    private async handleLocalFileCreate(uri: vscode.Uri): Promise<void> {
        await this.shareFile(uri);
    }

    private handleLocalFileDelete(uri: vscode.Uri): void {
        const file = Array.from(this.localFiles.values())
            .find(f => f.path === uri.fsPath);
        
        if (file) {
            this.localFiles.delete(file.id);
            this.storageUsed -= file.size;
            
            this.broadcast({
                type: 'file-offer',
                sender: this.myNodeId,
                payload: {
                    event: 'file-deleted',
                    fileId: file.id
                },
                timestamp: Date.now()
            });
            
            this.updateStatusBar();
        }
    }

    private calculateChecksum(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    private requestSync(peerId: string): void {
        this.syncWithPeer(peerId);
    }

    private getMyPeerInfo(): NetworkPeer {
        return {
            id: this.myNodeId,
            name: vscode.env.appHost,
            deviceType: 'desktop',
            status: 'online',
            storageAvailable: this.storageQuota - this.storageUsed,
            storageUsed: this.storageUsed,
            lastSeen: Date.now(),
            capabilities: ['file-sync', 'collab-edit', 'terminal-share', 'chat'],
            isHost: false
        };
    }

    private updateStatusBar(): void {
        const onlinePeers = Array.from(this.peers.values()).filter(p => p.status === 'online').length;
        const files = this.localFiles.size;
        const storageMB = Math.round(this.storageUsed / 1024 / 1024);
        
        this.statusBarItem.text = `$(cloud) ${onlinePeers} peers | $(file) ${files} files | $(database) ${storageMB}MB`;
        this.statusBarItem.tooltip = `P2P Network: ${onlinePeers} peers online\n${files} files stored\n${storageMB}MB used`;
        this.statusBarItem.show();
    }

    public getPeers(): NetworkPeer[] {
        return Array.from(this.peers.values());
    }

    public getOnlinePeers(): NetworkPeer[] {
        return Array.from(this.peers.values()).filter(p => p.status === 'online');
    }

    public getMyNodeId(): string {
        return this.myNodeId;
    }

    public getLocalFiles(): DistributedFile[] {
        return Array.from(this.localFiles.values());
    }

    public getAllFiles(): DistributedFile[] {
        return [...Array.from(this.localFiles.values()), ...Array.from(this.remoteFiles.values())];
    }

    public async getNetworkStats(): Promise<{
        peers: number;
        onlinePeers: number;
        localFiles: number;
        totalFiles: number;
        storageUsed: number;
        storageAvailable: number;
        networkStorage: number;
    }> {
        const onlinePeers = this.getOnlinePeers();
        const networkStorage = onlinePeers.reduce((sum, p) => sum + p.storageAvailable, 0);
        
        return {
            peers: this.peers.size,
            onlinePeers: onlinePeers.length,
            localFiles: this.localFiles.size,
            totalFiles: this.localFiles.size + this.remoteFiles.size,
            storageUsed: this.storageUsed,
            storageAvailable: this.storageQuota - this.storageUsed,
            networkStorage
        };
    }

    public dispose(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
        
        // Save peers
        this.context.globalState.update('networkPeers', Array.from(this.peers.values()));
    }
}
