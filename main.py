#!/usr/bin/env python3
"""
main.py - Interactive CLI Menu untuk Multi-Agent Atria Dawn Preview di Termux
Jalankan: python main.py
"""

import os
import sys
import json
import time
import asyncio
import subprocess
from typing import List, Dict, Any
from client_rotator import AtriaKeyRotator, load_env
from mandor import MandorOrchestrator

TASKS_DIR = os.path.abspath("tasks")

# ANSI Color Codes untuk Terminal Termux
C_RESET = "\033[0m"
C_BOLD = "\033[1m"
C_GREEN = "\033[32m"
C_CYAN = "\033[36m"
C_YELLOW = "\033[33m"
C_RED = "\033[31m"
C_PURPLE = "\033[35m"
C_DIM = "\033[2m"

def clear_screen():
    os.system("clear" if os.name != "nt" else "cls")

def print_header(rotator: AtriaKeyRotator):
    print(f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}")
    print(f"{C_BOLD}{C_GREEN}  🤖 ATRIA DAWN PREVIEW - MULTI-AGENT ORCHESTRATOR (TERMUX CLI){C_RESET}")
    print(f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}")
    print(f"{C_DIM}API Endpoint : {rotator.api_base}")
    print(f"Model ID     : {C_BOLD}{rotator.model}{C_RESET}")
    
    active_keys = sum(1 for k in rotator.keys.values() if k["key"] and not k["key"].startswith("atria_sk_placeholder"))
    print(f"Status .env  : {C_GREEN if active_keys > 0 else C_YELLOW}{active_keys}/7 Key Terisi di .env{C_RESET}")
    print(f"Workspace    : {TASKS_DIR}")
    print(f"{C_BOLD}{C_CYAN}======================================================================{C_RESET}")

def menu_list_tasks() -> List[str]:
    """Menampilkan daftar tugas yang ada di folder tasks/"""
    os.makedirs(TASKS_DIR, exist_ok=True)
    task_dirs = sorted([d for d in os.listdir(TASKS_DIR) if os.path.isdir(os.path.join(TASKS_DIR, d))])
    
    print(f"\n{C_BOLD}📂 DAFTAR TUGAS DI WORKSPACE:{C_RESET}")
    if not task_dirs:
        print(f"{C_YELLOW}  Belum ada tugas. Pilih menu [1] untuk membuat tugas baru.{C_RESET}")
        return []

    print(f"{C_DIM}{'No.':<4} {'ID Tugas':<32} {'Status':<12} {'Port':<14}{C_RESET}")
    print(f"{C_DIM}{'-'*65}{C_RESET}")

    for idx, t_id in enumerate(task_dirs, 1):
        task_json_file = os.path.join(TASKS_DIR, t_id, "task.json")
        status = "READY"
        ports = ":3001/:5174"
        if os.path.exists(task_json_file):
            try:
                with open(task_json_file, "r") as f:
                    data = json.load(f)
                    status = data.get("status", "READY").upper()
                    p = data.get("ports", {})
                    ports = f":{p.get('backend', 3001)}/:{p.get('frontend', 5174)}"
            except Exception:
                pass

        status_color = C_GREEN if status in ["DONE", "COMPLETED"] else (C_CYAN if status in ["READY", "INITIALIZED"] else C_YELLOW)
        print(f"{idx:<4} {t_id:<32} {status_color}{status:<12}{C_RESET} {ports:<14}")

    return task_dirs

def menu_create_task():
    """Menu membuat tugas baru dengan folder isolasi."""
    print(f"\n{C_BOLD}{C_GREEN}➕ BUAT TUGAS BARU (ISOLASI FOLDER){C_RESET}")
    today = time.strftime("%Y-%m-%d")
    
    title = input(f"{C_BOLD}Judul Tugas / Fitur (misal: bikin-login): {C_RESET}").strip()
    if not title:
        print(f"{C_RED}Judul tidak boleh kosong!{C_RESET}")
        return

    slug = "".join(c if c.isalnum() or c == "-" else "-" for c in title.lower()).strip("-")
    
    os.makedirs(TASKS_DIR, exist_ok=True)
    existing_count = len(os.listdir(TASKS_DIR)) + 1
    task_id = f"{today}-{existing_count:03d}-{slug}"
    task_dir = os.path.join(TASKS_DIR, task_id)

    prompt_brief = input(f"{C_BOLD}Prompt / Instruksi untuk Mandor: {C_RESET}").strip()
    if not prompt_brief:
        prompt_brief = f"Bangun modul {title} lengkap dengan backend API dan frontend UI."

    b_port = input(f"Port Backend [Default 3001]: ").strip() or "3001"
    f_port = input(f"Port Frontend [Default 5174]: ").strip() or "5174"

    print(f"\n{C_CYAN}Menginisialisasi folder tugas...{C_RESET}")
    os.makedirs(os.path.join(task_dir, "backend", "src"), exist_ok=True)
    os.makedirs(os.path.join(task_dir, "backend", "logs"), exist_ok=True)
    os.makedirs(os.path.join(task_dir, "frontend", "src"), exist_ok=True)
    os.makedirs(os.path.join(task_dir, "frontend", "logs"), exist_ok=True)
    os.makedirs(os.path.join(task_dir, "monitoring", "logs"), exist_ok=True)
    os.makedirs(os.path.join(task_dir, "shared"), exist_ok=True)
    os.makedirs(os.path.join(task_dir, "output"), exist_ok=True)

    task_meta = {
        "task_id": task_id,
        "title": title,
        "brief": prompt_brief,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "READY",
        "model": "Atria-Dawn-Preview",
        "ports": {
            "backend": int(b_port),
            "frontend": int(f_port)
        },
        "workspaces": {
            "backend": "backend/",
            "frontend": "frontend/",
            "shared": "shared/",
            "output": "output/"
        }
    }
    with open(os.path.join(task_dir, "task.json"), "w", encoding="utf-8") as f:
        json.dump(task_meta, f, indent=2)

    with open(os.path.join(task_dir, "shared", "api-contract.json"), "w", encoding="utf-8") as f:
        json.dump({"contract_version": "1.0", "task_id": task_id, "endpoints": []}, f, indent=2)

    print(f"{C_GREEN}✓ Tugas berhasil dibuat di: {task_dir}{C_RESET}")
    print(f"{C_DIM}Struktur isolasi siap: backend/, frontend/, monitoring/, shared/, output/{C_RESET}")
    
    run_now = input(f"\n{C_BOLD}Jalankan Mandor sekarang? (y/n): {C_RESET}").strip().lower()
    if run_now == "y":
        asyncio.run(execute_mandor_run(task_id, prompt_brief))

async def execute_mandor_run(task_id: str, brief: str):
    """Menjalankan loop Mandor dengan log berwarna di terminal."""
    print(f"\n{C_BOLD}{C_PURPLE}========================================================{C_RESET}")
    print(f"{C_BOLD}{C_PURPLE}🚀 MEMULAI EKSEKUSI TUGAS: {task_id}{C_RESET}")
    print(f"{C_BOLD}{C_PURPLE}========================================================{C_RESET}")

    mandor = MandorOrchestrator(task_id, brief)
    start_time = time.time()
    try:
        await mandor.run()
        elapsed = time.time() - start_time
        print(f"\n{C_GREEN}🎉 Selesai dalam {elapsed:.1f} detik! Seluruh artefak berada di output/{C_RESET}")
    except Exception as e:
        print(f"\n{C_RED}❌ Terjadi kesalahan saat eksekusi: {e}{C_RESET}")

def menu_check_keys(rotator: AtriaKeyRotator):
    """Mengecek status 7 API Key di .env."""
    print(f"\n{C_BOLD}🔑 STATUS 7 API KEY DI .env:{C_RESET}")
    print(f"{C_DIM}{'Key':<8} {'Peran':<12} {'Status':<16} {'Nilai':<20}{C_RESET}")
    print(f"{C_DIM}{'-'*60}{C_RESET}")

    for k_id, info in rotator.keys.items():
        val = info["key"]
        masked = f"{val[:8]}...{val[-4:]}" if len(val) > 12 else (val if val else "(KOSONG)")
        status = info["status"].upper()
        
        status_color = C_GREEN if status == "ACTIVE" else (C_DIM if status == "STANDBY" else C_RED)
        print(f"{k_id:<8} {info['role']:<12} {status_color}{status:<16}{C_RESET} {masked:<20}")

    print(f"\n{C_DIM}Edit file .env jika ingin mengganti API Key Atria asli.{C_RESET}")

def main():
    load_env()
    rotator = AtriaKeyRotator()

    try:
        subprocess.run(["termux-wake-lock"], capture_output=True)
    except Exception:
        pass

    while True:
        clear_screen()
        print_header(rotator)
        print(f"""
{C_BOLD}PILIHAN MENU:{C_RESET}
  {C_GREEN}[1]{C_RESET} ➕ Buat Tugas Baru (Scaffold Folder & Metadata)
  {C_CYAN}[2]{C_RESET} 📂 Lihat Semua Tugas & Status
  {C_PURPLE}[3]{C_RESET} 🚀 Jalankan Mandor untuk Tugas Tertentu
  {C_YELLOW}[4]{C_RESET} 📜 Lihat Kontrak (shared/api-contract.json)
  {C_CYAN}[5]{C_RESET} 🔑 Cek Status 7 API Key di .env
  {C_GREEN}[6]{C_RESET} 🌐 Jalankan Web UI Dashboard (Port 3000)
  {C_RED}[0]{C_RESET} 🚪 Keluar
""")
        choice = input(f"{C_BOLD}Pilih opsi [0-6]: {C_RESET}").strip()

        if choice == "1":
            menu_create_task()
            input(f"\n{C_DIM}Tekan Enter untuk kembali ke menu...{C_RESET}")
        elif choice == "2":
            menu_list_tasks()
            input(f"\n{C_DIM}Tekan Enter untuk kembali ke menu...{C_RESET}")
        elif choice == "3":
            tasks = menu_list_tasks()
            if tasks:
                num = input(f"\n{C_BOLD}Pilih nomor tugas yang ingin dijalankan: {C_RESET}").strip()
                if num.isdigit() and 1 <= int(num) <= len(tasks):
                    selected_task = tasks[int(num) - 1]
                    task_json_file = os.path.join(TASKS_DIR, selected_task, "task.json")
                    brief = "Lanjutkan tugas"
                    if os.path.exists(task_json_file):
                        try:
                            with open(task_json_file, "r") as f:
                                brief = json.load(f).get("brief", brief)
                        except Exception:
                            pass
                    asyncio.run(execute_mandor_run(selected_task, brief))
                else:
                    print(f"{C_RED}Nomor tidak valid!{C_RESET}")
            input(f"\n{C_DIM}Tekan Enter untuk kembali ke menu...{C_RESET}")
        elif choice == "4":
            tasks = menu_list_tasks()
            if tasks:
                num = input(f"\n{C_BOLD}Pilih nomor tugas untuk melihat kontrak: {C_RESET}").strip()
                if num.isdigit() and 1 <= int(num) <= len(tasks):
                    selected_task = tasks[int(num) - 1]
                    contract_path = os.path.join(TASKS_DIR, selected_task, "shared", "api-contract.json")
                    if os.path.exists(contract_path):
                        with open(contract_path, "r") as f:
                            print(f"\n{C_BOLD}=== shared/api-contract.json ({selected_task}) ==={C_RESET}\n")
                            print(f.read())
                    else:
                        print(f"{C_YELLOW}Kontrak belum dibuat untuk tugas ini.{C_RESET}")
            input(f"\n{C_DIM}Tekan Enter untuk kembali ke menu...{C_RESET}")
        elif choice == "5":
            menu_check_keys(rotator)
            test_opt = input(f"\n{C_BOLD}Mau tes ping koneksi ke Atria API sekarang? (y/n): {C_RESET}").strip().lower()
            if test_opt == "y":
                import test_api
                test_api.test()
            input(f"\n{C_DIM}Tekan Enter untuk kembali ke menu...{C_RESET}")
        elif choice == "6":
            print(f"\n{C_GREEN}🚀 Menjalankan Web UI Dashboard di http://localhost:3000...{C_RESET}")
            print(f"{C_DIM}Buka browser Chrome di HP kamu dan akses:{C_RESET} {C_BOLD}http://localhost:3000{C_RESET}")
            print(f"{C_DIM}Tekan Ctrl+C untuk kembali ke menu CLI Termux.{C_RESET}\n")
            try:
                subprocess.run(["npm", "run", "dev"])
            except Exception as e:
                print(f"{C_RED}Gagal menjalankan npm run dev: {e}{C_RESET}")
                print(f"{C_YELLOW}Pastikan nodejs terpasang: pkg install nodejs -y && npm install{C_RESET}")
            input(f"\n{C_DIM}Tekan Enter untuk kembali ke menu...{C_RESET}")
        elif choice == "0":
            print(f"\n{C_GREEN}Sampai jumpa! Sistem multi-agent dihentikan.{C_RESET}\n")
            break
        else:
            print(f"{C_RED}Pilihan tidak valid.{C_RESET}")
            time.sleep(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{C_YELLOW}Dihentikan oleh pengguna (Ctrl+C).{C_RESET}\n")
