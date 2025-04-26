from flask import Flask, request, jsonify, send_from_directory
import os, asyncio
from flask_cors import CORS
from backend.Agents import Customer_Service_Agent  # 你的主智能体
from backend.functions import LedgerService, RecordService, NotificationService, UserService, ChartPlugin  
from semantic_kernel.agents import ChatHistoryAgentThread


# ==== Flask 初始化 ====
app = Flask(__name__, static_folder="frontend_build", static_url_path="")
CORS(app)

# 初始化必要对象
ledger_service = LedgerService()
record_service = RecordService()
notification_service = NotificationService()
user_service = UserService()
chart_plugin = ChartPlugin()
thread: ChatHistoryAgentThread = ChatHistoryAgentThread()

# ==== 首页：加载聊天前端页面 ====
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

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
    try:
        token = request.args.get("token", "")
        if not token:
            return jsonify({"error": "Missing token"}), 400
        
        user_id = token.replace("stub-jwt-", "")
        ledgers = ledger_service.get_by_user(user_id)

        return jsonify(ledgers), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取当前用户所有账本 Error", "details": str(e)}), 500

#✅ 获取单个账本，用 ledger_service.get(ledger_id)，直接调用 ✅
@app.route("/ledgers/<ledger_id>", methods=["GET"])
def get_ledger(ledger_id):
    try:
        ledger = ledger_service.get(ledger_id)
        if not ledger:
            return jsonify({"error": "Ledger not found"}), 404
        return jsonify(ledger), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取单个账本 Error", "details": str(e)}), 500

#✅ 新建账本，用 ledger_service.create()，直接调用 ✅
@app.route("/ledgers", methods=["POST"])
def create_ledger():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "新建账本 Missing request body"}), 400

        name = data.get("name")
        budget = data.get("budget")
        token = data.get("token")

        if not all([name, budget, token]):
            return jsonify({"error": "新建账本 Missing required fields"}), 400

        owner = token.split('-')[-1]
        ledger_id = ledger_service.create(name, owner, str(budget), spent="0")

        return jsonify({"id": ledger_id}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "新建账本 Error", "details": str(e)}), 500

#✅ 更新账本预算，用 ledger_service.update_budget()，直接调用 ✅
@app.route("/ledgers/<ledger_id>/budgets", methods=["PATCH"])
def update_ledger_budget(ledger_id):
    try:
        data = request.get_json()
        if not data or "budget" not in data:
            return jsonify({"error": "更新账本预算 Missing budget"}), 400

        new_budget = float(data["budget"])
        result = ledger_service.update_budget(ledger_id, new_budget)
        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "更新账本预算 Error", "details": str(e)}), 500

#删除帐本？？


#🛠 获取当前用户对账本的权限 新增加
@app.route("/ledgers/<ledger_id>/permission", methods=["GET"])
def get_ledger_permission(ledger_id):
    try:
        token = request.args.get("token", "")
        if not token:
            return jsonify({"error": "获取当前用户对账本的权限 Missing token"}), 400

        user_id = token.replace("stub-jwt-", "")
        ledger = ledger_service.get(ledger_id)

        if not ledger:
            return jsonify({"error": "获取当前用户对账本的权限 Ledger not found"}), 404

        if ledger.get("owner") == user_id:
            return jsonify({"permission": "OWNER"}), 200

        collaborators = ledger.get("collaborators", [])
        for collaborator in collaborators:
            if collaborator.get("userId") == user_id:
                return jsonify({"permission": collaborator.get("permission", "VIEWER")}), 200

        return jsonify({"permission": "VIEWER"}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取当前用户对账本的权限 Error", "details": str(e)}), 500


# ==== 📄 Record APIs ====
#获取账本下的所有记录
@app.route("/ledgers/<ledger_id>/records", methods=["GET"])
def get_records_by_ledger(ledger_id):
    try:
        month = request.args.get('month')
        categories = request.args.get('categories', '').split(',')
        split = request.args.get('split')
        collaborator = request.args.get('collaborator')

        records = record_service.get_by_ledger(ledger_id)

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

        return jsonify(filtered_records), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取账本下的所有记录Error", "details": str(e)}), 500

# 添加新纪录
@app.route("/ledgers/<ledger_id>/records", methods=["POST"])
def create_record(ledger_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), 400

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

        ledger_service.update_spent(ledger_id)

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

        all_records = record_service.get_by_ledger(ledger_id)
        return jsonify(all_records), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "添加新纪录 Error", "details": str(e)}), 500

#更新一条记录
@app.route("/records/<record_id>", methods=["PUT"])
def update_record(record_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), 400

        ledger_id = data.get("ledger_id")
        amount = data.get("amount")
        merchant = data.get("merchant")
        category = data.get("category")
        date = data.get("date")
        status = data.get("status")
        description = data.get("description")
        is_AI_generated = data.get("is_AI_generated")
        createdBy = data.get("createdBy")

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

        record = record_service.get(record_id)
        if record:
            ledger_id = record.get("ledger_id")
            if ledger_id:
                ledger_service.update_spent(ledger_id)

        return jsonify({"ok": True})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "更新一条记录 Error", "details": str(e)}), 500

# 删除一条记录
@app.route("/records/<record_id>", methods=["DELETE"])
def delete_record(record_id):
    try:
        record = record_service.get(record_id)
        if not record:
            return jsonify({"error": "Record not found"}), 404

        ledger_id = record.get("ledger_id")

        record_service.delete(record_id)

        if ledger_id:
            ledger_service.update_spent(ledger_id)

        return jsonify({"ok": True})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "删除一条记录 Error", "details": str(e)}), 500

# 获取所有未完成的记录
@app.route("/records/incomplete", methods=["GET"])
def get_incomplete_records():
    try:
        all_records = record_service.get_all_records()
        incomplete_records = [r for r in all_records if r.get('status') == 'incomplete']
        return jsonify(incomplete_records), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取所有未完成的记录 Error", "details": str(e)}), 500

# ==== 🔔 Notification APIs ====
# 获取所有通知
@app.route("/notifications", methods=["GET"])
def get_notifications():
    try:
        token = request.args.get("token", "")
        if not token:
            return jsonify({"error": "Missing token"}), 400
        user_id = token.split('-')[-1]

        result = notification_service.get_by_user(user_id)
        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取所有通知 Error", "details": str(e)}), 500

# 获取未读通知数量
@app.route("/notifications/unread_count", methods=["GET"])
def get_unread_notifications():
    try:
        token = request.args.get("token", "")
        if not token:
            return jsonify({"error": "Missing token"}), 400
        user_id = token.split('-')[-1]

        count = notification_service.get_unread_number(user_id)
        return jsonify({"count": count}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取未读通知数量 Error", "details": str(e)}), 500

# 标记通知为已读
@app.route("/notifications/<notification_id>", methods=["PATCH"])
def mark_notification_read(notification_id):
    try:
        token = request.args.get("token", "")
        if not token:
            return jsonify({"error": "Missing token"}), 400
        user_id = token.split('-')[-1]

        result = notification_service.set_read(user_id, notification_id)
        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "标记通知为已读 Error", "details": str(e)}), 500

# 创建一条新通知
@app.route("/notifications", methods=["POST"])
def create_notification():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), 400

        user_id = data["user_id"]
        ledger_id = data["ledger_id"]
        record_id = data["record_id"]
        is_read = data.get("is_read", False)
        message = data["message"]

        notification_id = notification_service.create(
            user_id=user_id,
            ledger_id=ledger_id,
            record_id=record_id,
            is_read=is_read,
            message=message
        )

        return jsonify({"notification_id": notification_id}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "创建一条新通知 Error", "details": str(e)}), 500

# ==== 📁 Ledger Collaborators APIs ====

# 获取账本的所有协作者
@app.route("/ledgers/<ledger_id>/collaborators", methods=["GET"])
def get_collaborators(ledger_id):
    try:
        collaborators = ledger_service.get_collaborators(ledger_id)
        return jsonify(collaborators), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取账本的所有协作者 Error", "details": str(e)}), 500

# 添加一个协作者
@app.route("/ledgers/<ledger_id>/collaborators", methods=["POST"])
def add_collaborator(ledger_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), 400

        user_id = data["userId"]
        email = data["email"]
        permission = data["permission"]

        new_collaborator = ledger_service.add_collaborator(
            ledger_id=ledger_id,
            user_id=user_id,
            email=email,
            permission=permission
        )

        notification_service.create(
            user_id=user_id,
            ledger_id=ledger_id,
            record_id="",
            is_read=False,
            message=f"You were added to a ledger."
        )

        return jsonify(new_collaborator), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "添加一个协作者 Error", "details": str(e)}), 500

# 更新协作者的权限
@app.route("/ledgers/<ledger_id>/collaborators/<user_id>", methods=["PATCH"])
def update_collaborator(ledger_id, user_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), 400

        new_permission = data["permission"]

        result = ledger_service.update_collaborator_permission(
            ledger_id=ledger_id,
            user_id=user_id,
            new_permission=new_permission
        )

        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "更新协作者的权限 Error", "details": str(e)}), 500

# 删除协作者
@app.route("/ledgers/<ledger_id>/collaborators/<user_id>", methods=["DELETE"])
def delete_collaborator(ledger_id, user_id):
    try:
        result = ledger_service.remove_collaborator(
            ledger_id=ledger_id,
            user_id=user_id
        )

        notification_service.create(
            user_id=user_id,
            ledger_id=ledger_id,
            record_id="",
            is_read=False,
            message=f"You were removed from a ledger."
        )

        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "删除协作者 Error", "details": str(e)}), 500

# ==== 📁 Category APIs (categories) ====

# 预设分类列表（内存存储，简单版）
categories = [
    {"key": "food", "label": "Food", "icon": "🍔"},
    {"key": "transport", "label": "Transport", "icon": "🚗"},
    {"key": "groceries", "label": "Groceries", "icon": "🛒"},
    {"key": "entertainment", "label": "Entertainment", "icon": "🎮"},
    {"key": "travel", "label": "Travel", "icon": "✈️"},
    {"key": "home", "label": "Home", "icon": "🏠"},
    {"key": "other", "label": "Other", "icon": "✨"},
]

# 🛠 GET /categories - 获取所有分类
@app.route("/categories", methods=["GET"])
def get_categories():
    try:
        return jsonify(categories), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取所有分类 Error", "details": str(e)}), 500

# 🛠 POST /categories - 新增分类
@app.route("/categories", methods=["POST"])
def add_category():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), 400

        new_category = {
            "key": data["label"].lower(),
            "label": data["label"],
            "icon": data.get("icon", "🗂️"),
        }
        categories.append(new_category)

        return jsonify({"ok": True}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "新增分类 Error", "details": str(e)}), 500

# ==== 👤 User APIs ==== 
#【GET 获取所有用户】
@app.route("/users", methods=["GET"])
def get_users():
    try:
        users = user_service.get_all_users()
        return jsonify(users), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

#【GET 获取当前登录用户】
@app.route("/users/me", methods=["GET"])
def get_myself():
    try:
        token = request.args.get("token", "")
        if not token:
            return jsonify({"error": "Missing token"}), 400

        user_id = token.replace("stub-jwt-", "")
        user = user_service.get_user_by_id(user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

# ==== 📈 Charts APIs (支出图表模块) ====

from backend.functions import ChartPlugin  # ✅ 确保引入

chart_plugin = ChartPlugin()

@app.route("/charts/summary", methods=["GET"])
def get_charts_summary():
    try:
        ledger_id = request.args.get("ledgerId")
        mode = request.args.get("mode", "all")
        selected_date = request.args.get("selectedDate", None)

        if not ledger_id:
            return jsonify({"error": "Missing ledgerId"}), 400

        result = chart_plugin.get_summary(
            ledger_id=ledger_id,
            mode=mode,
            selected_date=selected_date
        )

        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()  # 打印详细错误日志，方便debug
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

# ==== 🔑 Auth APIs ====
@app.route("/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data or "email" not in data:
            return jsonify({"error": "Missing email"}), 400

        email = data["email"]
        users = user_service.get_all_users()
        user = next((u for u in users if u.get("email") == email), None)

        if not user:
            return jsonify({"message": "User not found"}), 404

        access_token = f"stub-jwt-{user['id']}"

        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "avatar": user.get("avatar", "👤")
            }
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
    
# # ==== 启动服务（支持 Render 端口配置） ====

# def parse_token(token: str) -> str:
#     # 这里简单地提取 token 的 user_id，比如 token="stub-jwt-user3"，提取 user3
#     return token.split("-")[-1]


# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host="0.0.0.0", port=port, debug=True)
