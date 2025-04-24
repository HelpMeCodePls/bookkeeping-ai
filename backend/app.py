from flask import Flask, request, jsonify, send_from_directory
import os, asyncio
from flask_cors import CORS
from backend.Agents import Customer_Service_Agent  # 你的主智能体
from semantic_kernel.agents import ChatHistoryAgentThread
thread: ChatHistoryAgentThread = ChatHistoryAgentThread()
# ==== Flask 初始化 ====
app = Flask(__name__, static_folder="static")
CORS(app)

# ==== 首页：加载聊天前端页面 ====
@app.route("/")
def home():
    return send_from_directory(os.path.join(app.root_path, 'static'), "test_chat.html")

# ==== 健康检查 ====
@app.route("/ping")
def ping():
    return "pong", 200

# ==== 主聊天接口（使用 get_response） ====
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    user_id = data.get("user_id", "test_user")

    print(f"[CHAT] 来自 {user_id} 的消息: {message}")

    try:
        async def run():
            response = await Customer_Service_Agent.get_response(messages=message,thread=thread )
            print(f"[RESPONSE] {response.content}")
            return str(response.content)  # ⚠️ 必须转成字符串，不能直接 jsonify 对象

        result = asyncio.run(run())
        return jsonify({"response": result})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"response": f"[系统错误]: {str(e)}"})

# ==== 启动服务（支持 Render 端口配置） ====
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
