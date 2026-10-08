/**
 * Pure Vanilla TypeScript Dashboard Logic (NO REACT)
 * Atria Dawn Preview - Termux 7-Agent Multi-Agent Orchestrator
 */

interface AgentState {
  id: string;
  name: string;
  role: string;
  keyId: number;
  status: 'idle' | 'running' | 'waiting' | 'done' | 'stuck' | 'error';
  currentAction: string;
  progress: number;
  workdir: string;
  port?: number;
  avatar: string;
  color: string;
}

interface TaskItem {
  id: string;
  slug: string;
  title: string;
  status: 'running' | 'done' | 'paused' | 'queued';
  overallProgress: number;
  backendPort: number;
  frontendPort: number;
  createdAt: string;
  description: string;
  agents: {
    mandor: AgentState;
    backend: AgentState;
    frontend: AgentState;
    monitoring: AgentState;
  };
  files: {
    taskJson: string;
    apiContract: string;
    backendCode: string;
    frontendCode: string;
    monitorReport: string;
    outputSummary: string;
  };
}

interface KeyInfo {
  id: number;
  label: string;
  role: string;
  assignedTo: string;
  status: 'active' | 'standby' | 'rate_limited';
  maskedKey: string;
  model: string;
  requestsCount: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  agent: 'mandor' | 'backend' | 'frontend' | 'monitoring' | 'keypool' | 'system';
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

// Initial 7-Key Pool (Atria Dawn Preview)
const initialKeys: KeyInfo[] = [
  { id: 1, label: 'Key #1', role: 'Mandor', assignedTo: 'Mandor Agent', status: 'active', maskedKey: 'atria_sk...71a8', model: 'Atria-Dawn-Preview', requestsCount: 142 },
  { id: 2, label: 'Key #2', role: 'Backend', assignedTo: 'Backend Agent', status: 'active', maskedKey: 'atria_sk...94b2', model: 'Atria-Dawn-Preview', requestsCount: 310 },
  { id: 3, label: 'Key #3', role: 'Frontend', assignedTo: 'Frontend Agent', status: 'active', maskedKey: 'atria_sk...32c5', model: 'Atria-Dawn-Preview', requestsCount: 284 },
  { id: 4, label: 'Key #4', role: 'Cadangan 1', assignedTo: 'Standby / Failover Pool', status: 'standby', maskedKey: 'atria_sk...88d1', model: 'Atria-Dawn-Preview', requestsCount: 0 },
  { id: 5, label: 'Key #5', role: 'Cadangan 2', assignedTo: 'Standby / Failover Pool', status: 'standby', maskedKey: 'atria_sk...12e9', model: 'Atria-Dawn-Preview', requestsCount: 0 },
  { id: 6, label: 'Key #6', role: 'Cadangan 3', assignedTo: 'Standby / Failover Pool', status: 'standby', maskedKey: 'atria_sk...55f4', model: 'Atria-Dawn-Preview', requestsCount: 0 },
  { id: 7, label: 'Key #7', role: 'Monitoring', assignedTo: 'Monitoring Agent', status: 'active', maskedKey: 'atria_sk...99g7', model: 'Atria-Dawn-Preview', requestsCount: 178 },
];

// Initial Tasks
const initialTasks: TaskItem[] = [
  {
    id: '2026-10-08-001-bikin-login',
    slug: '001-bikin-login',
    title: 'Bikin Modul Autentikasi & Login JWT',
    status: 'running',
    overallProgress: 75,
    backendPort: 3001,
    frontendPort: 5174,
    createdAt: '2026-10-08 12:00:15',
    description: 'Sistem login lengkap dengan form validasi, endpoint JWT /api/auth/login, rate-limiting, dan preview responsive.',
    agents: {
      mandor: {
        id: 'mandor-1',
        name: 'Mandor Orchestrator',
        role: 'Orchestrator',
        keyId: 1,
        status: 'running',
        currentAction: 'Sinkronisasi output ke folder output/ & verifikasi kontrak',
        progress: 85,
        workdir: '~/agent-workspace/tasks/2026-10-08-001-bikin-login/',
        avatar: '👑',
        color: 'amber',
      },
      backend: {
        id: 'backend-1',
        name: 'Backend Agent',
        role: 'API & Database',
        keyId: 2,
        status: 'running',
        currentAction: 'Menulis endpoint POST /api/auth/login dan middleware auth',
        progress: 80,
        workdir: 'backend/',
        port: 3001,
        avatar: '🛠️',
        color: 'emerald',
      },
      frontend: {
        id: 'frontend-1',
        name: 'Frontend Agent',
        role: 'UI & Interactivity',
        keyId: 3,
        status: 'running',
        currentAction: 'Menyusun komponen LoginForm & integrasi fetch() ke contract',
        progress: 65,
        workdir: 'frontend/',
        port: 5174,
        avatar: '🎨',
        color: 'sky',
      },
      monitoring: {
        id: 'monitoring-1',
        name: 'Monitoring Agent',
        role: 'QA & Linter',
        keyId: 7,
        status: 'idle',
        currentAction: 'Standby - Semua unit tests & X-Frame audit lulus tanpa error',
        progress: 100,
        workdir: 'monitoring/',
        avatar: '🔍',
        color: 'purple',
      },
    },
    files: {
      taskJson: JSON.stringify({
        task_id: "2026-10-08-001-bikin-login",
        status: "in_progress",
        orchestrator: { key: 1, status: "monitoring" },
        workers: {
          backend: { key: 2, status: "writing_routes", port: 3001, workdir: "backend/" },
          frontend: { key: 3, status: "scaffolding_view", port: 5174, workdir: "frontend/" },
          monitoring: { key: 7, status: "listening", workdir: "monitoring/" }
        },
        shared_contract: "shared/api-contract.json",
        final_output: "output/"
      }, null, 2),
      apiContract: JSON.stringify({
        schema_version: "1.0.0",
        base_url: "http://localhost:3001/api",
        endpoints: [
          {
            path: "/auth/login",
            method: "POST",
            description: "Autentikasi kredensial pengguna dan mengembalikan JWT token",
            request_body: {
              email: "user@termux.local",
              password: "securePassword123"
            },
            responses: {
              200: {
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                user: { id: "u-99", name: "Slaman AI", role: "admin" }
              },
              401: { error: "Email atau kata sandi salah" }
            }
          },
          {
            path: "/auth/me",
            method: "GET",
            headers: { Authorization: "Bearer <token>" },
            responses: {
              200: { id: "u-99", name: "Slaman AI", email: "user@termux.local" }
            }
          }
        ]
      }, null, 2),
      backendCode: `// backend/src/server.js (Isolasi Folder: backend/)
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@atria.local' && password === 'admin123') {
    return res.json({
      status: 'success',
      token: 'jwt_mock_token_atria_termux_2026',
      user: { id: 'usr-1', name: 'Master Operator', role: 'admin' }
    });
  }
  return res.status(401).json({ status: 'error', message: 'Kredensial tidak valid' });
});

app.listen(PORT, () => {
  console.log(\`[Backend Agent] Listening on http://localhost:\${PORT}\`);
});`,
      frontendCode: `<!-- frontend/src/index.html (Isolasi Folder: frontend/) -->
<div class="auth-card">
  <h2>Masuk ke Sistem Atria</h2>
  <form id="loginForm">
    <input type="email" id="email" placeholder="Email" value="admin@atria.local" />
    <input type="password" id="password" placeholder="Kata Sandi" value="admin123" />
    <button type="submit">Login ke Termux</button>
  </form>
  <div id="result"></div>
</div>`,
      monitorReport: `[MONITORING AGENT REPORT - KEY #7]
- 001-bikin-login: Syntax integrity check: PASSED
- CORS Header validation: Access-Control-Allow-Origin: * OK
- X-Frame-Options: ALLOWED for dashboard preview
- Port 3001 status: ALIVE
- Port 5174 status: ALIVE
- Heartbeat: OK (Latency 14ms)`,
      outputSummary: `/* Output bundle siap jalan di Termux */
cd ~/agent-workspace/tasks/2026-10-08-001-bikin-login/output
node server.bundle.js &
open http://localhost:5174`
    }
  },
  {
    id: '2026-10-08-002-bikin-chat-ws',
    slug: '002-bikin-chat-ws',
    title: 'Room Chat Real-time via WebSocket',
    status: 'done',
    overallProgress: 100,
    backendPort: 3002,
    frontendPort: 5175,
    createdAt: '2026-10-08 10:14:00',
    description: 'Sistem multi-room chat dengan socket.io, broadcasting status agent, dan riwayat pesan.',
    agents: {
      mandor: {
        id: 'mandor-2',
        name: 'Mandor Orchestrator',
        role: 'Orchestrator',
        keyId: 1,
        status: 'done',
        currentAction: 'Tugas selesai, seluruh berkas dipindahkan ke output/',
        progress: 100,
        workdir: '~/agent-workspace/tasks/2026-10-08-002-bikin-chat-ws/',
        avatar: '👑',
        color: 'amber',
      },
      backend: {
        id: 'backend-2',
        name: 'Backend Agent',
        role: 'API & WebSocket',
        keyId: 2,
        status: 'done',
        currentAction: 'Socket.io server selesai running di port 3002',
        progress: 100,
        workdir: 'backend/',
        port: 3002,
        avatar: '🛠️',
        color: 'emerald',
      },
      frontend: {
        id: 'frontend-2',
        name: 'Frontend Agent',
        role: 'UI Chat',
        keyId: 3,
        status: 'done',
        currentAction: 'Antarmuka chat bubble dan autoscroll siap',
        progress: 100,
        workdir: 'frontend/',
        port: 5175,
        avatar: '🎨',
        color: 'sky',
      },
      monitoring: {
        id: 'monitoring-2',
        name: 'Monitoring Agent',
        role: 'QA & Socket Tester',
        keyId: 7,
        status: 'done',
        currentAction: 'Load testing 50 concurrent sockets lulus',
        progress: 100,
        workdir: 'monitoring/',
        avatar: '🔍',
        color: 'purple',
      },
    },
    files: {
      taskJson: '{\n  "task_id": "002-bikin-chat-ws",\n  "status": "completed"\n}',
      apiContract: '{\n  "protocol": "ws://localhost:3002",\n  "events": ["join_room", "send_msg", "user_typing"]\n}',
      backendCode: '// WebSocket backend server ready',
      frontendCode: '<!-- Chat interface html -->',
      monitorReport: 'Socket health: 100% reliable',
      outputSummary: 'Chat application fully deployed to output/'
    }
  }
];

const initialLogs: LogEntry[] = [
  { id: '1', timestamp: '12:00:15', agent: 'system', level: 'info', message: 'Termux daemon aktif (Node.js & Python 3.11). PID 14209.' },
  { id: '2', timestamp: '12:00:18', agent: 'keypool', level: 'info', message: 'Pool 7 API Key diinisialisasi. 3 aktif, 3 standby, 1 monitor.' },
  { id: '3', timestamp: '12:00:22', agent: 'mandor', level: 'info', message: 'Tugas [001-bikin-login] diterima. Memecah jadi 3 subtask mandiri.' },
  { id: '4', timestamp: '12:00:30', agent: 'mandor', level: 'info', message: 'Membuat isolasi direktori ~/agent-workspace/tasks/2026-10-08-001-bikin-login/' },
  { id: '5', timestamp: '12:00:45', agent: 'backend', level: 'info', message: 'Menulis kontrak API bersama: shared/api-contract.json' },
  { id: '6', timestamp: '12:01:05', agent: 'frontend', level: 'info', message: 'Membaca kontrak shared/api-contract.json. Memulai mockup login screen.' },
  { id: '7', timestamp: '12:01:30', agent: 'backend', level: 'info', message: 'Port 3001 dialokasikan untuk Backend Express. Server mulai listening.' },
  { id: '8', timestamp: '12:01:50', agent: 'monitoring', level: 'success', message: 'Audit linter: 0 syntax error pada backend/src/server.js' },
  { id: '9', timestamp: '12:02:15', agent: 'frontend', level: 'info', message: 'Port 5174 dialokasikan untuk Vite/HTML. Live preview tersambung.' },
  { id: '10', timestamp: '12:02:40', agent: 'monitoring', level: 'info', message: 'Verifikasi header X-Frame-Options: preview iframe diizinkan.' },
];

class DashboardApp {
  private keys: KeyInfo[] = [...initialKeys];
  private tasks: TaskItem[] = [...initialTasks];
  private activeTaskId: string = '2026-10-08-001-bikin-login';
  private logs: LogEntry[] = [...initialLogs];
  private previewTab: 'frontend' | 'backend' | 'split' = 'frontend';
  private deviceMode: 'responsive' | 'mobile' | 'desktop' = 'responsive';
  private inspectFileTab: 'contract' | 'taskjson' | 'backend' | 'frontend' | 'output' = 'contract';
  private isSimulating: boolean = false;
  private simulationInterval: number | null = null;
  private agentStuckCountdown: number = 240; // seconds

  constructor() {
    this.init();
  }

  private init() {
    this.bindEvents();
    this.renderAll();
    this.startHeartbeatTimer();
  }

  private getActiveTask(): TaskItem {
    return this.tasks.find(t => t.id === this.activeTaskId) || this.tasks[0];
  }

  private bindEvents() {
    // New Task Modal toggle
    document.getElementById('btn-new-task')?.addEventListener('click', () => {
      this.toggleModal('modal-new-task', true);
    });

    document.getElementById('modal-new-task-close')?.addEventListener('click', () => {
      this.toggleModal('modal-new-task', false);
    });

    document.getElementById('modal-new-task-cancel')?.addEventListener('click', () => {
      this.toggleModal('modal-new-task', false);
    });

    // Form New Task Submit
    document.getElementById('form-new-task')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('input-task-title') as HTMLInputElement;
      const descInput = document.getElementById('input-task-desc') as HTMLTextAreaElement;
      const bPortInput = document.getElementById('input-task-backend-port') as HTMLInputElement;
      const fPortInput = document.getElementById('input-task-frontend-port') as HTMLInputElement;

      const title = titleInput.value.trim() || 'Tugas Baru';
      const desc = descInput.value.trim() || 'Deskripsi tugas baru';
      const bPort = parseInt(bPortInput.value, 10) || 3003;
      const fPort = parseInt(fPortInput.value, 10) || 5176;

      this.createNewTask(title, desc, bPort, fPort);
      this.toggleModal('modal-new-task', false);
      titleInput.value = '';
      descInput.value = '';
    });

    // Keys Modal toggle
    document.getElementById('btn-keys-manage')?.addEventListener('click', () => {
      this.toggleModal('modal-keys', true);
      this.renderKeysModal();
    });

    document.getElementById('modal-keys-close')?.addEventListener('click', () => {
      this.toggleModal('modal-keys', false);
    });

    // Script Termux Modal toggle
    document.getElementById('btn-scripts-modal')?.addEventListener('click', () => {
      this.toggleModal('modal-scripts', true);
      this.renderScriptsModal('init');
    });

    document.getElementById('modal-scripts-close')?.addEventListener('click', () => {
      this.toggleModal('modal-scripts', false);
    });

    // Script Tab Buttons inside Modal
    document.querySelectorAll('[data-script-name]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const scriptName = (e.currentTarget as HTMLElement).getAttribute('data-script-name') || 'init';
        this.renderScriptsModal(scriptName);
      });
    });

    // Copy Active Script Button
    document.getElementById('btn-copy-active-script')?.addEventListener('click', () => {
      const codeEl = document.getElementById('script-code-display');
      if (codeEl?.textContent) {
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
          const btn = document.getElementById('btn-copy-active-script');
          if (btn) {
            const old = btn.innerHTML;
            btn.innerHTML = '✓ Berhasil Disalin!';
            setTimeout(() => { btn.innerHTML = old; }, 1500);
          }
        });
      }
    });

    // Simulate 429 Rate Limit Button
    document.getElementById('btn-test-429')?.addEventListener('click', () => {
      this.simulateRateLimitFailover();
    });

    // Simulate Step Button
    document.getElementById('btn-simulate-step')?.addEventListener('click', () => {
      this.simulateNextStep();
    });

    // Toggle Auto Simulate
    document.getElementById('btn-toggle-auto-sim')?.addEventListener('click', () => {
      this.toggleAutoSimulation();
    });

    // Wake / Ping stuck agent button
    document.getElementById('btn-wake-stuck')?.addEventListener('click', () => {
      this.wakeAgent();
    });

    // Preview Tab buttons
    document.querySelectorAll('[data-preview-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).getAttribute('data-preview-tab') as 'frontend' | 'backend' | 'split';
        if (tab) {
          this.previewTab = tab;
          this.renderPreviewSection();
        }
      });
    });

    // Device Frame Switcher
    document.querySelectorAll('[data-device-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = (e.currentTarget as HTMLElement).getAttribute('data-device-mode') as 'responsive' | 'mobile' | 'desktop';
        if (mode) {
          this.deviceMode = mode;
          this.renderPreviewFrameClass();
        }
      });
    });

    // Refresh Preview button
    document.getElementById('btn-refresh-preview')?.addEventListener('click', () => {
      this.renderLivePreviewContent();
      this.addLog('system', 'info', `Live preview refreshed pada port ${this.getActiveTask().frontendPort}`);
    });

    // Open External Tab Preview button
    document.getElementById('btn-open-newtab-preview')?.addEventListener('click', () => {
      const task = this.getActiveTask();
      const port = this.previewTab === 'backend' ? task.backendPort : task.frontendPort;
      const url = `http://localhost:${port}`;
      window.open(url, '_blank');
    });

    // File Inspect Tabs
    document.querySelectorAll('[data-inspect-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).getAttribute('data-inspect-tab') as any;
        if (tab) {
          this.inspectFileTab = tab;
          this.renderInspectViewer();
        }
      });
    });

    // Log Filter buttons
    document.querySelectorAll('[data-log-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).getAttribute('data-log-filter') || 'all';
        this.renderLogs(filter);
      });
    });

    // Clear logs button
    document.getElementById('btn-clear-logs')?.addEventListener('click', () => {
      this.logs = [];
      this.renderLogs();
    });

    // Copy contract button
    document.getElementById('btn-copy-contract')?.addEventListener('click', () => {
      const task = this.getActiveTask();
      navigator.clipboard.writeText(task.files.apiContract).then(() => {
        const btn = document.getElementById('btn-copy-contract');
        if (btn) {
          const oldText = btn.innerHTML;
          btn.innerHTML = '✓ Disalin!';
          setTimeout(() => { btn.innerHTML = oldText; }, 1500);
        }
      });
    });
  }

  private toggleModal(modalId: string, show: boolean) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (show) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } else {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  private startHeartbeatTimer() {
    setInterval(() => {
      if (this.agentStuckCountdown > 0) {
        this.agentStuckCountdown--;
      }
      const countdownEl = document.getElementById('stuck-timer-countdown');
      if (countdownEl) {
        const mins = Math.floor(this.agentStuckCountdown / 60);
        const secs = this.agentStuckCountdown % 60;
        countdownEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
      const alertBanner = document.getElementById('alert-stuck-banner');
      if (alertBanner) {
        if (this.agentStuckCountdown <= 30) {
          alertBanner.classList.remove('hidden');
        } else {
          alertBanner.classList.add('hidden');
        }
      }
    }, 1000);
  }

  private wakeAgent() {
    this.agentStuckCountdown = 240;
    const task = this.getActiveTask();
    this.addLog('monitoring', 'warn', `⚡ WAKE SIGNAL: Mengirimkan ping SIGUSR1 ke worker. Termux wake-lock diperbarui.`);
    task.agents.backend.currentAction = 'Menerima wake ping. Melanjutkan parsing route...';
    task.agents.backend.status = 'running';
    this.renderTaskDetail();
    this.renderWorkerCards();
  }

  public createNewTask(title: string, description: string, backendPort: number, frontendPort: number) {
    const nextIdx = this.tasks.length + 1;
    const slug = `00${nextIdx}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 18)}`;
    const id = `2026-10-08-${slug}`;

    const newTask: TaskItem = {
      id,
      slug,
      title,
      description,
      status: 'running',
      overallProgress: 10,
      backendPort,
      frontendPort,
      createdAt: new Date().toLocaleTimeString(),
      agents: {
        mandor: {
          id: `mandor-${nextIdx}`,
          name: 'Mandor Orchestrator',
          role: 'Orchestrator',
          keyId: 1,
          status: 'running',
          currentAction: 'Inisialisasi direktori isolasi dan parsing instruksi',
          progress: 20,
          workdir: `~/agent-workspace/tasks/${id}/`,
          avatar: '👑',
          color: 'amber',
        },
        backend: {
          id: `backend-${nextIdx}`,
          name: 'Backend Agent',
          role: 'API Server',
          keyId: 2,
          status: 'running',
          currentAction: `Merancang struktur endpoint di port ${backendPort}`,
          progress: 15,
          workdir: 'backend/',
          port: backendPort,
          avatar: '🛠️',
          color: 'emerald',
        },
        frontend: {
          id: `frontend-${nextIdx}`,
          name: 'Frontend Agent',
          role: 'UI View',
          keyId: 3,
          status: 'waiting',
          currentAction: 'Menunggu api-contract.json dari Backend Agent',
          progress: 5,
          workdir: 'frontend/',
          port: frontendPort,
          avatar: '🎨',
          color: 'sky',
        },
        monitoring: {
          id: `monitoring-${nextIdx}`,
          name: 'Monitoring Agent',
          role: 'Audit & QA',
          keyId: 7,
          status: 'idle',
          currentAction: 'Siap memonitor runtime dan log error',
          progress: 10,
          workdir: 'monitoring/',
          avatar: '🔍',
          color: 'purple',
        },
      },
      files: {
        taskJson: JSON.stringify({ task_id: id, status: "created", ports: { backend: backendPort, frontend: frontendPort } }, null, 2),
        apiContract: JSON.stringify({ note: "Backend sedang menyusun kontrak..." }, null, 2),
        backendCode: `// backend/src/server.js\n// Listening on ${backendPort}`,
        frontendCode: `<!-- frontend/src/index.html\nListening on ${frontendPort} -->`,
        monitorReport: 'No anomalies detected',
        outputSummary: 'Menunggu subtask selesai...'
      }
    };

    this.tasks.unshift(newTask);
    this.activeTaskId = id;
    this.addLog('mandor', 'info', `🚀 Tugas baru dibuat: [${slug}] "${title}"`);
    this.addLog('mandor', 'info', `Struktur folder diisolasi: ~/agent-workspace/tasks/${id}/`);
    this.renderAll();
  }

  public simulateRateLimitFailover() {
    const backendKey = this.keys.find(k => k.id === 2);
    const backupKey = this.keys.find(k => k.status === 'standby');

    if (!backendKey || !backupKey) {
      this.addLog('keypool', 'warn', 'Tidak ada key cadangan yang tersedia di pool!');
      return;
    }

    // Mark key 2 rate limited
    backendKey.status = 'rate_limited';
    backupKey.status = 'active';
    backupKey.assignedTo = 'Backend Agent (Failover)';

    // Update active task
    const task = this.getActiveTask();
    task.agents.backend.keyId = backupKey.id;

    this.addLog('keypool', 'error', `⚠️ HTTP 429 Too Many Requests terdeteksi pada Key #2 (${backendKey.maskedKey})!`);
    this.addLog('keypool', 'success', `🔄 FAILOVER SUKSES: Otomatis beralih ke Key #${backupKey.id} (${backupKey.maskedKey}) tanpa menghentikan worker.`);

    this.renderKeyPoolBar();
    this.renderWorkerCards();

    // Trigger visual notification
    const alertBox = document.getElementById('failover-toast');
    if (alertBox) {
      alertBox.textContent = `⚡ Key #2 limit 429! Otomatis rotasi ke Key #${backupKey.id} (${backupKey.label})`;
      alertBox.classList.remove('hidden');
      setTimeout(() => alertBox.classList.add('hidden'), 4000);
    }
  }

  public simulateNextStep() {
    const task = this.getActiveTask();
    if (task.status === 'done') {
      this.addLog('mandor', 'info', `Tugas [${task.slug}] sudah selesai 100%.`);
      return;
    }

    // Advance backend
    if (task.agents.backend.progress < 100) {
      task.agents.backend.progress = Math.min(100, task.agents.backend.progress + 15);
      if (task.agents.backend.progress >= 100) {
        task.agents.backend.status = 'done';
        task.agents.backend.currentAction = 'Server & API selesai diuji dan siap diakses';
        this.addLog('backend', 'success', `✓ Backend Agent menyelesaikan semua API endpoint pada port ${task.backendPort}`);
      } else {
        task.agents.backend.currentAction = 'Mengompilasi middleware & response validation';
        this.addLog('backend', 'info', `Backend progress: ${task.agents.backend.progress}%`);
      }
    }

    // Advance frontend
    if (task.agents.frontend.progress < 100) {
      task.agents.frontend.progress = Math.min(100, task.agents.frontend.progress + 20);
      if (task.agents.frontend.progress >= 100) {
        task.agents.frontend.status = 'done';
        task.agents.frontend.currentAction = 'UI responsif dan preview live siap';
        this.addLog('frontend', 'success', `✓ Frontend Agent menyelesaikan UI login responsive pada port ${task.frontendPort}`);
      } else {
        task.agents.frontend.currentAction = 'Menghubungkan event handler submit form ke fetch API';
        this.addLog('frontend', 'info', `Frontend progress: ${task.agents.frontend.progress}%`);
      }
    }

    // Advance mandor
    task.overallProgress = Math.round((task.agents.backend.progress + task.agents.frontend.progress) / 2);
    if (task.overallProgress >= 100) {
      task.status = 'done';
      task.agents.mandor.status = 'done';
      task.agents.mandor.currentAction = 'Menyatukan backend & frontend ke output/ - Tugas Selesai!';
      this.addLog('mandor', 'success', `🎉 Mandor: Seluruh artefak selesai dan disalin ke folder output/`);
    } else {
      task.agents.mandor.progress = task.overallProgress;
      task.agents.mandor.currentAction = `Mengawasi progress (${task.overallProgress}%) dan menjaga isolasi folder`;
    }

    this.agentStuckCountdown = 240;
    this.renderAll();
  }

  private toggleAutoSimulation() {
    const btn = document.getElementById('btn-toggle-auto-sim');
    if (this.isSimulating) {
      if (this.simulationInterval) clearInterval(this.simulationInterval);
      this.isSimulating = false;
      if (btn) btn.innerHTML = '▶ Putar Simulasi';
      this.addLog('system', 'info', 'Simulasi otomatis dihentikan sementara.');
    } else {
      this.isSimulating = true;
      if (btn) btn.innerHTML = '⏸ Jeda Simulasi';
      this.addLog('system', 'info', 'Simulasi otomatis dimulai. Worker menjalankan subtask beruntun.');
      this.simulationInterval = window.setInterval(() => {
        const task = this.getActiveTask();
        if (task.status === 'done') {
          this.toggleAutoSimulation();
        } else {
          this.simulateNextStep();
        }
      }, 3500);
    }
  }

  public addLog(agent: LogEntry['agent'], level: LogEntry['level'], message: string) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.logs.unshift({
      id: Math.random().toString(),
      timestamp: timeStr,
      agent,
      level,
      message,
    });
    // Keep max 100 logs
    if (this.logs.length > 100) this.logs.pop();
    this.renderLogs();
  }

  public selectTask(taskId: string) {
    this.activeTaskId = taskId;
    this.agentStuckCountdown = 240;
    this.renderAll();
  }

  // RENDER METHODS (Pure DOM)
  private renderAll() {
    this.renderTaskList();
    this.renderKeyPoolBar();
    this.renderTaskDetail();
    this.renderWorkerCards();
    this.renderInspectViewer();
    this.renderPreviewSection();
    this.renderLogs();
  }

  private renderKeyPoolBar() {
    const container = document.getElementById('key-pool-strip');
    if (!container) return;

    container.innerHTML = this.keys.map(k => {
      let badgeColor = 'bg-emerald-950 text-emerald-400 border-emerald-800';
      let statusIcon = '●';
      let statusLabel = 'ACTIVE';

      if (k.status === 'standby') {
        badgeColor = 'bg-slate-900 text-slate-400 border-slate-700';
        statusIcon = '○';
        statusLabel = 'STANDBY';
      } else if (k.status === 'rate_limited') {
        badgeColor = 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse';
        statusIcon = '⚠';
        statusLabel = 'LIMIT 429';
      }

      return `
        <div class="flex items-center gap-2 px-2.5 py-1 rounded border text-xs ${badgeColor} transition-colors">
          <span class="font-semibold">${k.label}</span>
          <span class="text-[10px] opacity-80 uppercase">${k.role}</span>
          <span class="text-[11px] font-mono">${statusIcon} ${statusLabel}</span>
          <span class="text-[10px] text-slate-400 hidden xl:inline">(${k.maskedKey})</span>
        </div>
      `;
    }).join('');
  }

  private renderTaskList() {
    const container = document.getElementById('task-list-container');
    if (!container) return;

    container.innerHTML = this.tasks.map(task => {
      const isActive = task.id === this.activeTaskId;
      const statusIcon = task.status === 'running' ? '●' : (task.status === 'done' ? '✓' : '⏸');
      const statusColor = task.status === 'running' ? 'text-emerald-400' : (task.status === 'done' ? 'text-sky-400' : 'text-amber-400');
      const activeClass = isActive 
        ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/30' 
        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700';

      return `
        <button 
          data-task-id="${task.id}"
          class="w-full text-left p-3 rounded-lg border transition-all mb-2 cursor-pointer ${activeClass}"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-mono text-xs font-semibold truncate ${isActive ? 'text-emerald-300' : 'text-slate-200'}">
              ${task.slug}
            </span>
            <span class="text-xs font-mono font-medium ${statusColor}">
              ${statusIcon} ${task.status.toUpperCase()}
            </span>
          </div>
          <div class="text-[11px] text-slate-400 line-clamp-1 mb-2">
            ${task.title}
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500 ${task.status === 'done' ? 'bg-sky-400' : 'bg-emerald-500'}"
                style="width: ${task.overallProgress}%"
              ></div>
            </div>
            <span class="text-[10px] font-mono text-slate-400 min-w-[28px] text-right">${task.overallProgress}%</span>
          </div>
        </button>
      `;
    }).join('');

    // Bind click events on task items
    container.querySelectorAll('[data-task-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-task-id');
        if (id) this.selectTask(id);
      });
    });
  }

  private renderTaskDetail() {
    const task = this.getActiveTask();
    const titleEl = document.getElementById('task-detail-title');
    const pathEl = document.getElementById('task-detail-path');
    const descEl = document.getElementById('task-detail-desc');
    const progressTextEl = document.getElementById('task-detail-progress-text');
    const progressBarEl = document.getElementById('task-detail-progress-bar');
    const badgeEl = document.getElementById('task-detail-status-badge');

    if (titleEl) titleEl.textContent = task.title;
    if (pathEl) pathEl.textContent = `~/agent-workspace/tasks/${task.id}/`;
    if (descEl) descEl.textContent = task.description;
    if (progressTextEl) progressTextEl.textContent = `${task.overallProgress}% Selesai`;
    if (progressBarEl) progressBarEl.style.width = `${task.overallProgress}%`;

    if (badgeEl) {
      badgeEl.textContent = task.status.toUpperCase();
      badgeEl.className = `text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
        task.status === 'running' 
          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
          : 'bg-sky-950 text-sky-400 border border-sky-800'
      }`;
    }
  }

  private renderWorkerCards() {
    const container = document.getElementById('worker-cards-grid');
    if (!container) return;

    const task = this.getActiveTask();
    const agents = [
      task.agents.mandor,
      task.agents.backend,
      task.agents.frontend,
      task.agents.monitoring,
    ];

    container.innerHTML = agents.map(agent => {
      const keyObj = this.keys.find(k => k.id === agent.keyId);
      const isKeyLimited = keyObj?.status === 'rate_limited';
      const keyLabel = isKeyLimited ? `Key #${agent.keyId} (LIMIT!)` : `Key #${agent.keyId}`;

      let borderTheme = 'border-slate-800 bg-slate-900/70';
      if (agent.id.includes('backend')) borderTheme = 'border-emerald-900/40 bg-emerald-950/10';
      if (agent.id.includes('frontend')) borderTheme = 'border-sky-900/40 bg-sky-950/10';
      if (agent.id.includes('mandor')) borderTheme = 'border-amber-900/40 bg-amber-950/10';
      if (agent.id.includes('monitoring')) borderTheme = 'border-purple-900/40 bg-purple-950/10';

      return `
        <div class="p-3.5 rounded-lg border ${borderTheme} flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">${agent.avatar}</span>
                <div>
                  <h4 class="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    ${agent.name}
                  </h4>
                  <div class="text-[10px] text-slate-400 font-mono">${agent.role}</div>
                </div>
              </div>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isKeyLimited ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-slate-800 text-slate-300'
              }">
                🔑 ${keyLabel}
              </span>
            </div>

            <div class="text-[11px] text-slate-300 font-mono bg-slate-950/60 p-2 rounded border border-slate-800/80 mb-3 min-h-[48px] flex items-center">
              <span>${agent.currentAction}</span>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span>Workdir: <code class="text-slate-300">${agent.workdir}</code></span>
              ${agent.port ? `<span class="text-emerald-400 font-semibold">:localhost:${agent.port}</span>` : ''}
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-300 bg-emerald-500"
                  style="width: ${agent.progress}%"
                ></div>
              </div>
              <span class="text-[10px] font-mono text-slate-300 min-w-[28px] text-right">${agent.progress}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  private renderInspectViewer() {
    const task = this.getActiveTask();
    const codeEl = document.getElementById('code-viewer-content');
    const pathEl = document.getElementById('code-viewer-path');
    if (!codeEl || !pathEl) return;

    // Update active tab styles
    document.querySelectorAll('[data-inspect-tab]').forEach(btn => {
      const tab = btn.getAttribute('data-inspect-tab');
      if (tab === this.inspectFileTab) {
        btn.className = 'px-3 py-1.5 text-xs font-mono font-medium rounded-t bg-slate-800 text-emerald-400 border-t border-x border-slate-700';
      } else {
        btn.className = 'px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200';
      }
    });

    switch (this.inspectFileTab) {
      case 'contract':
        pathEl.textContent = `shared/api-contract.json`;
        codeEl.textContent = task.files.apiContract;
        break;
      case 'taskjson':
        pathEl.textContent = `task.json (State Single Source of Truth)`;
        codeEl.textContent = task.files.taskJson;
        break;
      case 'backend':
        pathEl.textContent = `backend/src/server.js (Isolasi Port :${task.backendPort})`;
        codeEl.textContent = task.files.backendCode;
        break;
      case 'frontend':
        pathEl.textContent = `frontend/src/index.html (Isolasi Port :${task.frontendPort})`;
        codeEl.textContent = task.files.frontendCode;
        break;
      case 'output':
        pathEl.textContent = `output/final-bundle-info.txt`;
        codeEl.textContent = task.files.outputSummary;
        break;
    }
  }

  private renderPreviewSection() {
    const task = this.getActiveTask();
    const portEl = document.getElementById('preview-url-display');
    if (portEl) {
      if (this.previewTab === 'backend') {
        portEl.textContent = `http://localhost:${task.backendPort}/api/auth/login`;
      } else if (this.previewTab === 'split') {
        portEl.textContent = `Dual Split: :${task.backendPort} (API) & :${task.frontendPort} (UI)`;
      } else {
        portEl.textContent = `http://localhost:${task.frontendPort}/`;
      }
    }

    // Update tab button highlights
    document.querySelectorAll('[data-preview-tab]').forEach(btn => {
      const tab = btn.getAttribute('data-preview-tab');
      if (tab === this.previewTab) {
        btn.className = 'px-2.5 py-1 text-xs font-mono rounded bg-slate-800 text-emerald-400 border border-slate-700 font-semibold';
      } else {
        btn.className = 'px-2.5 py-1 text-xs font-mono rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/50';
      }
    });

    this.renderLivePreviewContent();
    this.renderPreviewFrameClass();
  }

  private renderPreviewFrameClass() {
    const container = document.getElementById('preview-frame-wrapper');
    if (!container) return;

    // Reset classes
    container.classList.remove('max-w-[390px]', 'max-w-[768px]', 'w-full');

    // Update buttons
    document.querySelectorAll('[data-device-mode]').forEach(btn => {
      const mode = btn.getAttribute('data-device-mode');
      if (mode === this.deviceMode) {
        btn.classList.add('bg-slate-800', 'text-slate-100');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('bg-slate-800', 'text-slate-100');
        btn.classList.add('text-slate-400');
      }
    });

    if (this.deviceMode === 'mobile') {
      container.classList.add('max-w-[390px]', 'mx-auto', 'border-x', 'border-slate-800');
    } else if (this.deviceMode === 'desktop') {
      container.classList.add('max-w-[768px]', 'mx-auto');
    } else {
      container.classList.add('w-full');
    }
  }

  private renderLivePreviewContent() {
    const container = document.getElementById('preview-content-area');
    if (!container) return;

    const task = this.getActiveTask();

    if (this.previewTab === 'backend') {
      // API Explorer
      container.innerHTML = `
        <div class="p-4 bg-slate-950 text-slate-200 font-mono text-xs h-full overflow-y-auto">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <span class="text-emerald-400 font-bold">API Test Console (:localhost:${task.backendPort})</span>
            <span class="text-slate-400 text-[10px]">Worker: Backend Agent (Key #${task.agents.backend.keyId})</span>
          </div>

          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold text-[10px]">POST</span>
              <span class="text-slate-300 font-semibold">/api/auth/login</span>
            </div>
            <div class="bg-slate-900 p-3 rounded border border-slate-800 mb-3">
              <div class="text-[10px] text-slate-400 mb-1 font-sans">Request Body (JSON):</div>
              <pre class="text-[11px] text-sky-300">{\n  "email": "admin@atria.local",\n  "password": "admin123"\n}</pre>
            </div>
            <button id="btn-fire-api" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded cursor-pointer transition">
              Kirim Request (Fetch Mock)
            </button>
          </div>

          <div id="api-response-box" class="bg-slate-900/80 p-3 rounded border border-slate-800">
            <div class="text-[10px] text-slate-400 mb-1 font-sans">Response Header 200 OK:</div>
            <pre class="text-[11px] text-emerald-400">{\n  "status": "success",\n  "token": "jwt_mock_token_atria_termux_2026",\n  "user": {\n    "id": "usr-1",\n    "name": "Master Operator",\n    "role": "admin"\n  }\n}</pre>
          </div>
        </div>
      `;

      document.getElementById('btn-fire-api')?.addEventListener('click', () => {
        const respBox = document.getElementById('api-response-box');
        if (respBox) {
          respBox.innerHTML = `
            <div class="text-[10px] text-emerald-400 mb-1 font-sans font-bold">✓ 200 OK (Response Time: 12ms via localhost:${task.backendPort})</div>
            <pre class="text-[11px] text-emerald-300">{\n  "timestamp": "${new Date().toISOString()}",\n  "status": "authenticated",\n  "session": "active_termux_session"\n}</pre>
          `;
        }
      });
      return;
    }

    if (this.previewTab === 'split') {
      // Split Screen: API on left, UI on right
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 h-full divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-y-auto">
          <!-- Backend Part -->
          <div class="p-3 bg-slate-950 font-mono text-xs">
            <div class="text-[11px] font-bold text-emerald-400 mb-2 flex items-center justify-between">
              <span>🛠️ Backend API (:3001)</span>
              <span class="text-[10px] text-slate-500">shared/api-contract.json</span>
            </div>
            <div class="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300 mb-2">
              <span class="text-emerald-400 font-bold">POST</span> /api/auth/login
              <div class="text-[10px] text-slate-400 mt-1">Status: Listening OK</div>
            </div>
          </div>
          <!-- Frontend Part -->
          <div class="p-3 bg-slate-900/50 flex flex-col items-center justify-center">
            <div class="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
              <h3 class="text-sm font-bold text-slate-100 mb-2">🎨 UI Preview (:5174)</h3>
              <input type="text" value="admin@atria.local" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs mb-2 text-slate-200" />
              <input type="password" value="••••••••" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs mb-3 text-slate-200" />
              <button class="w-full py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded">Masuk</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Default: Frontend UI Interactive Mockup Preview
    container.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center p-4 bg-slate-950/80 font-sans">
        <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative">
          <div class="absolute -top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800">
            Frontend Port :${task.frontendPort}
          </div>

          <div class="text-center mb-5">
            <div class="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg mx-auto mb-2 font-mono font-bold">
              AT
            </div>
            <h2 class="text-base font-bold text-slate-100">Atria Termux Portal</h2>
            <p class="text-xs text-slate-400">Masuk untuk mengelola sistem multi-agent</p>
          </div>

          <form id="preview-mock-form" class="space-y-3">
            <div>
              <label class="block text-[11px] font-medium text-slate-300 mb-1">Email / Username</label>
              <input 
                type="email" 
                id="mock-email" 
                value="admin@atria.local" 
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-slate-300 mb-1">Kata Sandi</label>
              <input 
                type="password" 
                id="mock-password" 
                value="admin123" 
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button 
              type="submit" 
              id="mock-submit-btn"
              class="w-full py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Autentikasi via API (:3001)
            </button>
          </form>

          <div id="mock-form-feedback" class="mt-3 text-center text-xs font-mono hidden"></div>

          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Isolasi: frontend/src</span>
            <span>Kontrak: shared/</span>
          </div>
        </div>
      </div>
    `;

    // Interactive form submission inside preview
    document.getElementById('preview-mock-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const feedback = document.getElementById('mock-form-feedback');
      const email = (document.getElementById('mock-email') as HTMLInputElement).value;
      const pass = (document.getElementById('mock-password') as HTMLInputElement).value;

      if (!feedback) return;
      feedback.classList.remove('hidden');

      if (email === 'admin@atria.local' && pass === 'admin123') {
        feedback.className = 'mt-3 p-2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-mono';
        feedback.innerHTML = `✓ Berhasil Login! Token JWT diterima dari Backend :${task.backendPort}`;
      } else {
        feedback.className = 'mt-3 p-2 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-xs font-mono';
        feedback.innerHTML = `✗ 401 Unauthorized: Kredensial salah`;
      }
    });
  }

  private renderLogs(filter: string = 'all') {
    const container = document.getElementById('log-stream-container');
    if (!container) return;

    // Filter logs
    const filtered = filter === 'all' 
      ? this.logs 
      : this.logs.filter(l => l.agent === filter);

    // Update log count badge
    const countBadge = document.getElementById('log-count-badge');
    if (countBadge) countBadge.textContent = `${this.logs.length} baris`;

    // Update filter tabs
    document.querySelectorAll('[data-log-filter]').forEach(btn => {
      const f = btn.getAttribute('data-log-filter');
      if (f === filter) {
        btn.classList.add('bg-slate-800', 'text-slate-100', 'font-bold');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('bg-slate-800', 'text-slate-100', 'font-bold');
        btn.classList.add('text-slate-400');
      }
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-slate-600 font-mono text-xs">Belum ada log untuk filter '${filter}'</div>`;
      return;
    }

    container.innerHTML = filtered.map(log => {
      let agentTagColor = 'text-slate-400 bg-slate-800';
      if (log.agent === 'mandor') agentTagColor = 'text-amber-400 bg-amber-950 border border-amber-900';
      if (log.agent === 'backend') agentTagColor = 'text-emerald-400 bg-emerald-950 border border-emerald-900';
      if (log.agent === 'frontend') agentTagColor = 'text-sky-400 bg-sky-950 border border-sky-900';
      if (log.agent === 'monitoring') agentTagColor = 'text-purple-400 bg-purple-950 border border-purple-900';
      if (log.agent === 'keypool') agentTagColor = 'text-rose-400 bg-rose-950 border border-rose-900';

      let msgColor = 'text-slate-300';
      if (log.level === 'success') msgColor = 'text-emerald-300';
      if (log.level === 'warn') msgColor = 'text-amber-300';
      if (log.level === 'error') msgColor = 'text-rose-400 font-bold';

      return `
        <div class="flex items-start gap-2.5 py-1 px-2 hover:bg-slate-900/60 transition-colors font-mono text-xs border-b border-slate-900">
          <span class="text-slate-500 select-none text-[10px] min-w-[50px]">${log.timestamp}</span>
          <span class="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold min-w-[70px] text-center ${agentTagColor}">
            ${log.agent}
          </span>
          <span class="flex-1 ${msgColor} break-all">${log.message}</span>
        </div>
      `;
    }).join('');
  }

  private renderKeysModal() {
    const listEl = document.getElementById('modal-keys-list');
    if (!listEl) return;

    listEl.innerHTML = this.keys.map(k => `
      <div class="p-3 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-between gap-3 font-mono text-xs mb-2">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-bold text-slate-100">${k.label}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded ${
              k.status === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              k.status === 'standby' ? 'bg-slate-900 text-slate-400 border border-slate-700' :
              'bg-rose-950 text-rose-300 border border-rose-800'
            }">${k.status.toUpperCase()}</span>
          </div>
          <div class="text-[11px] text-slate-400">
            Peran: <strong class="text-slate-300">${k.role}</strong> &bull; Model: <code>${k.model}</code>
          </div>
          <div class="text-[10px] text-slate-500 mt-1">
            Key: ${k.maskedKey} &bull; Requests: ${k.requestsCount} reqs
          </div>
        </div>

        <button 
          data-key-action="${k.id}"
          class="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
        >
          ${k.status === 'rate_limited' ? 'Reset Limit' : 'Tes Ping'}
        </button>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-key-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const keyId = parseInt(btn.getAttribute('data-key-action') || '0', 10);
        const k = this.keys.find(item => item.id === keyId);
        if (k) {
          k.status = 'active';
          this.addLog('keypool', 'info', `Key #${k.id} kuota di-reset manual menjadi status ACTIVE.`);
          this.renderKeysModal();
          this.renderKeyPoolBar();
          this.renderWorkerCards();
        }
      });
    });
  }

  private renderScriptsModal(activeTab: string = 'main') {
    const codeEl = document.getElementById('script-code-display');
    if (!codeEl) return;

    // Update active tab buttons
    document.querySelectorAll('[data-script-name]').forEach(btn => {
      const name = btn.getAttribute('data-script-name');
      if (name === activeTab) {
        btn.className = 'px-2.5 py-1 rounded bg-emerald-900 text-emerald-200 font-bold border border-emerald-600 cursor-pointer';
      } else {
        btn.className = 'px-2.5 py-1 rounded text-slate-400 hover:text-slate-200 cursor-pointer';
      }
    });

    const scripts: Record<string, string> = {
      main: `#!/usr/bin/env python3
"""
main.py - Menu Interaktif Termux Multi-Agent Atria Dawn Preview
Jalankan di Termux: python main.py
"""
import os, sys, json, time, asyncio, subprocess
from client_rotator import AtriaKeyRotator, load_env
from mandor import MandorOrchestrator

WORKSPACE_DIR = os.path.expanduser("~/agent-workspace")
TASKS_DIR = os.path.join(WORKSPACE_DIR, "tasks")

def print_header(rotator):
    os.system("clear" if os.name != "nt" else "cls")
    print("=" * 65)
    print("  🤖 ATRIA DAWN PREVIEW - MULTI-AGENT ORCHESTRATOR (TERMUX CLI)")
    print("=" * 65)
    print(f"API Endpoint : {rotator.api_base}")
    print(f"Model ID     : {rotator.model}")
    print(f"Status .env  : 7 Keys Loaded")
    print(f"Workspace    : {TASKS_DIR}")
    print("=" * 65)

def menu_list_tasks():
    os.makedirs(TASKS_DIR, exist_ok=True)
    dirs = sorted([d for d in os.listdir(TASKS_DIR) if os.path.isdir(os.path.join(TASKS_DIR, d))])
    print("\\n📂 DAFTAR TUGAS DI WORKSPACE:")
    if not dirs:
        print("  (Belum ada tugas. Pilih menu [1] untuk membuat tugas baru)")
        return []
    for idx, d in enumerate(dirs, 1):
        print(f"  [{idx}] {d}")
    return dirs

def menu_create_task():
    print("\\n➕ BUAT TUGAS BARU (ISOLASI FOLDER)")
    title = input("Judul Tugas (misal: bikin-login): ").strip()
    if not title: return
    slug = "".join(c if c.isalnum() or c == "-" else "-" for c in title.lower())
    task_id = f"{time.strftime('%Y-%m-%d')}-{slug}"
    t_dir = os.path.join(TASKS_DIR, task_id)
    
    prompt = input("Prompt Instruksi untuk Mandor: ").strip() or f"Bangun fitur {title}"
    b_port = input("Port Backend [3001]: ").strip() or "3001"
    f_port = input("Port Frontend [5174]: ").strip() or "5174"

    # Isolasi direktori
    for sub in ["backend/src", "backend/logs", "frontend/src", "frontend/logs", "monitoring/logs", "shared", "output"]:
        os.makedirs(os.path.join(t_dir, sub), exist_ok=True)

    meta = {"task_id": task_id, "title": title, "brief": prompt, "ports": {"backend": int(b_port), "frontend": int(f_port)}}
    with open(os.path.join(t_dir, "task.json"), "w") as f: json.dump(meta, f, indent=2)
    with open(os.path.join(t_dir, "shared/api-contract.json"), "w") as f: json.dump({"endpoints": []}, f, indent=2)
    print(f"✓ Tugas berhasil dibuat di: {t_dir}")
    if input("Jalankan Mandor sekarang? (y/n): ").lower() == 'y':
        asyncio.run(MandorOrchestrator(task_id, prompt).run())

def main():
    load_env()
    rotator = AtriaKeyRotator()
    try: subprocess.run(["termux-wake-lock"], capture_output=True)
    except Exception: pass

    while True:
        print_header(rotator)
        print("""
[1] ➕ Buat Tugas Baru (Scaffold Folder & Metadata)
[2] 📂 Lihat Semua Tugas & Status
[3] 🚀 Jalankan Mandor untuk Tugas Tertentu
[4] 📜 Lihat Kontrak (shared/api-contract.json)
[5] 🔑 Cek Status 7 API Key di .env
[0] 🚪 Keluar
""")
        c = input("Pilih menu [0-5]: ").strip()
        if c == "1": menu_create_task(); input("\\nTekan Enter...")
        elif c == "2": menu_list_tasks(); input("\\nTekan Enter...")
        elif c == "3":
            t = menu_list_tasks()
            if t:
                n = input("Pilih nomor tugas: ").strip()
                if n.isdigit() and 1 <= int(n) <= len(t):
                    sel = t[int(n)-1]
                    asyncio.run(MandorOrchestrator(sel, "Lanjutkan pengerjaan").run())
            input("\\nTekan Enter...")
        elif c == "4":
            t = menu_list_tasks()
            if t:
                n = input("Pilih nomor tugas: ").strip()
                if n.isdigit() and 1 <= int(n) <= len(t):
                    cp = os.path.join(TASKS_DIR, t[int(n)-1], "shared/api-contract.json")
                    if os.path.exists(cp):
                        with open(cp) as f: print(f.read())
            input("\\nTekan Enter...")
        elif c == "5":
            print("\\nSTATUS 7 KEY DI .env:")
            for k, v in rotator.keys.items():
                print(f"  {k} ({v['role']}): {v['status']} | {v['key'][:8]}...")
            input("\\nTekan Enter...")
        elif c == "0": break

if __name__ == "__main__":
    main()`,

      env: `# ==============================================================================
# .env - Konfigurasi 7 API Key Atria Dawn Preview
# Simpan file ini di ~/agent-workspace/.env
# ==============================================================================

ATRIA_API_BASE=https://api.atria-asi.ai/v1
ATRIA_MODEL=Atria-Dawn-Preview

# 👑 Key #1: Mandor (Orchestrator)
ATRIA_KEY_1=atria_sk_mandor_key_01

# 🛠️ Key #2: Backend Agent (API Server & DB)
ATRIA_KEY_2=atria_sk_backend_key_02

# 🎨 Key #3: Frontend Agent (UI & Interactivity)
ATRIA_KEY_3=atria_sk_frontend_key_03

# 🔄 Key #4: Cadangan 1 (Auto-Failover saat 429)
ATRIA_KEY_4=atria_sk_backup_key_04

# 🔄 Key #5: Cadangan 2 (Auto-Failover saat 429)
ATRIA_KEY_5=atria_sk_backup_key_05

# 🔄 Key #6: Cadangan 3 (Auto-Failover saat 429)
ATRIA_KEY_6=atria_sk_backup_key_06

# 🔍 Key #7: Monitoring Agent (QA & Healthcheck)
ATRIA_KEY_7=atria_sk_monitoring_key_07`,

      init: `#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# init-task.sh - Inisialisasi Workspace Multi-Agent Atria di Termux
# ==============================================================================
set -e
WORKSPACE_DIR="$HOME/agent-workspace"
TASK_SLUG=\${1:-"$(date +%Y-%m-%d)-001-task"}
TASK_DIR="$WORKSPACE_DIR/tasks/$TASK_SLUG"

echo "🎯 Menyiapkan direktori isolasi: $TASK_DIR"

if command -v termux-wake-lock &> /dev/null; then
    termux-wake-lock
    echo "⚡ Termux wake-lock diaktifkan"
fi

mkdir -p "$TASK_DIR/backend/src" "$TASK_DIR/backend/logs"
mkdir -p "$TASK_DIR/frontend/src" "$TASK_DIR/frontend/logs"
mkdir -p "$TASK_DIR/monitoring/logs"
mkdir -p "$TASK_DIR/shared" "$TASK_DIR/output"

cat <<EOF > "$TASK_DIR/task.json"
{
  "task_id": "$TASK_SLUG",
  "created_at": "$(date)",
  "status": "ready",
  "model": "Atria-Dawn-Preview",
  "api_endpoint": "https://api.atria-asi.ai/v1",
  "ports": { "backend": 3001, "frontend": 5174 }
}
EOF

cat <<EOF > "$TASK_DIR/shared/api-contract.json"
{
  "contract_version": "1.0.0",
  "task_id": "$TASK_SLUG",
  "endpoints": []
}
EOF

echo "✓ Struktur isolasi selesai dibuat."
echo "🚀 Jalankan: python main.py"`,

      rotator: `#!/usr/bin/env python3
# client_rotator.py - 100% Native Zero-Dependency HTTP Client (urllib)
# Bebas pip install openai, bebas Rust/maturin! Langsung jalan di Termux.
import os, json, time, asyncio, urllib.request, urllib.error

def load_env(path=".env"):
    if not os.path.exists(path):
        p = os.path.expanduser("~/agent-workspace/.env")
        if os.path.exists(p): path = p
        else: return
    with open(path) as f:
        for line in f:
            if line.strip() and not line.startswith("#") and "=" in line:
                k, v = line.strip().split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

class AtriaKeyRotator:
    def __init__(self):
        load_env()
        self.api_base = os.getenv("ATRIA_API_BASE", "https://api.atria-asi.ai/v1").rstrip("/")
        self.model = os.getenv("ATRIA_MODEL", "Atria-Dawn-Preview")
        self.keys = {
            "key_1": {"key": os.getenv("ATRIA_KEY_1", ""), "role": "mandor", "status": "active"},
            "key_2": {"key": os.getenv("ATRIA_KEY_2", ""), "role": "backend", "status": "active"},
            "key_3": {"key": os.getenv("ATRIA_KEY_3", ""), "role": "frontend", "status": "active"},
            "key_4": {"key": os.getenv("ATRIA_KEY_4", ""), "role": "backup_1", "status": "standby"},
            "key_5": {"key": os.getenv("ATRIA_KEY_5", ""), "role": "backup_2", "status": "standby"},
            "key_6": {"key": os.getenv("ATRIA_KEY_6", ""), "role": "backup_3", "status": "standby"},
            "key_7": {"key": os.getenv("ATRIA_KEY_7", ""), "role": "monitoring", "status": "active"},
        }
        self.backup_queue = ["key_4", "key_5", "key_6"]

    def get_api_key(self, role: str) -> str:
        m = {"mandor": "key_1", "backend": "key_2", "frontend": "key_3", "monitoring": "key_7"}
        return self.keys[m.get(role, "key_1")]["key"]

    def rotate_on_429(self, role: str) -> str:
        if not self.backup_queue: raise RuntimeError("Semua key cadangan habis!")
        new_k = self.backup_queue.pop(0)
        print(f"[KEY ROTATION] ⚡ Peran {role} berganti ke {new_k}")
        return self.keys[new_k]["key"]

    def _sync_post(self, key: str, payload: dict) -> dict:
        req = urllib.request.Request(
            f"{self.api_base}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return {"code": resp.status, "data": json.loads(resp.read().decode())}
        except urllib.error.HTTPError as e:
            return {"code": e.code, "error": e.read().decode()}

    async def execute_chat_completion(self, role: str, messages: list):
        key = self.get_api_key(role)
        payload = {"model": self.model, "messages": messages, "temperature": 0.2}
        res = await asyncio.to_thread(self._sync_post, key, payload)
        if res.get("code") == 429:
            key = self.rotate_on_429(role)
            res = await asyncio.to_thread(self._sync_post, key, payload)
        return res.get("data", {})`,

      mandor: `#!/usr/bin/env python3
# mandor.py - Orchestrator Atria-Dawn-Preview
import os, sys, json, asyncio
from client_rotator import AtriaKeyRotator
from worker_tools import AgentSandboxTools

class MandorOrchestrator:
    def __init__(self, task_id: str, brief: str):
        self.task_id = task_id
        self.brief = brief
        self.rotator = AtriaKeyRotator()
        self.task_dir = os.path.expanduser(f"~/agent-workspace/tasks/{task_id}")

    async def run(self):
        print(f"[MANDOR] Memproses {self.task_id} dengan {self.rotator.model}...")
        
        # 1. Perencanaan (Panggil Atria via urllib native)
        res = await self.rotator.execute_chat_completion("mandor", [
            {"role": "system", "content": "Kamu adalah Mandor AI. Pecah tugas menjadi subtask backend & frontend."},
            {"role": "user", "content": self.brief}
        ])
        content = res.get("choices", [{}])[0].get("message", {}).get("content", "Rencana dibuat.")
        print(f"✓ Rencana: {content[:100]}...")
        
        # 2. Tulis kontrak komunikasi
        b_tools = AgentSandboxTools(self.task_dir, "backend")
        b_tools.write_file("shared/api-contract.json", json.dumps({"endpoints": [{"path": "/api/demo", "method": "GET"}]}, indent=2))
        print("✓ shared/api-contract.json berhasil ditulis.")`,

      tools: `#!/usr/bin/env python3
# worker_tools.py - Sandboxed Execution Tools untuk Termux
import os, subprocess, json

class AgentSandboxTools:
    def __init__(self, task_root: str, agent_subpath: str):
        self.workdir = os.path.abspath(os.path.join(task_root, agent_subpath))
        self.shared_dir = os.path.abspath(os.path.join(task_root, "shared"))
        os.makedirs(self.workdir, exist_ok=True)
        os.makedirs(self.shared_dir, exist_ok=True)

    def read_file(self, rel_path: str) -> str:
        with open(os.path.join(self.workdir, rel_path), "r", encoding="utf-8") as f:
            return f.read()

    def write_file(self, rel_path: str, content: str):
        target = os.path.join(self.shared_dir if rel_path.startswith("shared/") else self.workdir, rel_path)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        return {"status": "success", "path": target}`
    };

    codeEl.textContent = scripts[activeTab] || scripts['main'];
  }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new DashboardApp();
});
