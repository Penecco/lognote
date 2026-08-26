import tkinter as tk
from tkinter import ttk, messagebox
import sounddevice as sd
import numpy as np
import sys
import os
import json
import threading
import pystray
from PIL import Image, ImageDraw

CONFIG_FILE = "config.json"
APP_NAME = "MicBooster"

def create_icon_image():
    # pystray用の簡単なアイコン画像を生成 (緑色の丸)
    image = Image.new('RGB', (64, 64), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)
    draw.ellipse((8, 8, 56, 56), fill=(76, 175, 80))
    return image

class MicBoosterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("プロ丸のマイクブースター")
        self.root.geometry("450x350")
        self.root.resizable(False, False)

        self.stream = None
        self.is_running = False
        
        # 設定のロード
        self.config = self.load_config()

        # デバイスの取得
        self.devices = sd.query_devices()
        self.hostapis = sd.query_hostapis()
        
        def get_display_name(d):
            api_name = self.hostapis[d['hostapi']]['name']
            return f"[{api_name}] {d['name']}"
            
        self.input_devices = [get_display_name(d) for d in self.devices if d['max_input_channels'] > 0]
        self.output_devices = [get_display_name(d) for d in self.devices if d['max_output_channels'] > 0]

        # UI構築
        self.build_ui()
        
        # オートスタート処理 (デフォルトは画像通り True/実行中 にする)
        if self.config.get("auto_run", True):
            self.root.after(500, self.start_stream)

    def build_ui(self):
        pad_options = {'padx': 10, 'pady': 10}
        
        # デフォルトで選ぶWASAPIデバイスを探す
        default_in = ""
        default_out = ""
        for d in self.input_devices:
            if "WASAPI" in d: default_in = d; break
        for d in self.output_devices:
            if "WASAPI" in d: default_out = d; break

        # 入力デバイス
        tk.Label(self.root, text="🎤 入力マイク:").grid(row=0, column=0, sticky='w', **pad_options)
        self.in_var = tk.StringVar(value=self.config.get("in_device", default_in if default_in else (self.input_devices[0] if self.input_devices else "")))
        self.in_cb = ttk.Combobox(self.root, textvariable=self.in_var, values=self.input_devices, state="readonly", width=35)
        self.in_cb.grid(row=0, column=1, **pad_options)

        # 出力デバイス
        tk.Label(self.root, text="🔊 出力先 (VB-Cable等):").grid(row=1, column=0, sticky='w', **pad_options)
        self.out_var = tk.StringVar(value=self.config.get("out_device", default_out if default_out else (self.output_devices[0] if self.output_devices else "")))
        self.out_cb = ttk.Combobox(self.root, textvariable=self.out_var, values=self.output_devices, state="readonly", width=35)
        self.out_cb.grid(row=1, column=1, **pad_options)

        # ゲインスライダー (最大5倍に変更)
        tk.Label(self.root, text="⚡ 音量ブースト (倍率):").grid(row=2, column=0, sticky='w', **pad_options)
        self.gain_var = tk.DoubleVar(value=self.config.get("gain", 3.0)) # デフォルト3.0
        self.gain_slider = ttk.Scale(self.root, from_=1.0, to=5.0, variable=self.gain_var, orient=tk.HORIZONTAL, command=self.update_gain_label)
        self.gain_slider.grid(row=2, column=1, sticky='we', **pad_options)
        
        self.gain_label = tk.Label(self.root, text=f"{self.gain_var.get():.1f} 倍", font=("Arial", 10, "bold"))
        self.gain_label.grid(row=3, column=1, sticky='e', padx=10)

        # スタートアップ登録
        self.startup_var = tk.BooleanVar(value=self.check_startup())
        self.startup_chk = tk.Checkbutton(self.root, text="PC起動時に自動で開く (スタートアップ登録)", variable=self.startup_var, command=self.toggle_startup)
        self.startup_chk.grid(row=4, column=0, columnspan=2, pady=5)
        
        # デフォルトでスタートアップ登録をTrueにする
        if not self.config and not self.check_startup():
            self.startup_var.set(True)
            self.toggle_startup()

        # ボタン
        self.start_btn = tk.Button(self.root, text="スタート", bg="#4CAF50", fg="white", font=("Arial", 12, "bold"), command=self.toggle_stream)
        self.start_btn.grid(row=5, column=0, columnspan=2, ipadx=60, ipady=10, pady=10)
        
        self.status_label = tk.Label(self.root, text="■ 停止中", fg="gray", font=("Arial", 10))
        self.status_label.grid(row=6, column=0, columnspan=2)

    def update_gain_label(self, val):
        self.gain_label.config(text=f"{float(val):.1f} 倍")
        self.save_config()

    def get_exe_path(self):
        if getattr(sys, 'frozen', False):
            return sys.executable
        return os.path.abspath(__file__)

    def get_startup_vbs_path(self):
        startup_dir = os.path.join(os.environ["APPDATA"], r"Microsoft\Windows\Start Menu\Programs\Startup")
        return os.path.join(startup_dir, "MicBooster.vbs")

    def check_startup(self):
        return os.path.exists(self.get_startup_vbs_path())

    def toggle_startup(self):
        vbs_path = self.get_startup_vbs_path()
        if self.startup_var.get():
            exe_path = self.get_exe_path()
            # 引数なしで普通に起動させるためのVBScript
            vbs_content = f'Set ws = CreateObject("WScript.Shell")\nws.Run """{exe_path}""", 1'
            try:
                with open(vbs_path, "w", encoding="utf-8") as f:
                    f.write(vbs_content)
            except Exception:
                pass
        else:
            if os.path.exists(vbs_path):
                os.remove(vbs_path)

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except:
                pass
        return {}

    def save_config(self):
        self.config["in_device"] = self.in_var.get()
        self.config["out_device"] = self.out_var.get()
        self.config["gain"] = self.gain_var.get()
        self.config["auto_run"] = self.is_running
        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(self.config, f)
        except:
            pass

    def audio_callback(self, indata, outdata, frames, time, status):
        gain = self.gain_var.get()
        processed = indata * gain
        processed = np.clip(processed, -1.0, 1.0)
        outdata[:] = processed

    def get_device_id(self, device_name):
        for i, d in enumerate(self.devices):
            api_name = self.hostapis[d['hostapi']]['name']
            if f"[{api_name}] {d['name']}" == device_name:
                return i
        return None

    def toggle_stream(self):
        if self.is_running:
            self.stop_stream()
        else:
            self.start_stream()

    def start_stream(self):
        in_name = self.in_var.get()
        out_name = self.out_var.get()
        if not in_name or not out_name:
            return

        in_id = self.get_device_id(in_name)
        out_id = self.get_device_id(out_name)

        if in_id is None or out_id is None:
            return
            
        if self.stream is not None:
            return

        try:
            self.stream = sd.Stream(device=(in_id, out_id),
                                    samplerate=48000,
                                    channels=1,
                                    callback=self.audio_callback)
            self.stream.start()
            self.is_running = True
            self.start_btn.config(text="ストップ", bg="#F44336")
            self.status_label.config(text="▶ ブースト実行中！", fg="red")
            self.save_config()
        except Exception as e:
            messagebox.showerror("エラー", f"マイクの接続に失敗しました:\n{e}")
            self.is_running = False

    def stop_stream(self):
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None
        self.is_running = False
        self.start_btn.config(text="スタート", bg="#4CAF50")
        self.status_label.config(text="■ 停止中", fg="gray")
        self.save_config()

    def hide_window(self):
        # 画面を隠してタスクトレイに格納
        self.root.withdraw()
        menu = (
            pystray.MenuItem('設定を開く', self.show_window),
            pystray.MenuItem('終了', self.quit_app)
        )
        icon_image = create_icon_image()
        self.icon = pystray.Icon("MicBooster", icon_image, "MicBooster", menu)
        # pystrayは別スレッドで走らせる必要がある
        threading.Thread(target=self.icon.run, daemon=True).start()

    def show_window(self, icon, item):
        self.icon.stop()
        self.root.after(0, self.root.deiconify)

    def quit_app(self, icon, item):
        self.icon.stop()
        self.stop_stream()
        self.root.after(0, self.root.destroy)

def main():
    root = tk.Tk()
    app = MicBoosterApp(root)
    # ウィンドウが閉じられたらタスクトレイに格納する
    root.protocol("WM_DELETE_WINDOW", app.hide_window)
    root.mainloop()

if __name__ == "__main__":
    main()
