from flask import Flask, request, jsonify, send_from_directory
import os
from dotenv import load_dotenv
from backend.agents import Customer_Service_Agent  # 你定义的智能体
from backend.agents import Analyst_Agent, Database_Agent #for  future Debug
from semantic_kernel.functions import KernelArguments
from flask_cors import CORS

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

    args = KernelArguments({
        "user_id": user_id
    })

    try:
        result = Customer_Service_Agent.invoke(message, args)
        return jsonify({"response": result})
    except Exception as e:
        return jsonify({"response": f"[系统错误]: {str(e)}"})