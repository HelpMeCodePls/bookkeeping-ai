from flask import Flask, request, jsonify, send_from_directory
import os, asyncio
from flask_cors import CORS
from backend.Agents import Customer_Service_Agent  # 你的主智能体
from backend.functions import LedgerService, RecordService, NotificationService
from semantic_kernel.agents import ChatHistoryAgentThread


# ==== Flask 初始化 ====
app = Flask(__name__, static_folder="static")
CORS(app)

# 初始化必要对象
ledger_service = LedgerService()
record_service = RecordService()
notification_service = NotificationService()
thread: ChatHistoryAgentThread = ChatHistoryAgentThread()

# ==== 首页：加载聊天前端页面 ====
@app.route("/")
def home():
    return send_from_directory(os.path.join(app.root_path, 'static'), "test_chat.html")

# ==== 健康检查 ====
@app.route("/ping")
def ping():
    return "pong", 200

# ==== 主聊天Chat接口（使用 get_response） ====
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

# ==== 📁 Ledger APIs ====

#✅ 获取当前用户所有账本，用 ledger_service.get_by_user(user_id)，直接调用 ✅
@app.route("/ledgers", methods=["GET"])
def get_ledgers():
    token = request.args.get("token", "")
    user_id = token.replace("stub-jwt-", "")  # 解析出user_id
    ledgers = ledger_service.get_by_user(user_id)
    return jsonify(ledgers), 200

#✅ 获取单个账本，用 ledger_service.get(ledger_id)，直接调用 ✅
@app.route("/ledgers/<ledger_id>", methods=["GET"])
def get_ledger(ledger_id):
    ledger = ledger_service.get(ledger_id)
    if not ledger:
        return jsonify({"error": "Ledger not found"}), 404
    return jsonify(ledger), 200

#✅ 新建账本，用 ledger_service.create()，直接调用 ✅
@app.route("/ledgers", methods=["POST"])
def create_ledger():
    data = request.get_json()
    name = data["name"]
    budgets = str(data["budget"])  # 因为 LedgerService 需要 str
    owner = data["token"].split('-')[-1]
    ledger_id = ledger_service.create(name, owner, budgets, spent="0")
    return jsonify({"id": ledger_id}), 201

#✅ 更新账本预算，用 ledger_service.update_budget()，直接调用 ✅
@app.route("/ledgers/<ledger_id>/budgets", methods=["PATCH"])
def update_ledger_budget(ledger_id):
    data = request.get_json()
    new_budget = float(data.get("budget", 0))
    result = ledger_service.update_budget(ledger_id, new_budget)
    return jsonify(result), 200

#删除帐本？？



#🛠 获取当前用户对账本的权限 新增加
@app.route("/ledgers/<ledger_id>/permission", methods=["GET"])
def get_ledger_permission(ledger_id):
    token = request.args.get("token", "")
    user_id = token.replace("stub-jwt-", "")

    ledger = ledger_service.get(ledger_id)
    if not ledger:
        return jsonify({"error": "Ledger not found"}), 404

    # Owner
    if ledger.get("owner") == user_id:
        return jsonify({"permission": "OWNER"}), 200

    # Collaborator
    collaborators = ledger.get("collaborators", [])
    for collaborator in collaborators:
        if collaborator.get("userId") == user_id:
            return jsonify({"permission": collaborator.get("permission", "VIEWER")}), 200

    # Default
    return jsonify({"permission": "VIEWER"}), 200

# ==== 📄 Record APIs ====
#获取账本下的所有记录
@app.route("/ledgers/<ledger_id>/records", methods=["GET"])
def get_records_by_ledger(ledger_id):
    month = request.args.get('month')
    categories = request.args.get('categories', '').split(',')
    split = request.args.get('split')
    collaborator = request.args.get('collaborator')
    records = record_service.get_by_ledger(ledger_id)

    # 进一步过滤
    filtered_records = []
    for r in records:
        if month and (not r.get('date') or not r['date'].strftime("%Y-%m").startswith(month)):
            continue
        if categories and r.get('category') and r['category'].lower() not in categories:
            continue
        if split and not any(s['user_id'] == split for s in r.get('split', [])):
            continue
        if collaborator and r.get('createdBy') != collaborator:
            continue
        filtered_records.append(r)

    return jsonify(filtered_records)

# 添加新纪录
@app.route("/ledgers/<ledger_id>/records", methods=["POST"])
def create_record(ledger_id):
    data = request.get_json()

    # 1. 创建一条新的 record
    record_id = record_service.create(
        ledger_id=ledger_id,
        amount=data["amount"],
        merchant=data["merchant"],
        category=data["category"],
        date=data["date"],
        status=data["status"],
        description=data.get("description", ""),
        is_AI_generated=data.get("is_AI_generated", False),
        createdBy=data.get("user_id", "default_user")
    )

    # 2. 更新 ledger 的 spent
    ledger_service.update_spent(ledger_id)

    # 3. 发送通知
    ledger = ledger_service.get(ledger_id)
    collaborators = ledger.get("collaborators", [])

    for collaborator in collaborators:
        notification_service.create(
            user_id=collaborator.get("userId"),
            ledger_id=ledger_id,
            record_id=record_id,
            is_read=False,
            message=f'New record "{data.get("description", "Unnamed")}" added'
        )

    # 4. 返回当前 ledger 的所有记录 (前端希望收到的是——这个账本（ledger_id）下的所有记录！)
    all_records = record_service.get_by_ledger(ledger_id)
    return jsonify(all_records), 201

#更新一条记录
@app.route("/records/<record_id>", methods=["PUT"])
def update_record(record_id):
    data = request.get_json()

    # 提取字段
    ledger_id = data.get("ledger_id")
    amount = data.get("amount")
    merchant = data.get("merchant")
    category = data.get("category")
    date = data.get("date")
    status = data.get("status")
    description = data.get("description")
    is_AI_generated = data.get("is_AI_generated")
    createdBy = data.get("createdBy")

    # 1. 更新 record
    result = record_service.update(
        record_id=record_id,
        ledger_id=ledger_id,
        amount=amount,
        merchant=merchant,
        category=category,
        date=date,
        status=status,
        description=description,
        is_AI_generated=is_AI_generated,
        createdBy=createdBy
    )

    # 2. 查找这个 record 获取 ledger_id
    record = record_service.get(record_id)
    if record:
        ledger_id = record.get("ledger_id")
        if ledger_id:
            ledger_service.update_spent(ledger_id)  # ✅ 直接用服务方法自动算！

    return jsonify({"ok": True})

# 删除一条记录
@app.route("/records/<record_id>", methods=["DELETE"])
def delete_record(record_id):
    # 1. 查找 record
    record = record_service.get(record_id)
    if not record:
        return jsonify({"error": "Record not found"}), 404

    ledger_id = record.get("ledger_id")

    # 2. 删除 record
    record_service.delete(record_id)

    # 3. 更新 ledger 的 spent
    if ledger_id:
        ledger_service.update_spent(ledger_id)

    return jsonify({"ok": True})

#获取所有未完成的记录
@app.route("/records/incomplete", methods=["GET"])
def get_incomplete_records():
    all_records = record_service.get_all_records()
    incomplete_records = [r for r in all_records if r.get('status') == 'incomplete']
    return jsonify(incomplete_records)

# ==== 🔔 Notification APIs ====

@app.route("/notifications", methods=["GET"])
def get_notifications():
    token = request.args.get("token", "")
    user_id = token.split('-')[-1]
    result = notification_service.get_by_user(user_id)
    return jsonify(result)

@app.route("/notifications/unread_count", methods=["GET"])
def get_unread_count():
    token = request.args.get("token", "")
    user_id = token.split('-')[-1]
    count = notification_service.get_unread_number(user_id)
    return jsonify({"count": count})

@app.route("/notifications/<note_id>", methods=["PATCH"])
def mark_notification_read(note_id):
    token = request.args.get("token", "")
    user_id = token.split('-')[-1]
    result = notification_service.set_read(user_id, note_id)
    return jsonify(result)

@app.route("/notifications", methods=["POST"])
def create_notification():
    data = request.get_json()
    new_id = notification_service.create(
        user_id=data["user_id"],
        ledger_id=data["ledgerId"],
        record_id=data["recordId"],
        is_read=False,
        message=data["content"]
    )
    return jsonify({"id": new_id})

# ==== 👤 User APIs (模拟) ====

@app.route("/users", methods=["GET"])
def get_users():
    users = [{"id": "user1", "name": "Antonio"}, {"id": "user2", "name": "Leo"}]
    return jsonify(users)

@app.route("/users/me", methods=["GET"])
def get_myself():
    user = {"id": "user1", "name": "Antonio", "email": "antonio@example.com"}
    return jsonify(user)

# ==== 📊 Charts APIs (模拟) ====

@app.route("/charts/summary", methods=["GET"])
def get_charts_summary():
    return jsonify({
        "byCategory": {"food": 1200, "transport": 800},
        "daily": [["2025-04-01", 100], ["2025-04-02", 200]]
    })


# ==== 启动服务（支持 Render 端口配置） ====

def parse_token(token: str) -> str:
    # 这里简单地提取 token 的 user_id，比如 token="stub-jwt-user3"，提取 user3
    return token.split("-")[-1]


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
