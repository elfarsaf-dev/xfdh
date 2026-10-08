#!/usr/bin/env python3
"""
dashboard_server.py - Real-Time Dashboard Backend & Static Server
Menyajikan Web UI Dashboard dan API monitoring nyata yang terhubung langsung
ke folder tasks/ dan eksekusi Mandor di Termux.
"""

import os
import sys
import json
import time
import subprocess
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from client_rotator import load_env, AtriaKeyRotator

PORT = 3000
TASKS_DIR = os.path.abspath("tasks")
os.makedirs(TASKS_DIR, exist_ok=True)

class DashboardRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Header anti-CORS dan izinkan iframe
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # 1. API: Ambil semua data tugas nyata dari folder tasks/
        if path == "/api/tasks":
            tasks = []
            if os.path.exists(TASKS_DIR):
                for t_id in sorted(os.listdir(TASKS_DIR)):
                    t_dir = os.path.join(TASKS_DIR, t_id)
                    if os.path.isdir(t_dir):
                        task_meta_path = os.path.join(t_dir, "task.json")
                        meta = {
                            "id": t_id,
                            "slug": t_id,
                            "title": t_id,
                            "status": "READY",
                            "overallProgress": 10,
                            "backendPort": 3001,
                            "frontendPort": 5174,
                            "createdAt": time.strftime("%Y-%m-%d"),
                            "hasOutput": os.path.exists(os.path.join(t_dir, "output/index.html")),
                            "hasContract": os.path.exists(os.path.join(t_dir, "shared/api-contract.json"))
                        }
                        if os.path.exists(task_meta_path):
                            try:
                                with open(task_meta_path, "r", encoding="utf-8") as f:
                                    data = json.load(f)
                                    meta["title"] = data.get("title", meta["title"])
                                    meta["status"] = data.get("status", "READY").upper()
                                    meta["createdAt"] = data.get("created_at", meta["createdAt"])
                                    ports = data.get("ports", {})
                                    meta["backendPort"] = ports.get("backend", 3001)
                                    meta["frontendPort"] = ports.get("frontend", 5174)
                            except Exception:
                                pass

                        # Tentukan progress dari status nyata
                        if meta["status"] in ["COMPLETED", "DONE"]:
                            meta["overallProgress"] = 100
                        elif meta["status"] == "FRONTEND_IN_PROGRESS":
                            meta["overallProgress"] = 75
                        elif meta["status"] == "BACKEND_IN_PROGRESS":
                            meta["overallProgress"] = 50
                        elif meta["status"] == "PLANNING":
                            meta["overallProgress"] = 25
                        else:
                            meta["overallProgress"] = 10

                        tasks.append(meta)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(tasks).encode("utf-8"))
            return

        # 2. API: Baca isi file nyata dari task (contract, task.json, backend, frontend, output)
        if path == "/api/task-files":
            t_id = query.get("task", [""])[0]
            file_type = query.get("type", ["contract"])[0]
            t_dir = os.path.join(TASKS_DIR, t_id)
            
            content = ""
            if os.path.exists(t_dir):
                if file_type == "contract":
                    p = os.path.join(t_dir, "shared/api-contract.json")
                elif file_type == "taskjson":
                    p = os.path.join(t_dir, "task.json")
                elif file_type == "backend":
                    p = os.path.join(t_dir, "backend/src/server.js")
                elif file_type == "frontend":
                    p = os.path.join(t_dir, "frontend/src/index.html")
                elif file_type == "output":
                    p = os.path.join(t_dir, "output/index.html")
                elif file_type == "audit":
                    p = os.path.join(t_dir, "monitoring/logs/audit.log")
                else:
                    p = ""

                if p and os.path.exists(p):
                    try:
                        with open(p, "r", encoding="utf-8") as f:
                            content = f.read()
                    except Exception as e:
                        content = f"Error membaca berkas: {e}"
                else:
                    content = f"Berkas belum dibuat oleh agent ({file_type})."

            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
            return

        # 3. Preview output HTML nyata dari tugas
        if path.startswith("/preview/"):
            t_id = path.replace("/preview/", "").strip("/")
            t_dir = os.path.join(TASKS_DIR, t_id)
            out_file = os.path.join(t_dir, "output/index.html")
            if not os.path.exists(out_file):
                out_file = os.path.join(t_dir, "frontend/src/index.html")

            if os.path.exists(out_file):
                with open(out_file, "r", encoding="utf-8") as f:
                    html_content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(html_content.encode("utf-8"))
                return
            else:
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(b"<html><body style='background:#0f172a;color:#94a3b8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;'><h3>Output tugas belum selesai dibuat oleh Frontend Agent.</h3></body></html>")
                return

        # 4. Status Key dari .env
        if path == "/api/keys":
            load_env()
            rotator = AtriaKeyRotator()
            res_keys = []
            for k_id, v in rotator.keys.items():
                val = v["key"]
                masked = f"{val[:8]}...{val[-4:]}" if len(val) > 12 else (val if val else "KOSONG")
                res_keys.append({
                    "id": k_id,
                    "label": k_id.replace("_", " ").upper(),
                    "role": v["role"],
                    "status": "active" if val and not val.startswith("atria_sk_") else ("active" if val else "standby"),
                    "masked": masked
                })
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res_keys).encode("utf-8"))
            return

        # 5. Serve index.html untuk root
        if path in ["/", "/index.html"]:
            self.path = "/index.html"

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # API: Jalankan Mandor untuk task tertentu
        if path == "/api/run-task":
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            try:
                data = json.loads(body_bytes.decode("utf-8"))
                t_id = data.get("task_id", "")
            except Exception:
                t_id = ""

            if t_id and os.path.exists(os.path.join(TASKS_DIR, t_id)):
                # Jalankan di background
                subprocess.Popen([sys.executable, "mandor.py", t_id])
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "running", "message": f"Mandor dijalankan untuk {t_id}"}).encode("utf-8"))
                return
            else:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Task ID tidak valid"}).encode("utf-8"))
                return

        self.send_response(404)
        self.end_headers()

def run_server(port=3000):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, DashboardRequestHandler)
    print(f"============================================================")
    print(f"🌐 ATRIA REAL-TIME MONITORING SERVER AKTIF")
    print(f"Akses di Browser HP: http://localhost:{port}")
    print(f"Terhubung langsung ke folder: {TASKS_DIR}")
    print(f"Tekan Ctrl+C untuk berhenti dan kembali ke menu Termux.")
    print(f"============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer dihentikan.")

if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else PORT
    run_server(p)
