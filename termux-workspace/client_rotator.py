#!/usr/bin/env python3
"""
client_rotator.py - Atria Dawn Preview Key Rotator & Client Manager
Membaca 7 API Keys dari file .env (atau Environment Variables).
Mendukung failover otomatis saat HTTP 429 Too Many Requests.
"""

import os
import sys
import time
import asyncio
from typing import Dict, Any, Optional, List

try:
    from openai import AsyncOpenAI, RateLimitError, APIError
except ImportError:
    AsyncOpenAI = None

def load_env(env_path: str = ".env"):
    """Parser .env mandiri tanpa perlu install python-dotenv."""
    if not os.path.exists(env_path):
        # Cari di folder workspace parent jika tidak ada di cwd
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
        self.api_base = os.getenv("ATRIA_API_BASE", "https://api.atria-asi.ai/v1")
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

    def get_client(self, role: str) -> Optional[Any]:
        if AsyncOpenAI is None:
            raise ImportError("Jalankan 'pip install openai' terlebih dahulu di Termux.")

        role_map = {
            "mandor": "key_1",
            "backend": "key_2",
            "frontend": "key_3",
            "monitoring": "key_7"
        }
        key_id = role_map.get(role, "key_1")
        key_val = self.keys.get(key_id, {}).get("key")
        
        return AsyncOpenAI(
            base_url=self.api_base,
            api_key=key_val
        )

    def rotate_key_for_role(self, role: str) -> Optional[str]:
        if not self.backup_queue:
            print(f"\n[CRITICAL] Semua key cadangan (.env ATRIA_KEY_4-6) sudah habis!")
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

    async def execute_chat_completion(
        self, 
        role: str, 
        messages: List[Dict[str, str]], 
        tools: Optional[List[Dict[str, Any]]] = None,
        max_retries: int = 3
    ) -> Any:
        client = self.get_client(role)
        attempts = 0

        while attempts < max_retries:
            try:
                params = {
                    "model": self.model,
                    "messages": messages,
                    "temperature": 0.2,
                }
                if tools:
                    params["tools"] = tools

                return await client.chat.completions.create(**params)

            except Exception as e:
                err_str = str(e).lower()
                if "429" in err_str or "rate" in err_str:
                    print(f"[WARN] [{role}] HTTP 429 Rate Limit terdeteksi: {e}")
                    new_key = self.rotate_key_for_role(role)
                    if not new_key:
                        raise RuntimeError("Semua API key cadangan di .env habis!")
                    client = AsyncOpenAI(base_url=self.api_base, api_key=new_key)
                    attempts += 1
                    await asyncio.sleep(1)
                else:
                    print(f"[ERROR] [{role}] Error API: {e}")
                    attempts += 1
                    await asyncio.sleep(2)

        raise RuntimeError(f"Gagal mengeksekusi request untuk agent '{role}' setelah {max_retries} percobaan.")
