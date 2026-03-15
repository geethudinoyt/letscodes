# Let's Code 🚀

> **Real-time P2P Collaboration for VS Code. High Security. No Servers. 100% Free.**

Developer: **Ruthvik Pedapondara**

[![Version](https://img.shields.io/badge/version-5.0.0-7c3aed?style=for-the-badge)](https://github.com/ruthvikpedapondara/letscode)
[![License](https://img.shields.io/badge/license-MIT-34d399?style=for-the-badge)](https://github.com/ruthvikpedapondara/letscode/blob/main/LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-Zero_Data_Leaks-ec4899?style=for-the-badge)](#security--privacy)

---

**Let's Code** is a premium, privacy-first VS Code extension designed for students and professional teams. Unlike other tools, it uses **pure P2P connections** (directly between your hardware), meaning your source code never touches a third-party server.

## ✨ 17+ Advanced Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Pure P2P Editing** | Conflict-free editing using Yjs CRDT. | No latency, zero data leaks. |
| **E2E Encryption** | All traffic is AES-256-GCM encrypted. | Your code stays private. |
| **Live Cursors** | See where your teammates are typing. | Smooth coordination. |
| **Shared Terminal** | Broadcast terminal output to peers. | Debug together instantly. |
| **Task Board** | Built-in Kanban board synced P2P. | Stay organized as a team. |
| **Activity Dashboard** | Real-time stats (edits, time, etc). | Gamify your projects. |
| **Shared Whiteboard** | Draw diagrams and sketches together. | Better architectural planning. |
| **Code Review** | High-utility P2P code commenting. | Improve code quality live. |
| **Follow Mode** | Auto-jump to follow a peer's screen. | Perfect for classroom demos. |
| **Copilot Tracker** | Heuristic detection of AI-suggested edits. | Transparency in group work. |
| **Git Integration** | Sync git status and branch info. | Avoid merge conflicts. |
| **File Sync** | Automatic sync of project files in background. | Hardware-to-hardware sync. |
| **File Share** | Drag & drop file sharing up to 5MB. | Quickly swap assets/data. |
| **Debug Sync** | Share breakpoints and debug states. | Collaborative troubleshooting. |
| **Session Password** | Secure your sessions with passwords. | Prevent unauthorized joins. |
| **Persistence** | Auto-save & restore previous sessions. | Pickup where you left off. |
| **Auto-Import** | Automatically sync host project files on join. | Instant setup for team members. |
| **Local Hosting** | Host sessions on your own hardware. | Zero reliance on cloud. |

---

## 🛠️ Step-by-Step Installation

### Method 1: Marketplace (Coming Soon)
Search for `Let's Code` in the VS Code Extensions view and click Install.

### Method 2: Manual VSIX Installation
1. Download the `letscode-5.0.0.vsix` file.
2. Open VS Code.
3. Open the **Extensions** view (Ctrl+Shift+X).
4. Click the **...** menu top-right.
5. Select **Install from VSIX...**
6. Select the file and restart VS Code.

---

## 🚀 How to Use

### 1. Create a Session (Host)
- Click the **Let's Code** icon in the Activity Bar.
- Click **⚡ Create**.
- You will receive a **Project ID** (e.g., `LETS-X8B2-9A1F`).
- Your local IP and port will be displayed. Share these with your team!

### 2. Join a Session (Peer)
- Go to the **Let's Code** sidebar.
- Click **🔗 Join**.
- Enter the **Project ID**, **IP Address**, and **Port** provided by the host.
- Click **Connect** and start coding!

---

## 🤖 Tracking Copilot Edits
In group student projects, it's often important to know who wrote what. **Let's Code** includes a unique heuristic engine that detects when a large block of code is inserted rapidly (indicative of a Copilot suggestion). These edits are marked in the dashboard and history as "AI Edits," helping teachers and students maintain transparency.

## 🛡️ Security & Privacy
Because **Let's Code** is P2P:
- Your code is **never uploaded** to the cloud.
- Connections are direct between team members' computers.
- All data is encrypted with AES-256 using the Project ID as part of the key.
- **Privacy is the default.**

---

Created with ❤️ for students by **Ruthvik Pedapondara**.
