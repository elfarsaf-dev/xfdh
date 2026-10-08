#!/usr/bin/env python3
"""
client_rotator.py - Atria Dawn Preview Key Rotator & Client Manager
MENGGUNAKAN SSE STREAMING (stream=True & text/event-stream).
100% BEBAS DEPENDENSI, bebas timeout, dan menampilkan teks secara real-time!
"""

import os
import sys
import json
import time
import asyncio
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List

def load_env(env_path: str = ".env"):
    """Parser .env mandiri tanpa dependensi."""
    if not os.path.exists(env_path):
        parent_env = os.path.expanduser("~/agent-workspace/.env")
        if os.path.exists(parent_env):
            env_path = parent_env
        else:
            return

    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k not in os.environ:
                    os.environ[k] = v

class AtriaKeyRotator:
    def __init__(self, env_path: str = ".env"):
        load_env(env_path)
        self.api_base = os.getenv("ATRIA_API_BASE", "https://api.atria-asi.ai/v1").rstrip("/")
        self.model = os.getenv("ATRIA_MODEL", "Atria-Dawn-Preview")
        
        # Load 7 keys
        self.keys: Dict[str, Dict[str, Any]] = {
            "key_1": {"key": os.getenv("ATRIA_KEY_1", ""), "role": "mandor", "status": "active"},
            "key_2": {"key": os.getenv("ATRIA_KEY_2", ""), "role": "backend", "status": "active"},
            "key_3": {"key": os.getenv("ATRIA_KEY_3", ""), "role": "frontend", "status": "active"},
            "key_4": {"key": os.getenv("ATRIA_KEY_4", ""), "role": "backup_1", "status": "standby"},
            "key_5": {"key": os.getenv("ATRIA_KEY_5", ""), "role": "backup_2", "status": "standby"},
            "key_6": {"key": os.getenv("ATRIA_KEY_6", ""), "role": "backup_3", "status": "standby"},
            "key_7": {"key": os.getenv("ATRIA_KEY_7", ""), "role": "monitoring", "status": "active"},
        }
        self.backup_queue: List[str] = ["key_4", "key_5", "key_6"]
        self.rotation_history: List[Dict[str, Any]] = []

    def get_api_key(self, role: str) -> str:
        role_map = {
            "mandor": "key_1",
            "backend": "key_2",
            "frontend": "key_3",
            "monitoring": "key_7"
        }
        key_id = role_map.get(role, "key_1")
        return self.keys.get(key_id, {}).get("key", "")

    def rotate_key_for_role(self, role: str) -> Optional[str]:
        if not self.backup_queue:
            print(f"\n[CRITICAL] Semua key cadangan (.env ATRIA_KEY_4-6) sudah terpakai!")
            return None

        new_key_id = self.backup_queue.pop(0)
        new_api_key = self.keys[new_key_id]["key"]

        role_map = {
            "mandor": "key_1",
            "backend": "key_2",
            "frontend": "key_3",
            "monitoring": "key_7"
        }
        old_key_id = role_map.get(role, "key_1")
        self.keys[old_key_id]["status"] = "rate_limited_429"
        self.keys[new_key_id]["status"] = f"active_assigned_to_{role}"

        event = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "role": role,
            "old_key": old_key_id,
            "new_key": new_key_id,
            "reason": "HTTP 429 Too Many Requests"
        }
        self.rotation_history.append(event)
        print(f"\n[KEY ROTATION] ⚡ Peran '{role}' otomatis rotasi ke {new_key_id} (Cadangan)!")
        return new_api_key

    def _sync_http_stream(self, api_key: str, payload: Dict[str, Any], live_print: bool = True) -> Dict[str, Any]:
        """
        Eksekusi SSE Streaming persis seperti Cloudflare Worker milik user.
        stream=True membuat first-byte response datang dalam hitungan detik!
        """
        url = f"{self.api_base}/chat/completions"
        payload["stream"] = True  # Kunci streaming anti-timeout!
        data_bytes = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(url, data=data_bytes, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {api_key}")
        req.add_header("Accept", "text/event-stream")
        req.add_header("User-Agent", "Mozilla/5.0 (Linux; Android 10; Termux) AppleWebKit/537.36")

        try:
            with urllib.request.urlopen(req, timeout=120) as response:
                full_text = ""
                # Baca stream per baris secara real-time
                for raw_line in response:
                    line = raw_line.decode("utf-8").strip()
                    if not line:
                        continue
                    if line.startswith("data:"):
                        data_part = line[5:].strip()
                        if data_part == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_part)
                            delta = (
                                chunk.get("choices", [{}])[0].get("delta", {}).get("content")
                                or chunk.get("choices", [{}])[0].get("message", {}).get("content")
                                or ""
                            )
                            if delta:
                                full_text += delta
                                if live_print:
                                    sys.stdout.write(delta)
                                    sys.stdout.flush()
                        except Exception:
                            pass

                if live_print:
                    sys.stdout.write("\n")
                    sys.stdout.flush()

                return {
                    "status_code": 200,
                    "data": {
                        "choices": [
                            {"message": {"content": full_text}}
                        ]
                    }
                }

        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8") if e.fp else ""
            return {"status_code": e.code, "error": err_body}
        except Exception as e:
            return {"status_code": 500, "error": str(e)}

    async def execute_chat_completion(
        self, 
        role: str, 
        messages: List[Dict[str, str]], 
        tools: Optional[List[Dict[str, Any]]] = None,
        max_retries: int = 3,
        live_print: bool = True
    ) -> Dict[str, Any]:
        """Panggilan async ke Atria-Dawn-Preview dengan auto-retry & streaming."""
        attempts = 0
        current_key = self.get_api_key(role)

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
        }
        if tools:
            payload["tools"] = tools

        while attempts < max_retries:
            print(f"\n[{role.upper()}] Menghubungkan ke Atria-Dawn-Preview (Streaming SSE)...")
            res = await asyncio.to_thread(self._sync_http_stream, current_key, payload, live_print)

            if res.get("status_code") == 200:
                return res["data"]

            if res.get("status_code") == 429:
                print(f"[WARN] [{role}] HTTP 429 Rate Limit terdeteksi dari Atria!")
                new_key = self.rotate_key_for_role(role)
                if not new_key:
                    raise RuntimeError("Semua API key cadangan di .env habis!")
                current_key = new_key
                attempts += 1
                await asyncio.sleep(1)
            else:
                err_msg = res.get("error", "Unknown error")
                print(f"[ERROR] [{role}] HTTP {res.get('status_code')}: {err_msg}")
                attempts += 1
                await asyncio.sleep(2)

        raise RuntimeError(f"Gagal mengeksekusi request untuk agent '{role}' setelah {max_retries} percobaan.")
