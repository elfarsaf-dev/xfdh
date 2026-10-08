#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# init-task.sh - Inisialisasi Struktur Workspace Multi-Agent Atria di Termux
# ==============================================================================

set -e

WORKSPACE_DIR="$HOME/agent-workspace"
TASK_SLUG=${1:-"$(date +%Y-%m-%d)-001-task"}
TASK_DIR="$WORKSPACE_DIR/tasks/$TASK_SLUG"

echo "=========================================================="
echo "🎯 Inisialisasi Workspace Multi-Agent Atria Dawn Preview"
echo "=========================================================="

if command -v termux-wake-lock &> /dev/null; then
    termux-wake-lock
    echo "⚡ Termux wake-lock diaktifkan (Mencegah Android Battery Sleep)"
fi

echo "📁 Membuat folder task di: $TASK_DIR"
mkdir -p "$TASK_DIR/backend/src"
mkdir -p "$TASK_DIR/backend/logs"
mkdir -p "$TASK_DIR/frontend/src"
mkdir -p "$TASK_DIR/frontend/logs"
mkdir -p "$TASK_DIR/monitoring/logs"
mkdir -p "$TASK_DIR/shared"
mkdir -p "$TASK_DIR/output"

cat <<EOF > "$TASK_DIR/task.json"
{
  "task_id": "$TASK_SLUG",
  "created_at": "$(date)",
  "status": "ready",
  "model": "Atria-Dawn-Preview",
  "api_endpoint": "https://api.atria-asi.ai/v1",
  "ports": {
    "backend": 3001,
    "frontend": 5174
  },
  "workspaces": {
    "backend": "backend/",
    "frontend": "frontend/",
    "shared": "shared/",
    "output": "output/"
  }
}
EOF

cat <<EOF > "$TASK_DIR/shared/api-contract.json"
{
  "contract_version": "1.0.0",
  "task_id": "$TASK_SLUG",
  "description": "Kontrak komunikasi antara backend dan frontend agent",
  "endpoints": []
}
EOF

echo "✓ Struktur isolasi selesai dibuat."
echo "🚀 Jalankan: python main.py"
echo "=========================================================="
