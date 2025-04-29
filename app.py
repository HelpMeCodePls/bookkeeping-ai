from flask import Flask, request, jsonify, send_from_directory
import os, asyncio
from flask_cors import CORS
from backend.Agents import Customer_Service_Agent  # 你的主智能体
from backend.functions import LedgerService, RecordService, NotificationService, UserService, ChartPlugin  
from semantic_kernel.agents import ChatHistoryAgentThread
import azure.cognitiveservices.speech as speechsdk
import base64
import uuid
from io import BytesIO
from PIL import Image
import easyocr
import cv2
import numpy as np
from dateutil import parser as dtparser
from datetime import datetime


def _serialize_record(rec: dict) -> dict:
    """
    把 Mongo 里拿到的 record 转成前端友好的 JSON：
    - _id ➜ id         （前端用 r.id）
    - datetime ➜ 'YYYY-MM-DD'
    """
    rec = dict(rec)                # 把 Cursor 返回的 BSON 拷一份
    rec["id"] = rec.pop("_id")

    d = rec.get("date")
    if isinstance(d, datetime):
        rec["date"] = d.strftime("%Y-%m-%d")
    return rec


# ==== Flask initialization ====
app = Flask(__name__, static_folder="frontend_build", static_url_path="")
CORS(app)


ledger_service = LedgerService()
record_service = RecordService()
notification_service = NotificationService()
user_service = UserService()
chart_plugin = ChartPlugin()
thread: ChatHistoryAgentThread = ChatHistoryAgentThread()

# ==== front page：load frontend chat page ====
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

# ==== health check ====
@app.route("/ping")
def ping():
    return "pong", 200

# ==== Main Page Chat Interface（ get_response） ====
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
            return str(response.content)  # ⚠️ must convert to str，cant directly jsonify the object

        result = asyncio.run(run())
        return jsonify({"response": result})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"response": f"[system error]: {str(e)}"})
    
# ==== OCR ====
@app.route('/ocr', methods=['POST'])
def ocr():
    print("[OCR] Image received")
    data = request.get_json()
    image_data = data['image']

    # Remove header 'data:image/jpeg;base64,'
    header, encoded = image_data.split(",", 1)
    image_bytes = base64.b64decode(encoded)

    reader = easyocr.Reader(['en'], gpu=False, download_enabled=False)  # Set gpu=True if you have a GPU and want to use it
    results = reader.readtext(image_bytes)
    print("[OCR] Processing finished. Sending to AI agent...")

    # Prepare response: convert results to text list
    text_results = [text for _, text, _ in results] 
    results = " ".join(text_results)
    message = "You will be given contents of a receipt. " \
    "Please extract the following information from the receipt: " \
    "1. Total amount spent (in dollars) " \
    "2. Merchant name " \
    "3. Date of transaction " \
    "Then pass it to database agent to store the data. " \
    "If the receipt is not valid, please reply with: '[Invalid receipt]'. " \
    "Here is the receipt content: "
    message = message + "\n" + results

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        response = loop.run_until_complete(
            Customer_Service_Agent.get_response(messages=message, thread=thread)
        )
        loop.close()
        # print(f"[RESPONSE] {response.content}")
        return jsonify({"response": str(response.content)})  # ⚠️ must convert to str，cant directly jsonify the object
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"response": f"[system error]: {str(e)}"})
    

# ==== voice to text ====
@app.route('/voice', methods=['POST'])
def voice_to_text():
    try:
        speech_key = os.getenv("SPEECH_KEY")
        service_region = os.getenv("SERVICE_REGION")
        speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
        data = request.get_json()
        audio_base64 = data.get('audio')
        mime_type = data.get('mime')  # example: 'audio/webm'

        if not audio_base64 or not mime_type:
            return jsonify({'error': 'Invalid request format'}), 400

        # Determine file extension from mime type
        extension = mime_type.split('/')[1]
        filename = f"temp_audio_{uuid.uuid4()}.{extension}"

        # Save base64 to file
        with open(filename, "wb") as audio_file:
            audio_file.write(base64.b64decode(audio_base64))

        # Recognize speech from file
        audio_config = speechsdk.audio.AudioConfig(filename=filename)
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        result = speech_recognizer.recognize_once()

        # Delete temp file
        os.remove(filename)

        # Process result
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return jsonify({'text': result.text})
        elif result.reason == speechsdk.ResultReason.NoMatch:
            return jsonify({'text': '[unrecognized speech]'})
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = result.cancellation_details
            print(f"Speech Recognition canceled: {cancellation_details.reason}")
            if cancellation_details.reason == speechsdk.CancellationReason.Error:
                print(f"Error details: {cancellation_details.error_details}")
            return jsonify({'text': '[voice recognition failed]'})
        else:
            return jsonify({'text': '[voice recognition failed]'})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'text': '[voice recognition failed]'}), 500
# ==== 📁 Ledger APIs ====

#✅ get all ledgers for current user，directly use ledger_service.get_by_user(user_id) ✅
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

#✅ get single ledgers for current user， ledger_service.get(ledger_id) ✅
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

#✅ create ledger， ledger_service.create()， ✅
@app.route("/ledgers", methods=["POST"])
def create_ledger():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "新建账本 Missing request body"}), 400

        name = data.get("name")
        # budget = data.get("budget") ## Edited by David, cuz the front end is sending budget in a json format.
        budget = data.get("budgets", {}).get("default")
        
        token = data.get("token")

        if not all([name, budget, token]):
            return jsonify({"error": "新建账本 Missing required fields"}), 400

        owner = token.split('-')[-1]
        ledger_id = ledger_service.create(name, owner, str(budget))

        return jsonify({"id": ledger_id}), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "新建账本 Error", "details": str(e)}), 500


# Edited by David, 
@app.route("/ledgers/<ledger_id>/budgets", methods=["PATCH"])
def update_ledger_budget(ledger_id):
    try:
        data = request.get_json() or {}
        # pull exactly the four fields the JS mock sends
        month      = data.get("month")            # e.g. "2025-04"
        category   = data.get("category")         # e.g. "Food" or None
        budget     = data.get("budget")           # required
        set_default= bool(data.get("setDefault")) # true/false

        if budget is None:
            return jsonify({"error": "Missing field: budget"}), 400

        # coerce
        budget = float(budget)

        # delegate to your service
        updated = ledger_service.update_budget(
            ledger_id,
            budget=budget,
            month=month,
            category=category,
            # set_default=set_default
            setDefault=set_default
        )
        if not updated:
            return jsonify({"error": "Ledger not found"}), 404

        return jsonify({"ok": True}), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": "更新账本预算 Error", "details": str(e)}), 500


#🛠 get current user's permission for current ledger
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
#get all records under this ledger
@app.route("/ledgers/<ledger_id>/records", methods=["GET"])
def get_records_by_ledger(ledger_id):
    try:
        token = request.args.get("token", "")
        if not token:
            return jsonify({"error": "Missing token"}), 400
            
        # validate user permission
        # user_id = token.replace("stub-jwt-", "")
        user_id = token.split('-')[-1]
        ledger = ledger_service.get(ledger_id)
        if not ledger:
            return jsonify({"error": "Ledger not found"}), 404
            
        # validate user permission
        if ledger["owner"] != user_id and not any(
            c["userId"] == user_id for c in ledger.get("collaborators", [])
        ):
            return jsonify({"error": "Unauthorized"}), 403

        month = request.args.get('month')
        # categories = request.args.get('categories', '').split(',')
        raw_cats   = request.args.get("categories")      # None 表示前端没传
        categories = [c.lower() for c in raw_cats.split(",") if c] if raw_cats else []          # [] ⇒ 不启用分类过滤

        # split = request.args.get('split')
        split_uid = request.args.get("split") or None
        collaborator = request.args.get('collaborator')

        status       = request.args.get("status") 

        records = record_service.get_by_ledger(ledger_id)
        # print(f"[DEBUG] Raw records from DB: {records}") 
        filtered = []
        for r in records:
                # 0️⃣ 按 status 过滤
            if status and r.get("status") != status:
                continue
            # ---- 1️⃣ 按月份过滤 ----
            if month:
                raw_date = r.get("date")
                if isinstance(raw_date, datetime):
                    year_month = raw_date.strftime("%Y-%m")
                else:
                    # ISO-string / any str → turn to  datetime then get the year month
                    try:
                        year_month = dtparser.isoparse(str(raw_date)).strftime("%Y-%m")
                    except Exception:
                        continue          # cannot parse this date, skip it
                if year_month != month:
                    continue

            # ---- 2️⃣ filter by category ----
            if categories and r.get("category", "").lower() not in categories:
                continue

            # ---- 3️⃣ 按 split / collaborator 过滤 ----
            if split_uid and not any(
                    (s.get("user_id") or s.get("userId")) == split_uid   # ✅ two compatible keys
                    for s in r.get("split", [])
            ):
                continue
            
            if collaborator and r.get("createdBy") != collaborator:
                continue

            filtered.append(r)
        for rec in filtered:
            rec["id"] = rec["_id"]     

        payload = [_serialize_record(r) for r in filtered]
        return jsonify(payload), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取账本下的所有记录Error", "details": str(e)}), 500

# add a new record to a ledger
@app.route("/ledgers/<ledger_id>/records", methods=["POST"])
def create_record(ledger_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), 400

        # Edited by David, add split handling
        splits = [
            {
                "user_id": s.get("user_id") or s.get("userId"),   # 两个都兼容
                "ratio"  : float(s.get("ratio", 0)),
                "amount" : float(s.get("amount", 0)),
            }
            for s in data.get("split", [])
        ]

        record_id = record_service.create(
            ledger_id=ledger_id,
            amount=data["amount"],
            merchant=data["merchant"],
            category=data["category"],
            date=data["date"],
            status=data["status"],
            description=data.get("description", ""),
            is_AI_generated=data.get("is_AI_generated", False),
            createdBy = data.get("createdBy") or data.get("user_id") or "default_user" ,
            split=splits
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

# update a record
@app.route("/records/<record_id>", methods=["PUT"])
def update_record(record_id):
    try:
        data = request.get_json() or {}

        # 1️⃣ update first
        record_service.update(
            record_id          = record_id,
            ledger_id          = data.get("ledger_id"),
            amount             = data.get("amount"),
            merchant           = data.get("merchant"),
            category           = data.get("category"),
            date               = data.get("date"),
            status             = data.get("status"),
            description        = data.get("description"),
            is_AI_generated    = data.get("is_AI_generated"),
            createdBy          = data.get("createdBy"),
        )

        # 2️⃣ recalculate spent —— if doesnt come with ledger_id，look it up
        ledger_id = data.get("ledger_id")
        if not ledger_id:
            doc = record_service.col.find_one({"_id": record_id})
            ledger_id = doc["ledger_id"] if doc else None

        if ledger_id:
            ledger_service.update_spent(ledger_id)

        return jsonify({"ok": True})

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": "更新一条记录 Error", "details": str(e)}), 500

# Delete Record
@app.route("/records/<record_id>", methods=["DELETE"])
def delete_record(record_id):
    try:
        # 1️⃣ 先取到这条记录
        doc = record_service.col.find_one({"_id": record_id})
        if not doc:
            return jsonify({"error": "Record not found"}), 404

        ledger_id = doc["ledger_id"]

        # 2️⃣ 真正删除
        record_service.delete(record_id)

        # 3️⃣ 同步 ledger 的 spent
        if ledger_id:
            ledger_service.update_spent(ledger_id)

        return jsonify({"ok": True})

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": "删除一条记录 Error", "details": str(e)}), 500

# Get unfinished Records
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
# Get all notifications for current user
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

# Get unread notifications count
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

# Mark notification as read
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

# Create a new notification
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

# Get all collaborators for a ledger
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

# update collaborator permission
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

# Delete a collaborator
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

# preset categories (easy version)
categories = [
    {"key": "food", "label": "Food", "icon": "🍔"},
    {"key": "transport", "label": "Transport", "icon": "🚗"},
    {"key": "groceries", "label": "Groceries", "icon": "🛒"},
    {"key": "entertainment", "label": "Entertainment", "icon": "🎮"},
    {"key": "travel", "label": "Travel", "icon": "✈️"},
    {"key": "home", "label": "Home", "icon": "🏠"},
    {"key": "other", "label": "Other", "icon": "✨"},
]

# 🛠 GET /categories - 
@app.route("/categories", methods=["GET"])
def get_categories():
    try:
        return jsonify(categories), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "获取所有分类 Error", "details": str(e)}), 500

# 🛠 POST /categories - Create Category
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

# Get all users (for admin)
@app.route("/users", methods=["GET"])
def get_users():
    try:
        token = request.args.get("token", "")
        if not token:
            return jsonify({"error": "Missing token"}), 400
            
        # 简单验证token格式
        if not token.startswith("stub-jwt-"):
            return jsonify({"error": "Invalid token format"}), 401
            
        users = user_service.get_all_users() 
        return jsonify(users), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
    
# Get current user
@app.route("/users/me", methods=["GET"])
def get_myself():
    try:
        token = request.args.get("token", "")
        if not token:
            return jsonify({"error": "Missing token"}), 400

        user_id = token.replace("stub-jwt-", "")
        user = user_service.get(user_id)  # ✅ 改成 get()

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
    
# 【Search User by name】
@app.route("/users/search", methods=["GET"])
def search_user_by_name():
    try:
        # 1. take params
        name = request.args.get("name", "")
        if not name:
            return jsonify({"error": "Missing name parameter"}), 400

        # 2. search with user_service 
        user = user_service.get_by_name(name)

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
    
# ==== 📈 Charts APIs (Expense Chart) ====

from backend.functions import ChartPlugin  

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
        traceback.print_exc()  # print the error stack trace
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
    