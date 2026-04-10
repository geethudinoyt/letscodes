import * as vscode from 'vscode';
import * as Y from 'yjs';
import { P2PCollaborationProvider, Message } from './p2pProvider';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
}

export class TaskBoardProvider implements vscode.Disposable {
    private panel: vscode.WebviewPanel | undefined;
    private tasks: Map<string, Task> = new Map();
    private ytasks: Y.Map<any>;
    private onTasksChanged = new vscode.EventEmitter<Task[]>();

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.ytasks = this.p2pProvider.getYDoc().getMap('tasks');
        
        // Sync with Yjs
        this.ytasks.observe(() => {
            this.syncFromYjs();
        });

        this.p2pProvider.registerMessageHandler('task-update', (msg) => {
            this.handleTaskUpdate(msg);
        });

        this.p2pProvider.registerMessageHandler('task-delete', (msg) => {
            this.handleTaskDelete(msg);
        });
    }

    show(): void {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'letscodeTaskBoard',
            'Task Board',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getHtmlForWebview();

        this.panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'addTask':
                    this.addTask(message.data);
                    break;
                case 'updateTask':
                    this.updateTask(message.data);
                    break;
                case 'deleteTask':
                    this.deleteTask(message.data.id);
                    break;
                case 'moveTask':
                    this.moveTask(message.data.id, message.data.status);
                    break;
                case 'getTasks':
                    this.sendTasksToWebview();
                    break;
            }
        });

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    private addTask(taskData: Partial<Task>): void {
        const config = vscode.workspace.getConfiguration('letscode');
        const username = config.get<string>('username') || 'Anonymous';

        const task: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: taskData.title || 'Untitled Task',
            description: taskData.description || '',
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            assignee: taskData.assignee || username,
            createdBy: username,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.tasks.set(task.id, task);
        this.ytasks.set(task.id, JSON.parse(JSON.stringify(task)));

        this.broadcastTaskUpdate(task);
        this.sendTasksToWebview();
    }

    private updateTask(taskData: Partial<Task> & { id: string }): void {
        const existing = this.tasks.get(taskData.id);
        if (!existing) return;

        const updated: Task = {
            ...existing,
            ...taskData,
            updatedAt: Date.now()
        };

        this.tasks.set(updated.id, updated);
        this.ytasks.set(updated.id, JSON.parse(JSON.stringify(updated)));

        this.broadcastTaskUpdate(updated);
        this.sendTasksToWebview();
    }

    private deleteTask(taskId: string): void {
        this.tasks.delete(taskId);
        this.ytasks.delete(taskId);

        this.p2pProvider.broadcastMessage({
            type: 'task-delete',
            data: { id: taskId },
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.sendTasksToWebview();
    }

    private moveTask(taskId: string, status: Task['status']): void {
        const task = this.tasks.get(taskId);
        if (!task) return;

        task.status = status;
        task.updatedAt = Date.now();

        this.tasks.set(taskId, task);
        this.ytasks.set(taskId, JSON.parse(JSON.stringify(task)));

        this.broadcastTaskUpdate(task);
        this.sendTasksToWebview();
    }

    private broadcastTaskUpdate(task: Task): void {
        this.p2pProvider.broadcastMessage({
            type: 'task-update',
            data: task,
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private handleTaskUpdate(message: Message): void {
        const task = message.data as Task;
        this.tasks.set(task.id, task);
        this.sendTasksToWebview();
    }

    private handleTaskDelete(message: Message): void {
        const { id } = message.data;
        this.tasks.delete(id);
        this.sendTasksToWebview();
    }

    private syncFromYjs(): void {
        this.ytasks.forEach((data, id) => {
            this.tasks.set(id, data as Task);
        });
        this.sendTasksToWebview();
    }

    private sendTasksToWebview(): void {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'updateTasks',
                data: Array.from(this.tasks.values())
            });
        }
    }

    getTasks(): Task[] {
        return Array.from(this.tasks.values());
    }

    private getHtmlForWebview(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Board</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            padding: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        h1 { font-size: 20px; font-weight: 600; }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
        }
        .board {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }
        .column {
            background: #1e293b;
            border-radius: 12px;
            padding: 12px;
        }
        .column-header {
            font-size: 14px;
            font-weight: 600;
            padding: 8px;
            margin-bottom: 12px;
            border-radius: 6px;
            text-align: center;
        }
        .todo .column-header { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }
        .in-progress .column-header { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
        .done .column-header { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .task-card {
            background: #334155;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: grab;
            transition: transform 0.2s;
        }
        .task-card:hover { transform: translateY(-2px); }
        .task-title { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
        .task-meta {
            display: flex;
            gap: 8px;
            font-size: 11px;
            color: #94a3b8;
        }
        .priority-high { color: #ef4444; }
        .priority-medium { color: #f59e0b; }
        .priority-low { color: #10b981; }
        .assignee { display: flex; align-items: center; gap: 4px; }
        .modal {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8);
            justify-content: center;
            align-items: center;
            z-index: 100;
        }
        .modal.show { display: flex; }
        .modal-content {
            background: #1e293b;
            padding: 20px;
            border-radius: 12px;
            width: 400px;
        }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 12px; margin-bottom: 6px; color: #94a3b8; }
        input, textarea, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #334155;
            border-radius: 6px;
            background: #0f172a;
            color: #f8fafc;
            font-size: 13px;
        }
        textarea { height: 80px; resize: vertical; }
        .modal-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .btn-secondary {
            background: #334155;
            color: #f8fafc;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Task Board</h1>
        <button class="btn" onclick="showAddModal()">+ Add Task</button>
    </div>

    <div class="board">
        <div class="column todo">
            <div class="column-header">To Do</div>
            <div id="todo-tasks"></div>
        </div>
        <div class="column in-progress">
            <div class="column-header">In Progress</div>
            <div id="inprogress-tasks"></div>
        </div>
        <div class="column done">
            <div class="column-header">Done</div>
            <div id="done-tasks"></div>
        </div>
    </div>

    <div class="modal" id="addModal">
        <div class="modal-content">
            <h2 style="margin-bottom: 16px;">Add New Task</h2>
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="taskTitle" placeholder="Enter task title">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="taskDesc" placeholder="Enter description"></textarea>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select id="taskPriority">
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="hideModal()">Cancel</button>
                <button class="btn" onclick="addTask()">Add Task</button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentTasks = [];

        // Request tasks on load
        vscode.postMessage({ command: 'getTasks' });

        // Listen for messages
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateTasks') {
                currentTasks = message.data;
                renderTasks();
            }
        });

        function renderTasks() {
            const todoContainer = document.getElementById('todo-tasks');
            const inprogressContainer = document.getElementById('inprogress-tasks');
            const doneContainer = document.getElementById('done-tasks');

            todoContainer.innerHTML = '';
            inprogressContainer.innerHTML = '';
            doneContainer.innerHTML = '';

            currentTasks.forEach(task => {
                const card = createTaskCard(task);
                if (task.status === 'todo') todoContainer.appendChild(card);
                else if (task.status === 'in-progress') inprogressContainer.appendChild(card);
                else if (task.status === 'done') doneContainer.appendChild(card);
            });
        }

        function createTaskCard(task) {
            const div = document.createElement('div');
            div.className = 'task-card';
            div.draggable = true;
            div.innerHTML = \`
                <div class="task-title">\${task.title}</div>
                <div class="task-meta">
                    <span class="priority-\${task.priority}">\${task.priority.toUpperCase()}</span>
                    <span>•</span>
                    <span class="assignee">👤 \${task.assignee}</span>
                </div>
            \`;
            
            div.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('taskId', task.id);
            });

            div.addEventListener('dblclick', () => {
                if (confirm('Delete this task?')) {
                    vscode.postMessage({ command: 'deleteTask', data: { id: task.id } });
                }
            });

            return div;
        }

        // Drag and drop
        document.querySelectorAll('.column').forEach(column => {
            column.addEventListener('dragover', (e) => e.preventDefault());
            column.addEventListener('drop', (e) => {
                const taskId = e.dataTransfer.getData('taskId');
                const status = column.classList.contains('todo') ? 'todo' : 
                              column.classList.contains('in-progress') ? 'in-progress' : 'done';
                vscode.postMessage({ command: 'moveTask', data: { id: taskId, status } });
            });
        });

        function showAddModal() {
            document.getElementById('addModal').classList.add('show');
        }

        function hideModal() {
            document.getElementById('addModal').classList.remove('show');
        }

        function addTask() {
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDesc').value;
            const priority = document.getElementById('taskPriority').value;

            if (title) {
                vscode.postMessage({
                    command: 'addTask',
                    data: { title, description, priority, status: 'todo' }
                });
                hideModal();
                document.getElementById('taskTitle').value = '';
                document.getElementById('taskDesc').value = '';
            }
        }
    </script>
</body>
</html>`;
    }

    dispose(): void {
        this.panel?.dispose();
        this.onTasksChanged.dispose();
    }
}
