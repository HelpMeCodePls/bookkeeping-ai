from flask import Flask, request, jsonify, send_from_directory
import os
from dotenv import load_dotenv
from backend.Agents import Customer_Service_Agent  # 你定义的智能体
from backend.Agents import Analyst_Agent, Database_Agent #for  future Debug
from semantic_kernel.functions import KernelArguments
from flask_cors import CORS
import asyncio

app = Flask(__name__, static_folder='static')
CORS(app)

@app.route("/")  # ✅ 默认首页跳转到你的chatbot
def chatbot_home():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'test_chat.html')


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message")
    user_id = data.get("user_id", "test_user")

    if not message:
        return jsonify({"response": "请输入有效信息。"})

    args = KernelArguments({"user_id": user_id})

    try:
        # 正确调用异步智能体，并获取结果
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        async def run_agent():
            result = await Customer_Service_Agent.invoke(message, args)
            return result

        response_text = loop.run_until_complete(run_agent())
        return jsonify({"response": response_text})

    except Exception as e:
        return jsonify({"response": f"[系统错误]: {str(e)}"})