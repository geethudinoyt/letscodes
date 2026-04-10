import * as vscode from 'vscode';
import { P2PCollaborationProvider, Message, Peer } from './p2pProvider';

export interface CommandExecution {
    commandId: string;
    command: string;
    sender: string;
    timestamp: number;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    output?: string;
    error?: string;
    executedOn: string[];
}

export class TerminalSharing implements vscode.Disposable {
    private isSharing: boolean = false;
    private sharedTerminal: vscode.Terminal | null = null;
    private outputChannel: vscode.OutputChannel;
    private statusBarItem: vscode.StatusBarItem;
    private commandHistory: CommandExecution[] = [];
    private pendingCommands: Map<string, CommandExecution> = new Map();
    private autoExecuteCommands: boolean = false;
    private broadcastMode: boolean = false;

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.outputChannel = vscode.window.createOutputChannel('Let\'s Code - Shared Terminal');
        
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 97);
        this.statusBarItem.text = '$(terminal) Terminal';
        this.statusBarItem.tooltip = 'Terminal Sharing';
        this.statusBarItem.command = 'letscode.toggleTerminalBroadcast';
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);
        
        this.p2pProvider.registerMessageHandler('terminal-output', (msg) => {
            this.handleTerminalOutput(msg);
        });

        this.p2pProvider.registerMessageHandler('terminal-command', (msg) => {
            this.handleTerminalCommand(msg);
        });

        this.p2pProvider.registerMessageHandler('execute-command', (msg) => {
            this.handleExecuteCommand(msg);
        });

        this.p2pProvider.registerMessageHandler('command-status', (msg) => {
            this.handleCommandStatus(msg);
        });

        // Listen for terminal creation
        vscode.window.onDidOpenTerminal((terminal) => {
            if (this.isSharing && this.p2pProvider.isInSession()) {
                this.p2pProvider.broadcastMessage({
                    type: 'system',
                    data: { text: `Terminal opened: ${terminal.name}` },
                    sender: this.p2pProvider.getMyPeerId(),
                    timestamp: Date.now()
                });
            }
        });
    }

    private startSharing(): void {
        vscode.window.showInformationMessage('Terminal sharing enabled');
        
        // Create or show output channel
        this.outputChannel.show(true);
        this.outputChannel.appendLine('=== Terminal Sharing Started ===');
        this.outputChannel.appendLine('All terminal output will be shared with peers.\n');

        // Notify peers
        this.p2pProvider.broadcastMessage({
            type: 'terminal-sharing-started',
            data: {},
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private stopSharing(): void {
        vscode.window.showInformationMessage('Terminal sharing disabled');
        this.outputChannel.appendLine('\n=== Terminal Sharing Stopped ===');

        // Notify peers
        this.p2pProvider.broadcastMessage({
            type: 'terminal-sharing-stopped',
            data: {},
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    shareOutput(output: string): void {
        if (!this.isSharing || !this.p2pProvider.isInSession()) return;

        this.p2pProvider.broadcastMessage({
            type: 'terminal-output',
            data: { output },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.outputChannel.append(output);
    }

    shareCommand(command: string): void {
        if (!this.isSharing || !this.p2pProvider.isInSession()) return;

        this.p2pProvider.broadcastMessage({
            type: 'terminal-command',
            data: { command },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.outputChannel.appendLine(`$ ${command}`);
    }

    private handleTerminalOutput(message: Message): void {
        const { output } = message.data;
        const peers = this.p2pProvider.getPeers();
        const peer = peers.find(p => p.id === message.sender);
        const peerName = peer?.name || `Peer ${message.sender.substr(0, 6)}`;

        this.outputChannel.appendLine(`[${peerName}] Output:`);
        this.outputChannel.appendLine(output);
        this.outputChannel.appendLine('');

        // Show notification for new output
        if (this.outputChannel) {
            // Output channel is already visible, just append
        }
    }

    private async handleTerminalCommand(message: Message): Promise<void> {
        const { command } = message.data;
        const peers = this.p2pProvider.getPeers();
        const peer = peers.find((p: Peer) => p.id === message.sender);
        const peerName = peer?.name || `Peer ${message.sender.substr(0, 6)}`;

        this.outputChannel.appendLine(`[${peerName}] $ ${command}`);

        // Show notification with execute option
        if (this.autoExecuteCommands) {
            await this.executeCommand(command, message.sender);
        } else {
            const result = await vscode.window.showInformationMessage(
                `${peerName} wants to run: "${command}"`,
                'Execute Now',
                'Execute on All',
                'Dismiss'
            );

            if (result === 'Execute Now') {
                await this.executeCommand(command, message.sender);
            } else if (result === 'Execute on All') {
                await this.broadcastAndExecute(command);
            }
        }
    }

    private async handleExecuteCommand(message: Message): Promise<void> {
        const { commandId, command, sender } = message.data;
        
        // Show notification about incoming command
        const result = await vscode.window.showWarningMessage(
            `Peer wants to execute: "${command}" on your device`,
            'Allow',
            'Allow Always',
            'Deny'
        );

        if (result === 'Allow' || result === 'Allow Always') {
            if (result === 'Allow Always') {
                this.autoExecuteCommands = true;
            }

            const execution: CommandExecution = {
                commandId,
                command,
                sender,
                timestamp: Date.now(),
                status: 'executing',
                executedOn: [this.p2pProvider.getMyPeerId()]
            };

            try {
                const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Shared Command');
                terminal.show();
                
                // Send command
                terminal.sendText(command);
                
                execution.status = 'completed';
                execution.output = `Command executed: ${command}`;
                
                this.outputChannel.appendLine(`[Me] Executed: ${command}`);
                
                // Report status back
                this.p2pProvider.sendToPeer(sender, {
                    type: 'command-status',
                    data: { commandId, status: 'completed', peerId: this.p2pProvider.getMyPeerId() },
                    sender: this.p2pProvider.getMyPeerId(),
                    timestamp: Date.now()
                });

            } catch (error) {
                execution.status = 'failed';
                execution.error = String(error);
                
                this.p2pProvider.sendToPeer(sender, {
                    type: 'command-status',
                    data: { commandId, status: 'failed', error: String(error), peerId: this.p2pProvider.getMyPeerId() },
                    sender: this.p2pProvider.getMyPeerId(),
                    timestamp: Date.now()
                });
            }

            this.commandHistory.push(execution);
        } else {
            // Report denial
            this.p2pProvider.sendToPeer(sender, {
                type: 'command-status',
                data: { commandId, status: 'failed', error: 'User denied execution', peerId: this.p2pProvider.getMyPeerId() },
                sender: this.p2pProvider.getMyPeerId(),
                timestamp: Date.now()
            });
        }
    }

    private handleCommandStatus(message: Message): void {
        const { commandId, status, error, peerId } = message.data;
        const peers = this.p2pProvider.getPeers();
        const peer = peers.find((p: Peer) => p.id === peerId);
        const peerName = peer?.name || `Peer ${peerId.substr(0, 6)}`;

        const execution = this.pendingCommands.get(commandId);
        if (execution) {
            execution.executedOn.push(peerId);
            
            if (status === 'completed') {
                this.outputChannel.appendLine(`[${peerName}] ✓ Executed successfully`);
            } else {
                this.outputChannel.appendLine(`[${peerName}] ✗ Failed: ${error || 'Unknown error'}`);
            }

            // Check if all peers executed
            const totalPeers = this.p2pProvider.getPeers().length + 1; // +1 for self
            if (execution.executedOn.length >= totalPeers) {
                execution.status = 'completed';
                this.pendingCommands.delete(commandId);
                
                vscode.window.showInformationMessage(
                    `Command executed on ${execution.executedOn.length} devices`,
                    'View Output'
                ).then(selection => {
                    if (selection === 'View Output') {
                        this.outputChannel.show();
                    }
                });
            }
        }
    }

    async executeCommand(command: string, requester?: string): Promise<void> {
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Shared');
        terminal.show();
        terminal.sendText(command);
        
        this.outputChannel.appendLine(`[Me] $ ${command}`);
    }

    async broadcastAndExecute(command: string): Promise<void> {
        if (!this.p2pProvider.isInSession()) {
            vscode.window.showWarningMessage('Not in a collaboration session');
            return;
        }

        const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const execution: CommandExecution = {
            commandId,
            command,
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now(),
            status: 'pending',
            executedOn: []
        };

        this.pendingCommands.set(commandId, execution);
        this.commandHistory.push(execution);

        // Execute locally first
        await this.executeCommand(command);
        execution.executedOn.push(this.p2pProvider.getMyPeerId());

        // Broadcast to all peers
        this.p2pProvider.broadcastMessage({
            type: 'execute-command',
            data: { commandId, command, sender: this.p2pProvider.getMyPeerId() },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.outputChannel.appendLine(`Broadcasting command to all peers: ${command}`);
        
        // Show progress
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Executing "${command}" on all devices...`,
            cancellable: false
        }, async (progress) => {
            const totalPeers = this.p2pProvider.getPeers().length + 1;
            const checkInterval = setInterval(() => {
                const executedCount = execution.executedOn.length;
                progress.report({ 
                    increment: (100 / totalPeers), 
                    message: `${executedCount}/${totalPeers} devices` 
                });
                
                if (executedCount >= totalPeers) {
                    clearInterval(checkInterval);
                }
            }, 500);

            // Wait for completion (timeout after 30 seconds)
            await new Promise(resolve => setTimeout(resolve, 30000));
            clearInterval(checkInterval);
        });
    }

    toggleSharing(): void {
        this.isSharing = !this.isSharing;
        
        if (this.isSharing) {
            this.startSharing();
        } else {
            this.stopSharing();
        }
        this.updateStatusBar();
    }

    toggleBroadcastMode(): void {
        this.broadcastMode = !this.broadcastMode;
        vscode.window.showInformationMessage(
            `Broadcast mode ${this.broadcastMode ? 'enabled' : 'disabled'}. Commands will ${this.broadcastMode ? 'now' : 'not'} be sent to all peers.`
        );
        this.updateStatusBar();
    }

    private updateStatusBar(): void {
        if (this.isSharing && this.broadcastMode) {
            this.statusBarItem.text = '$(terminal) Terminal: ON + Broadcast';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        } else if (this.isSharing) {
            this.statusBarItem.text = '$(terminal) Terminal: ON';
            this.statusBarItem.backgroundColor = undefined;
        } else {
            this.statusBarItem.text = '$(terminal) Terminal: OFF';
            this.statusBarItem.backgroundColor = undefined;
        }
    }

    isCurrentlySharing(): boolean {
        return this.isSharing;
    }

    getCommandHistory(): CommandExecution[] {
        return this.commandHistory;
    }

    dispose(): void {
        this.outputChannel.dispose();
        this.statusBarItem.dispose();
    }
}
