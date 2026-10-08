#!/usr/bin/env python3
"""
test_api.py - Diagnosa Koneksi API Atria Dawn Preview dengan SSE Streaming
Jalankan: python test_api.py
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from client_rotator import load_env

def test():
    load_env()
    api_base = os.getenv("ATRIA_API_BASE", "https://api.atria-asi.ai/v1").rstrip("/")
    model = os.getenv("ATRIA_MODEL", "Atria-Dawn-Preview")
    key_1 = os.getenv("ATRIA_KEY_1", "")

    print("==================================================")
    print("🧪 TES DIAGNOSA KONEKSI ATRIA DAWN PREVIEW (STREAM)")
    print("==================================================")
    print(f"API Base   : {api_base}")
    print(f"Model ID   : {model}")
    masked_key = f"{key_1[:8]}...{key_1[-4:]}" if len(key_1) > 12 else (key_1 or "KOSONG!")
    print(f"Key #1     : {masked_key}")

    if not key_1 or key_1.startswith("atria_sk_mandor_key"):
        print("\n⚠️ PERINGATAN: File .env kamu masih berisi key placeholder/contoh!")
        print("Silakan edit file .env dan isi dengan API Key Atria kamu:")
        print("  nano .env\n")
        return

    url = f"{api_base}/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Halo! Jawab: 'Halo dari Atria-Dawn-Preview! Sistem siap.'"}
        ],
        "stream": True,
        "temperature": 0.2
    }

    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data_bytes, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {key_1}")
    req.add_header("Accept", "text/event-stream")
    req.add_header("User-Agent", "Mozilla/5.0 (Linux; Android 10; Termux) AppleWebKit/537.36")

    print("\n⏳ Mengirim request SSE Streaming...")
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            print("✅ Terhubung ke Atria! Menerima stream teks:")
            print("--------------------------------------------------")
            full_text = ""
            for raw_line in resp:
                line = raw_line.decode("utf-8").strip()
                if not line or not line.startswith("data:"):
                    continue
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
                        sys.stdout.write(delta)
                        sys.stdout.flush()
                except Exception:
                    pass

            dur = time.time() - start_time
            print("\n--------------------------------------------------")
            print(f"🎉 SUKSES BESAR! Respon stream selesai dalam {dur:.1f} detik.")
    except urllib.error.HTTPError as e:
        dur = time.time() - start_time
        err_body = e.read().decode("utf-8") if e.fp else ""
        print(f"\n❌ HTTP ERROR {e.code} ({dur:.1f}s): {err_body}")
    except Exception as e:
        dur = time.time() - start_time
        print(f"\n❌ KONEKSI GAGAL ({dur:.1f}s): {e}")

if __name__ == "__main__":
    test()
