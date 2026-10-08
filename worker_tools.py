#!/usr/bin/env python3
"""
worker_tools.py - Sandboxed Execution Tools untuk Agent di Termux
Setiap agent dibatasi hanya bisa membaca dan menulis dalam workdir-nya masing-masing.
"""

import os
import subprocess
import json
from typing import Dict, Any

class AgentSandboxTools:
    def __init__(self, task_root: str, agent_subpath: str):
        self.task_root = os.path.abspath(task_root)
        self.workdir = os.path.abspath(os.path.join(task_root, agent_subpath))
        self.shared_dir = os.path.abspath(os.path.join(task_root, "shared"))
        os.makedirs(self.workdir, exist_ok=True)
        os.makedirs(self.shared_dir, exist_ok=True)

    def _is_safe_path(self, target_path: str) -> bool:
        """Memastikan path berada di dalam workdir agent atau folder shared."""
        abs_target = os.path.abspath(target_path)
        is_in_workdir = abs_target.startswith(self.workdir)
        is_in_shared = abs_target.startswith(self.shared_dir)
        return is_in_workdir or is_in_shared

    def read_file(self, file_path: str) -> Dict[str, Any]:
        """Membaca isi file di workdir atau shared."""
        full_path = os.path.abspath(os.path.join(self.workdir, file_path))
        if not self._is_safe_path(full_path):
            return {"error": "Akses Ditolak: Di luar batas isolasi folder agent!"}
        
        if not os.path.exists(full_path):
            return {"error": f"File {file_path} tidak ditemukan"}

        try:
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
            return {"status": "success", "content": content}
        except Exception as e:
            return {"error": str(e)}

    def write_file(self, file_path: str, content: str) -> Dict[str, Any]:
        """Menulis file ke workdir atau shared/."""
        if file_path.startswith("shared/"):
            rel_file = file_path.replace("shared/", "", 1)
            full_path = os.path.join(self.shared_dir, rel_file)
        else:
            full_path = os.path.join(self.workdir, file_path)

        full_path = os.path.abspath(full_path)
        if not self._is_safe_path(full_path):
            return {"error": "Akses Ditolak: Dilarang menulis di luar folder tugas!"}

        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        try:
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            return {"status": "success", "path": full_path, "bytes": len(content)}
        except Exception as e:
            return {"error": str(e)}

    def run_shell(self, command: str) -> Dict[str, Any]:
        """Menjalankan perintah shell dengan guard rail keamanan Termux."""
        forbidden = ["rm -rf /", "rm -rf ~", "mkfs", "dd ", ":(){ :|:& };:"]
        for bad in forbidden:
            if bad in command:
                return {"error": f"Perintah diblokir oleh sistem keamanan sandbox: {bad}"}

        try:
            res = subprocess.run(
                command,
                shell=True,
                cwd=self.workdir,
                capture_output=True,
                text=True,
                timeout=60
            )
            return {
                "returncode": res.returncode,
                "stdout": res.stdout,
                "stderr": res.stderr
            }
        except subprocess.TimeoutExpired:
            return {"error": "Perintah timeout (> 60 detik)"}
        except Exception as e:
            return {"error": str(e)}
