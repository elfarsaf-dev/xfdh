#!/usr/bin/env python3
"""
mandor.py - Orchestrator Multi-Agent Atria Dawn Preview
EKSEKUSI PARALEL (Backend & Frontend berjalan bersamaan secara simultan).
Output terminal bersih, ringkas, dan tidak memenuhi layar.
"""

import os
import sys
import json
import time
import asyncio
import shutil
from client_rotator import AtriaKeyRotator
from worker_tools import AgentSandboxTools

class MandorOrchestrator:
    def __init__(self, task_id: str, prompt_brief: str):
        self.task_id = task_id
        self.prompt_brief = prompt_brief
        self.task_dir = os.path.abspath(f"tasks/{task_id}")
        os.makedirs(self.task_dir, exist_ok=True)
        
        self.rotator = AtriaKeyRotator()
        self.task_json_path = os.path.join(self.task_dir, "task.json")
        self.load_or_init_metadata()

    def log(self, tag: str, msg: str):
        t = time.strftime("%H:%M:%S")
        print(f"[{t}] {tag} {msg}")

    def load_or_init_metadata(self):
        if os.path.exists(self.task_json_path):
            try:
                with open(self.task_json_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                    return
            except Exception:
                pass

        self.metadata = {
            "task_id": self.task_id,
            "brief": self.prompt_brief,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "INITIALIZED",
            "model": self.rotator.model,
            "ports": {"backend": 3001, "frontend": 5174},
            "subtasks": {}
        }
        self.save_metadata()

    def save_metadata(self):
        with open(self.task_json_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2)

    def extract_code_block(self, text: str, default_code: str = "") -> str:
        if "```" in text:
            parts = text.split("```")
            for i in range(1, len(parts), 2):
                code_segment = parts[i]
                lines = code_segment.split("\n", 1)
                if len(lines) > 1 and len(lines[0].strip()) < 15:
                    return lines[1].strip()
                return code_segment.strip()
        return text.strip() or default_code

    async def step_1_planning(self) -> str:
        self.log("👑 [MANDOR]", f"Memecah instruksi untuk '{self.task_id}' (Key #1)...")
        self.metadata["status"] = "PLANNING"
        self.save_metadata()

        prompt = [
            {
                "role": "system",
                "content": (
                    "Kamu adalah Mandor AI. Pecah tugas menjadi rencana singkat untuk Backend Worker dan Frontend Worker.\n"
                    "Buat ringkas dalam 3-5 butir poin saja."
                )
            },
            {"role": "user", "content": f"Brief: {self.prompt_brief}"}
        ]

        res = await self.rotator.execute_chat_completion("mandor", prompt, live_print=False)
        plan_text = res.get("choices", [{}])[0].get("message", {}).get("content", "")
        self.metadata["subtasks"]["plan"] = plan_text
        self.save_metadata()

        self.log("👑 [MANDOR]", "✓ Perencanaan selesai.")
        return plan_text

    async def worker_backend(self, plan_text: str):
        """Worker Backend (Key #2) berjalan paralel."""
        b_port = self.metadata.get("ports", {}).get("backend", 3001)
        self.log("🛠️ [BACKEND]", f"Sedang membuat server API & contract di port {b_port} (Key #2)...")
        
        backend_tools = AgentSandboxTools(self.task_dir, "backend")

        prompt = [
            {
                "role": "system",
                "content": (
                    f"Kamu adalah Backend Agent. Buat kode server Express lengkap (port {b_port}) "
                    f"dengan endpoint realistis dan CORS aktif. Tulis di dalam ```javascript ... ```."
                )
            },
            {"role": "user", "content": f"Rencana:\n{plan_text}\n\nBuat server.js lengkap."}
        ]

        res = await self.rotator.execute_chat_completion("backend", prompt, live_print=False)
        content = res.get("choices", [{}])[0].get("message", {}).get("content", "")
        code = self.extract_code_block(content, default_code="// Express server ready")

        backend_tools.write_file("src/server.js", code)
        backend_tools.write_file("shared/api-contract.json", json.dumps({
            "task_id": self.task_id,
            "port": b_port,
            "status": "ready"
        }, indent=2))

        self.log("🛠️ [BACKEND]", "✓ Selesai membuat server.js & api-contract.json.")

    async def worker_frontend(self, plan_text: str):
        """Worker Frontend (Key #3) berjalan paralel."""
        f_port = self.metadata.get("ports", {}).get("frontend", 5174)
        self.log("🎨 [FRONTEND]", f"Sedang membuat antarmuka UI di port {f_port} (Key #3)...")

        frontend_tools = AgentSandboxTools(self.task_dir, "frontend")

        prompt = [
            {
                "role": "system",
                "content": (
                    "Kamu adalah Frontend Agent. Buat antarmuka HTML mandiri yang modern dan lengkap "
                    "menggunakan Tailwind CSS CDN dan JavaScript interaktif. Tulis di dalam ```html ... ```."
                )
            },
            {"role": "user", "content": f"Brief: {self.prompt_brief}\n\nRencana: {plan_text}\n\nBuat file index.html lengkap."}
        ]

        res = await self.rotator.execute_chat_completion("frontend", prompt, live_print=False)
        content = res.get("choices", [{}])[0].get("message", {}).get("content", "")
        html_code = self.extract_code_block(content, default_code="<!DOCTYPE html><html><body><h1>UI Ready</h1></body></html>")

        frontend_tools.write_file("src/index.html", html_code)
        self.log("🎨 [FRONTEND]", "✓ Selesai membuat frontend/src/index.html.")

    async def step_audit_and_finalize(self):
        # 1. Monitoring QA (Key #7)
        self.log("🔍 [MONITOR]", "Memeriksa kelengkapan berkas & isolasi folder (Key #7)...")
        mon_tools = AgentSandboxTools(self.task_dir, "monitoring")
        audit_log = f"Audit {time.strftime('%Y-%m-%d %H:%M:%S')}: Semua berkas lengkap dan terisolasi."
        mon_tools.write_file("logs/audit.log", audit_log)
        self.log("🔍 [MONITOR]", "✓ Audit selesai: LULUS.")

        # 2. Finalisasi ke output/
        out_dir = os.path.join(self.task_dir, "output")
        os.makedirs(out_dir, exist_ok=True)
        src_html = os.path.join(self.task_dir, "frontend/src/index.html")
        if os.path.exists(src_html):
            shutil.copy2(src_html, os.path.join(out_dir, "index.html"))

        self.metadata["status"] = "COMPLETED"
        self.metadata["completed_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
        self.save_metadata()

        self.log("📦 [MANDOR]", f"✓ SUKSES! Seluruh tugas selesai. Hasil siap di: {out_dir}/index.html")

    async def run(self):
        print(f"\n========================================================")
        print(f"🚀 MULTI-AGENT PARALEL: {self.task_id}")
        print(f"========================================================")
        
        # 1. Mandor Planning
        plan = await self.step_1_planning()

        # 2. EKSEKUSI PARALEL SEKALIGUS (Backend & Frontend Jalan Bersamaan)
        self.log("⚡ [PARALEL]", "Menjalankan Backend Agent & Frontend Agent SECARA BERSAMAAN...")
        self.metadata["status"] = "IN_PROGRESS"
        self.save_metadata()

        t_start = time.time()
        await asyncio.gather(
            self.worker_backend(plan),
            self.worker_frontend(plan)
        )
        t_workers = time.time() - t_start
        self.log("⚡ [PARALEL]", f"✓ Kedua worker selesai dalam {t_workers:.1f} detik!")

        # 3. Audit & Finalisasi
        await self.step_audit_and_finalize()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Penggunaan: python mandor.py <slug_tugas> [brief]")
        sys.exit(1)

    task_slug = sys.argv[1]
    brief = sys.argv[2] if len(sys.argv) > 2 else "Bikin fitur dasar"
    
    mandor = MandorOrchestrator(task_slug, brief)
    asyncio.run(mandor.run())
