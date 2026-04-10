import * as vscode from 'vscode';
import { P2PCollaborationProvider, Message } from './p2pProvider';

export interface WhiteboardStroke {
    id: string;
    points: { x: number; y: number }[];
    color: string;
    width: number;
    tool: 'pen' | 'eraser' | 'line' | 'rect' | 'circle';
}

export class WhiteboardProvider implements vscode.Disposable {
    private panel: vscode.WebviewPanel | undefined;
    private strokes: WhiteboardStroke[] = [];
    private onStrokesChanged = new vscode.EventEmitter<WhiteboardStroke[]>();

    constructor(
        private p2pProvider: P2PCollaborationProvider,
        private context: vscode.ExtensionContext
    ) {
        this.p2pProvider.registerMessageHandler('whiteboard-stroke', (msg) => {
            this.handleRemoteStroke(msg);
        });

        this.p2pProvider.registerMessageHandler('whiteboard-clear', (msg) => {
            this.handleRemoteClear(msg);
        });
    }

    show(): void {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'letscodeWhiteboard',
            'Shared Whiteboard',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getHtmlForWebview();

        this.panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'addStroke':
                    this.addStroke(message.data);
                    break;
                case 'clear':
                    this.clear();
                    break;
                case 'getStrokes':
                    this.sendStrokesToWebview();
                    break;
            }
        });

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Send existing strokes to new viewer
        this.sendStrokesToWebview();
    }

    private addStroke(stroke: WhiteboardStroke): void {
        this.strokes.push(stroke);
        this.onStrokesChanged.fire(this.strokes);

        this.p2pProvider.broadcastMessage({
            type: 'whiteboard-stroke',
            data: stroke,
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });
    }

    private clear(): void {
        this.strokes = [];
        this.onStrokesChanged.fire(this.strokes);

        this.p2pProvider.broadcastMessage({
            type: 'whiteboard-clear',
            data: {},
            sender: this.p2pProvider.getMyPeerId(),
            timestamp: Date.now()
        });

        this.sendStrokesToWebview();
    }

    private handleRemoteStroke(message: Message): void {
        const stroke = message.data as WhiteboardStroke;
        this.strokes.push(stroke);
        
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'addStroke',
                data: stroke
            });
        }
    }

    private handleRemoteClear(message: Message): void {
        this.strokes = [];
        
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'clear'
            });
        }
    }

    private sendStrokesToWebview(): void {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'loadStrokes',
                data: this.strokes
            });
        }
    }

    private getHtmlForWebview(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shared Whiteboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .toolbar {
            display: flex;
            gap: 8px;
            padding: 12px;
            background: #1e293b;
            border-bottom: 1px solid #334155;
            align-items: center;
        }
        .tool-btn {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 6px;
            background: #334155;
            color: #f8fafc;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
        }
        .tool-btn:hover { background: #475569; }
        .tool-btn.active { background: #6366f1; }
        .tool-btn.clear { background: #ef4444; }
        .color-picker {
            display: flex;
            gap: 4px;
            margin-left: auto;
        }
        .color-btn {
            width: 24px;
            height: 24px;
            border: 2px solid transparent;
            border-radius: 50%;
            cursor: pointer;
        }
        .color-btn.active { border-color: #f8fafc; }
        .canvas-container {
            flex: 1;
            position: relative;
            background-image: 
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 20px 20px;
        }
        #canvas {
            position: absolute;
            top: 0; left: 0;
            cursor: crosshair;
        }
        .size-slider {
            width: 80px;
            margin-left: 12px;
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <button class="tool-btn active" data-tool="pen" title="Pen">✏️</button>
        <button class="tool-btn" data-tool="eraser" title="Eraser">🧹</button>
        <button class="tool-btn" data-tool="line" title="Line">📏</button>
        <button class="tool-btn" data-tool="rect" title="Rectangle">⬜</button>
        <button class="tool-btn" data-tool="circle" title="Circle">⭕</button>
        <input type="range" class="size-slider" min="1" max="20" value="3" title="Stroke Width">
        <div class="color-picker">
            <div class="color-btn active" data-color="#ffffff" style="background: #ffffff;"></div>
            <div class="color-btn" data-color="#ef4444" style="background: #ef4444;"></div>
            <div class="color-btn" data-color="#10b981" style="background: #10b981;"></div>
            <div class="color-btn" data-color="#3b82f6" style="background: #3b82f6;"></div>
            <div class="color-btn" data-color="#f59e0b" style="background: #f59e0b;"></div>
            <div class="color-btn" data-color="#8b5cf6" style="background: #8b5cf6;"></div>
            <div class="color-btn" data-color="#ec4899" style="background: #ec4899;"></div>
        </div>
        <button class="tool-btn clear" onclick="clearCanvas()">🗑️</button>
    </div>
    <div class="canvas-container">
        <canvas id="canvas"></canvas>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        let currentTool = 'pen';
        let currentColor = '#ffffff';
        let currentWidth = 3;
        let isDrawing = false;
        let startPoint = null;
        let currentStroke = null;
        let allStrokes = [];

        // Set canvas size
        function resizeCanvas() {
            const container = document.querySelector('.canvas-container');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            redrawCanvas();
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Tool selection
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTool = btn.dataset.tool;
            });
        });

        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentColor = btn.dataset.color;
            });
        });

        // Size slider
        document.querySelector('.size-slider').addEventListener('input', (e) => {
            currentWidth = parseInt(e.target.value);
        });

        // Drawing events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            startDrawing({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            draw({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
        });
        canvas.addEventListener('touchend', stopDrawing);

        function startDrawing(e) {
            isDrawing = true;
            startPoint = { x: e.offsetX, y: e.offsetY };
            
            currentStroke = {
                id: \`stroke-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
                points: [{ x: e.offsetX, y: e.offsetY }],
                color: currentColor,
                width: currentWidth,
                tool: currentTool
            };
        }

        function draw(e) {
            if (!isDrawing) return;

            const point = { x: e.offsetX, y: e.offsetY };

            if (currentTool === 'pen' || currentTool === 'eraser') {
                currentStroke.points.push(point);
                
                ctx.beginPath();
                ctx.moveTo(currentStroke.points[currentStroke.points.length - 2].x, 
                          currentStroke.points[currentStroke.points.length - 2].y);
                ctx.lineTo(point.x, point.y);
                ctx.strokeStyle = currentTool === 'eraser' ? '#0f172a' : currentColor;
                ctx.lineWidth = currentWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            } else if (currentTool === 'line' || currentTool === 'rect' || currentTool === 'circle') {
                redrawCanvas();
                
                ctx.beginPath();
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = currentWidth;

                if (currentTool === 'line') {
                    ctx.moveTo(startPoint.x, startPoint.y);
                    ctx.lineTo(point.x, point.y);
                } else if (currentTool === 'rect') {
                    ctx.rect(startPoint.x, startPoint.y, point.x - startPoint.x, point.y - startPoint.y);
                } else if (currentTool === 'circle') {
                    const radius = Math.sqrt(Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2));
                    ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
                }
                
                ctx.stroke();
            }
        }

        function stopDrawing(e) {
            if (!isDrawing) return;
            isDrawing = false;

            if (e && (currentTool === 'line' || currentTool === 'rect' || currentTool === 'circle')) {
                const point = { x: e.offsetX, y: e.offsetY };
                currentStroke.points.push(startPoint, point);
            }

            if (currentStroke && currentStroke.points.length > 1) {
                allStrokes.push(currentStroke);
                vscode.postMessage({ command: 'addStroke', data: currentStroke });
            }

            currentStroke = null;
        }

        function redrawCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            allStrokes.forEach(stroke => {
                ctx.beginPath();
                ctx.strokeStyle = stroke.tool === 'eraser' ? '#0f172a' : stroke.color;
                ctx.lineWidth = stroke.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
                    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                    for (let i = 1; i < stroke.points.length; i++) {
                        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
                    }
                } else if (stroke.tool === 'line' && stroke.points.length >= 2) {
                    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                    ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
                } else if (stroke.tool === 'rect' && stroke.points.length >= 2) {
                    ctx.rect(stroke.points[0].x, stroke.points[0].y, 
                            stroke.points[1].x - stroke.points[0].x, 
                            stroke.points[1].y - stroke.points[0].y);
                } else if (stroke.tool === 'circle' && stroke.points.length >= 2) {
                    const radius = Math.sqrt(Math.pow(stroke.points[1].x - stroke.points[0].x, 2) + 
                                              Math.pow(stroke.points[1].y - stroke.points[0].y, 2));
                    ctx.arc(stroke.points[0].x, stroke.points[0].y, radius, 0, Math.PI * 2);
                }
                
                ctx.stroke();
            });
        }

        function clearCanvas() {
            allStrokes = [];
            redrawCanvas();
            vscode.postMessage({ command: 'clear' });
        }

        // Listen for remote strokes
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'addStroke') {
                allStrokes.push(message.data);
                redrawCanvas();
            } else if (message.command === 'clear') {
                allStrokes = [];
                redrawCanvas();
            } else if (message.command === 'loadStrokes') {
                allStrokes = message.data;
                redrawCanvas();
            }
        });

        // Request existing strokes
        vscode.postMessage({ command: 'getStrokes' });
    </script>
</body>
</html>`;
    }

    dispose(): void {
        this.panel?.dispose();
        this.onStrokesChanged.dispose();
    }
}
