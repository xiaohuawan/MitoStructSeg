import subprocess

# 定义项目路径
FRONTEND_DIR = "//vite"
BACKEND_DIR = "//src"

# 前端启动命令
frontend_cmd = f"cd {FRONTEND_DIR} && source activate flask_web && npm start"

# 后端启动命令
backend_cmd = f"cd {BACKEND_DIR} && source activate flask_web && python app.py"

# 使用 gnome-terminal 打开新终端窗口
subprocess.Popen(["gnome-terminal", "--", "bash", "-c", frontend_cmd])
subprocess.Popen(["gnome-terminal", "--", "bash", "-c", backend_cmd])
