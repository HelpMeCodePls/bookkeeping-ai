from pydantic import BaseModel
from pymongo import MongoClient
from typing import Annotated, Dict, Any, List
from datetime import datetime
from semantic_kernel.functions import kernel_function
import uuid
import re
from fuzzywuzzy import process
from backend.datatypes import *
from bson import ObjectId  # add by antonio: 🛠 for ObjectId support
from typing import Optional # add by antonio: 🛠 for Optional type
import os
import easyocr
import cv2

def similar_match(entry, reference_names, threshold=80):
    match, score = process.extractOne(entry, reference_names)
    if score >= threshold:
        return match
    else:
        return entry  # or None if no match is good enoughf
    
def normalize_entry(name: str) -> str:
    # Normalize the entry to lowercase and strip whitespace
    name = name.lower().strip()
    name = re.sub(r"[^\w\s]", "", name)   # remove punctuation
    name = re.sub(r"\s+", "_", name)      # spaces to underscores
    name = re.sub(r"_+", "_", name)       # collapse multiple underscores
    return name


# --- DATABASE CLIENT ---
# class DatabaseClient:
#     def __init__(self, uri: str = "mongodb+srv://ldvdzhang:Zsk011006@cluster0.ltnlqvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", db_name: str = "bookkeeping_db"):

#         # Create a new client and connect to the server
#         client = MongoClient(uri)

#         # Send a ping to confirm a successful connection
#         try:
#             client.admin.command('ping')
#             print("Pinged your deployment. You successfully connected to MongoDB!")
#             self.client = client
#             self.db = client[db_name]
#         except Exception as e:
#             print(e)
#             print("Could not connect to MongoDB. Please check your connection string and try again.")
# 把你的 functions.py 中 Mongo URI 改成读取环境变量的形式，这样部署时更安全、也更灵活。
class DatabaseClient:
    def __init__(self, uri: str = None, db_name: str = "bookkeeping_db"):
        # 从环境变量中获取 URI，如果没传参数就用它
        uri = uri or os.environ.get("MONGO_URI")
        if not uri:
            raise ValueError("Mongo URI is missing. Please set the MONGO_URI environment variable.")

        client = MongoClient(uri)
        try:
            client.admin.command('ping')
            print("✅ Connected to MongoDB!")
            self.client = client
            self.db = client[db_name]
        except Exception as e:
            print("❌ MongoDB connection failed:", e)


# --- LEDGER OPERATIONS ---
class LedgerService:
    def __init__(self, db_client = DatabaseClient()):
        self.col = db_client.db['ledgers']

    @kernel_function(description="Creates a new ledger.")
    def create(self, name: str, 
               owner: str, 
               budgets: Annotated[str, "The total amount of budget, set by the user."]) -> Annotated[str, "Ledger ID"]:
        # Instantiate via model constructor
        # print("TAKING LEDGER DATA: ****************\n",name, owner, budgets, spent)
        ledger_data = {
            "_id": str(uuid.uuid4()),  # Generate a new UUID for the ledger ID
            "name": normalize_entry(name),
            "owner": owner,
            "budgets": {
                "default": float(budgets),
                "months": {},
                "categoryDefaults": {},
                "categoryBudgets": {}
            },
            "spent": {},  # Initialize with 0 spent
            "collaborators": []  # Initialize with an empty list of collaborators
        }
        try:
            result = self.col.insert_one(ledger_data)
            print("[LOG] Ledger created, sending notification...")
            # Send notification to the user
            notification_service = NotificationService()
            notification_service.create(
                user_id=None,
                ledger_id=result.inserted_id,
                record_id=None,
                is_read=False,
                message=f"New Ledger created: {normalize_entry(name)}"
            )
        except Exception as e:
            print("[ERROR] Failed to create Ledger:", e)
            return None
        
        
        return ledger_data["_id"]  # Return the ID of the created ledger
    
    @kernel_function(description="Searches for ledgers based on a single field and its value.")
    def search_ledger_by_field(
        self,
        field_name: Annotated[str, "Name of the field to search by. The only acceptable names are 'owner', 'name', '_id'."],
        field_value: Annotated[str, "Value to search for in the specified field."]
    ) -> Annotated[List[Dict[str, Any]], "List of matching ledgers."]:
        print(f"[LOG] Searching ledgers where {field_name} = {field_value}")
        # Optional: Validate allowed fields
        allowed_fields = {"_id", "name", "owner"}
        if field_name not in allowed_fields:
            print(f"[ERROR] Invalid field name '{field_name}'. Allowed fields: {allowed_fields}")
            return []
        
        if field_name in ["name", "owner"]:
            reference_values = self.col.distinct(field_name)
        matched_value = similar_match(field_value, reference_values)
        print(f"[LOG] Matched value: {matched_value}")
        return self.col.find({field_name: matched_value}).to_list()

    @kernel_function(description="Retrieves a ledger by its ID.")
    def get(self, ledger_id: Annotated[str, "ID of the ledger"]) -> Annotated[Dict[str, Any], "Ledger data."]:
        return self.col.find_one({"_id": ledger_id}) or {}
    
    @kernel_function(description="Retrieves all ledgers.")
    def get_all(self) -> Annotated[List[Dict[str, Any]], "List of ledgers."]:
        print("[LOG] Retrieving all ledgers...")
        all_ledgers = self.col.find({}).to_list()
        print(all_ledgers[0])
        return all_ledgers or {}
    
    @kernel_function(description="Retrieves all ledgers of a single user.")
    # def get_by_user(self, user_name: Annotated[str, "User name"]) -> Annotated[List[Dict[str, Any]], "List of ledgers."]:
    #     return self.col.find({"owner": user_name}).to_list()
    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """返回“我拥有的 + 我被加入协作的”所有账本"""
        return list(self.col.find({
            "$or": [
                {"owner": user_id},                 # 我是 owner
                {"collaborators.userId": user_id}   # 我在 collaborators 数组里
            ]
        }))
    
    @kernel_function(description="Updates the budget of an existing ledger. Only Write the necessary arguments provided by user prompt and the ledger_id, do not fill other arguments unlesss specified.")
    def update_budget(self, ledger_id: Annotated[str, "ID of the ledger to update"], 
                      budget: Annotated[float, "The amount of new budget"],
                      month: Annotated[str, "The month that the user wants to set the budget for, defaulted to None"] = None,
                      category: Annotated[str, "The type of objective that this budget is used for, defaulted to None"] = None,
                      setDefault:Annotated[bool, "If set to true, then a default value should be applied"] = True) -> Annotated[Dict[str, bool], "Confirmation message."]:
        print("[LOG] Updating ledger budget...")
        ledger = self.col.find_one({"_id": ledger_id})
        if not ledger:
            return False
        # print(type(month), month, type(category), category, type(setDefault), setDefault)
        # ensure budgets object exists
        budgets = ledger.get("budgets", {
            "default": 0, "months": {}, "categoryDefaults": {}, "categoryBudgets": {}
        })

        if category:
            if setDefault:                       # ① 设置类别默认值
                budgets.setdefault("categoryDefaults", {})[category] = float(budget)
            else:                                # ② 设置某月-某类别预算
                budgets.setdefault("categoryBudgets", {})\
                    .setdefault(month, {})[category] = float(budget)


        else:
            # month‐level budget
            if setDefault:
                budgets["default"] = float(budget)
            else:
                budgets["months"][month] = float(budget)

        # write back
        self.col.update_one(
            {"_id": ledger_id},
            {"$set": {"budgets": budgets}}
        )
        return {"ok":True}

    @kernel_function(description="Deletes a ledger by giving its ID.")
    def delete(self, ledger_id: Annotated[str, "ID of the ledger to delete"]) -> Annotated[str, "Confirmation message."]:
        result = self.col.delete_one({"_id": ledger_id})
        print("[LOG] Ledger deleted, sending notification...")
        # Send notification to the user
        notification_service = NotificationService()
        notification_service.create(
            user_id=None,
            ledger_id=ledger_id,
            record_id=None,
            is_read=False,
            message=f"Ledger deleted: {ledger_id}"
        )
        return f"Ledger {ledger_id} deleted." if result.deleted_count else f"Ledger {ledger_id} not found."

    #edit by antonio: 🛠 获取当前用户对账本的权限
    @kernel_function(description="Retrieves permission of a user on a ledger.")
    def get_permission(self, ledger_id: str, user_id: str) -> Dict[str, str]:
        ledger = self.db['ledgers'].find_one({"_id": ledger_id})
        if not ledger:
            return {"permission": "VIEWER"}

        if ledger.get("owner") == user_id:
            return {"permission": "OWNER"}

        collaborators = ledger.get("collaborators", [])
        for collaborator in collaborators:
            if collaborator.get("userId") == user_id:
                return {"permission": collaborator.get("permission", "VIEWER")}

        return {"permission": "VIEWER"}
    
    # edit by Antonio: 🛠 更新账本的支出
    @kernel_function(description="Updates the spent field of a ledger by recalculating from records.")
    def update_spent(self, ledger_id: Annotated[str, "ID of the ledger to update the spent"]):
        from backend.functions import RecordService  # 避免循环导入
        record_service = RecordService()

        # 获取账本下所有记录
        records = record_service.get_by_ledger(ledger_id) or []
        spent = {}
        for rec in records:
            cat = rec["category"]
            spent[cat] = spent.get(cat, 0) + rec["amount"]
        

        # # 计算总支出，确保 amount 是数字
        # total_spent = sum(float(record.get("amount", 0)) for record in records if isinstance(record.get("amount", 0), (int, float)))

        # 更新到 ledger
        result = self.col.update_one({"_id": ledger_id}, {"$set": {"spent": spent}})

        return {
            "ok": bool(result.matched_count),
            "new_spent": spent
        }
    
    # edit by Antonio: 🛠 获取所有协作者
    @kernel_function(description="Get all collaborators of a ledger.")
    def get_collaborators(self, ledger_id: Annotated[str, "Ledger ID"]) -> Annotated[List[Dict[str, Any]], "List of collaborators"]:
        ledger = self.col.find_one({"_id": ledger_id})
        if ledger and "collaborators" in ledger:
            return ledger["collaborators"]
        return []

    # edit by Antonio: 🛠 添加一个新的协作者
    @kernel_function(description="Add a new collaborator to a ledger.")
    def add_collaborator(self, ledger_id: Annotated[str, "Ledger ID"], user_id: Annotated[str, "User ID"], email: Annotated[str, "Email"], permission: Annotated[str, "Permission level"]) -> Annotated[Dict[str, Any], "New collaborator"]:
        new_collaborator = {
            "userId": user_id,
            "email": email,
            "permission": permission,
            "joinedAt": datetime.utcnow().isoformat() + "Z"
        }
        self.col.update_one(
            {"_id": ledger_id},
            {"$push": {"collaborators": new_collaborator}}
        )
        return new_collaborator

    # edit by Antonio: 🛠 更新某个协作者的权限
    @kernel_function(description="Update a collaborator's permission in a ledger.")
    def update_collaborator_permission(self, ledger_id: Annotated[str, "Ledger ID"], user_id: Annotated[str, "User ID"], new_permission: Annotated[str, "New permission"]) -> Annotated[Dict[str, Any], "Confirmation"]:
        result = self.col.update_one(
            {"_id": ledger_id, "collaborators.userId": user_id},
            {"$set": {"collaborators.$.permission": new_permission}}
        )
        return {"ok": result.modified_count > 0}

    # edit by Antonio: 🛠 移除一个协作者
    @kernel_function(description="Remove a collaborator from a ledger.")
    def remove_collaborator(self, ledger_id: Annotated[str, "Ledger ID"], user_id: Annotated[str, "User ID"]) -> Annotated[Dict[str, Any], "Confirmation"]:
        result = self.col.update_one(
            {"_id": ledger_id},
            {"$pull": {"collaborators": {"userId": user_id}}}
        )
        return {"ok": result.modified_count > 0}
    
# --- RECORD OPERATIONS ---
class RecordService:
    def __init__(self, db_client = DatabaseClient()):
        self.col = db_client.db['records']

    @kernel_function(description="Creates a new record in a ledger.")
    def create(self, 
            ledger_id: Annotated[str, "Ledger ID that this record belongs to. If not provided, this ID must be a valid uuid ledger ID retrieved from the ledger service."], 
            amount: Annotated[float, "Amount of money spent on this record"], 
            category: Annotated[CategoryEnum, "The category of purpose that this moneyh is spent for"],
            date: Annotated[str, "The date and time of this transaction in yyyy-mm-dd format"],
            status: Annotated[StatusEnum, "The completion status of this record, the agent should judge whether this record is complete or not and not ask the user for it"],
            description: Annotated[str, "User defined, optional description of this record"], 
            is_AI_generated: Annotated[bool, "Whether this record is generated by AI Agent or not"],
            createdBy: Annotated[str, "User ID of the creator of this record"],
            merchant : Annotated[str, "The merchant or service provider for this record"] = "unknown",
            split = []
        ) -> Annotated[str, "Record ID"]:
        print("[LOG] Creating a new record...")
        print(ledger_id, amount, merchant, category, date, status, description, is_AI_generated, createdBy)
        try:
            result = self.col.insert_one({
            "_id": str(uuid.uuid4()),  # Generate a new UUID for the record ID
            "ledger_id": ledger_id,
            "amount": amount,
            "merchant": normalize_entry(merchant),
            "category": category,
            "date": datetime.strptime(date, "%Y-%m-%d"),
            "status": status,
            "description": description,
            "is_AI_generated": is_AI_generated,
            "createdBy": createdBy,
            "split": split,  # Initialize with an empty list of splits
        })
            print("[LOG] Record created, sending notification...")
            # Send notification to the user
            notification_service = NotificationService()
            notification_service.create(
                user_id=createdBy,
                ledger_id=ledger_id,
                record_id=result.inserted_id,
                is_read=False,
                message=f"New record created: {description}"
            )

            print("[LOG] updating ledger spent...")
            LedgerService().update_spent(ledger_id)  # Update the ledger's spent field after updating the record
        except Exception as e:
            print("[ERROR] Failed to create record:", e)
            return None
        return result.inserted_id
    
    @kernel_function(description="Searches for records based on a single field and its value.")
    def search_records_by_field(
        self,
        field_name: Annotated[str, "Name of the field to search by. The only acceptable names are 'ledger_id', 'amount', 'merchant', 'category', 'date', 'status', 'description', and 'createdBy'."],
        field_value: Annotated[str, "Value to search for in the specified field."]
    ) -> Annotated[List[Dict[str, Any]], "List of matching records."]:
        print(f"[LOG] Searching records where {field_name} = {field_value}")
        
        # Optional: Validate allowed fields
        allowed_fields = {"_id", "ledger_id", "amount", "merchant",
                  "category", "date", "status", "description", "createdBy"}
        if field_name not in allowed_fields:
            print(f"[ERROR] Invalid field name '{field_name}'. Allowed fields: {allowed_fields}")
            return []
        
        if field_name == "_id":
            rec = self.col.find_one({"_id": field_value})
            return [rec] if rec else []

        if field_name in ["ledger_id", "merchant", "category", "description", "createdBy"]:
            reference_values = self.col.distinct(field_name)
            matched_value = similar_match(field_value, reference_values)
            print(f"[LOG] Matched value: {matched_value}")
            return self.col.find({field_name: matched_value}).to_list()
        return []
    
    @kernel_function(
        description="Retrieves all records under a specific ledger."
    )
    def get_by_ledger(
        self, 
        ledger_id: Annotated[str, "Ledger ID this record belongs to"]
    ) -> List[Dict[str, Any]]:           # ✅ 返回列表而不是单条
        print(f"[LOG] Retrieving records for ledger ID: {ledger_id}")

        recs = list(self.col.find({"ledger_id": ledger_id}))

        # 👉 把 _id 复制一份给前端用
        for r in recs:
            r["id"] = str(r["_id"])      # str() 以防是 ObjectId

        return recs
    
    @kernel_function(description="Updates a record. Only Write the necessary arguments provided by user prompt and the record id, and leave the rest as None.")
    def update(self, record_id: Annotated[str, "ID of the record"], 
                ledger_id: Annotated[str, "Ledger ID that this record belongs to"]= None, 
                amount: Annotated[float, "Amount of money spent on this record"] = None, 
                merchant: Annotated[str, "The merchant or service provider for this record"] = None,
                category: Annotated[CategoryEnum, "The category of purpose that this moneyh is spent for"] = None,
                date: Annotated[str, "The date and time of this transaction, the data format is yyyy-mm-dd"] = None,
                status: Annotated[StatusEnum, "The completion status of this record"] = None,
                description: Annotated[str, "User defined, optional description of this record"]= None,
                is_AI_generated: Annotated[bool, "Whether this record is generated by AI Agent or not"]= None,
                createdBy: Annotated[str, "User ID of the creator of this record"]= None
            ) -> Annotated[str, "Confirmation message."]:
        print("[LOG] Updating record...")

        # Parse string to datetime object
        date_obj = datetime.strptime(date, "%Y-%m-%d")

        # Convert to ISO 8601 string (adds time part as 00:00:00 by default)
        iso_string = str(date_obj.isoformat())

        update_data = { 
            k: v for k, v in {
                "ledger_id": ledger_id,
                "amount": amount,
                "merchant": merchant,
                "category": category,
                "date": iso_string,
                "status": status,
                "description": description,
                "is_AI_generated": is_AI_generated,
                "createdBy": createdBy
            }.items() if v is not None
        }

        result = self.col.update_one({"_id": record_id}, {"$set": update_data})
        try:
            LedgerService().update_spent(ledger_id)  # Update the ledger's spent field after updating the record
        except Exception as e:
            print("[ERROR] Failed to update ledger spent:", e)
            return None
        return {"ok":True} if result.matched_count else {"ok":False}
    
    @kernel_function(description="Add a user to the split list of a record.")
    def add_split(self, record_id: Annotated[str, "ID of the record to update"], 
                  user: Annotated[str, "User name of the user to add to the split list"],
                  split_ratio: Annotated[float, "The ratio that the user should split for, between 0 and 1"]) -> Annotated[str, "Confirmation message."]:
        print("[LOG] Adding split to record...")

        record = self.col.find_one({"_id": record_id})
        if not record:
            return "Record not found."
        split = record.get("split", [])
        new_split = {
            "user_id": user,
            "ratio": split_ratio,
            "amount": record["amount"] * split_ratio
        }
        split.append(new_split)

        try:
            self.col.update_one({"_id": record_id}, {"$set": {"split": split}})
            return {"ok":True}
        except Exception as e:
            print("[ERROR] Failed to update record:", e)
            return None
    
    def get_unfinished_records(self, ledger_id: str) -> List[Dict[str, Any]]:
        # return self.col.find({"ledger_id": ledger_id, "status": StatusEnum.incomplete}).to_list() or []
        return list(
            self.col.find({"ledger_id": ledger_id, "status": StatusEnum.incomplete})
        )
    
    @kernel_function(description="Deletes a record by its ID.")
    def delete(self, record_id: Annotated[str, "ID of the record to delete"]) -> Annotated[str, "Confirmation message."]:
        result = self.col.delete_one({"_id": record_id})
        return f"Record {record_id} deleted." if result.deleted_count else f"Record {record_id} not found."

    # add by antonio: 🛠 获取所有记录
    @kernel_function(description="Retrieves all records across all ledgers.")
    def get_all_records(self) -> Annotated[List[Dict[str, Any]], "List of all records."]:
        return list(self.col.find({}))
    
    # 🆕 Antonio新增: 🛠 获取账本支出图表汇总
    @kernel_function(description="Get summary of records for a ledger, by category and by day.")
    def get_summary(
        self, 
        ledger_id: Annotated[str, "Ledger ID to summarize records from"], 
        mode: Annotated[str, "Summary mode: all, month, week, or year"], 
        selected_date: Annotated[str, "Selected date or period"]
    ) -> Annotated[Dict[str, Any], "Summary data including byCategory and daily"]:
        records = self.col.find({"ledger_id": ledger_id})

        # 📝 先筛选出 ledger_id 匹配的记录
        filtered = list(records)

        # 再根据 mode 和 selectedDate进一步筛选
        if mode != "all" and selected_date:
            # if (mode == "month" or mode == "year") and len(selected_date) >= 7:
            #     filtered = [r for r in filtered if r.get("date", "").startswith(selected_date)]
            if mode in ("month", "year") and selected_date:
                def date_ok(raw):
                    # 允许 str / datetime 都能比对
                    if isinstance(raw, datetime):
                        raw = raw.strftime("%Y-%m-%d")
                    raw = str(raw)
                    return raw.startswith(selected_date)           # 例: 2025-04

                filtered = [r for r in filtered if date_ok(r.get("date"))]

            elif mode == "week" and "~" in selected_date:
                start, end = selected_date.split("~")
                start_date = datetime.strptime(start.strip(), "%Y-%m-%d")
                end_date = datetime.strptime(end.strip(), "%Y-%m-%d")
                filtered = [
                    r for r in filtered 
                    # if start_date <= datetime.strptime(r.get("date", "1970-01-01"), "%Y-%m-%d")
                    # <= end_date
                    if start_date <= (
                        r["date"] if isinstance(r.get("date"), datetime)
                        else datetime.strptime(str(r.get("date")), "%Y-%m-%d")
                     ) <= end_date  
                      ]

        # 分类统计
        by_category = {}
        for r in filtered:
            category = r.get("category", "Other")
            amount = float(r.get("amount", 0))
            by_category[category] = by_category.get(category, 0) + amount

        # 每日统计
        daily_map = {}
        for r in filtered:
            # date = r.get("date")
            raw = r.get("date")
            date = raw.strftime("%Y-%m-%d") if isinstance(raw, datetime) else str(raw)[:10]

            amount = float(r.get("amount", 0))
            if date:
                daily_map[date] = daily_map.get(date, 0) + amount

        # daily = sorted(daily_map.items(), key=lambda x: x[0])  # 按日期排序
        daily = sorted(daily_map.items()) 

        minDate = daily[0][0] if daily else ""
        maxDate = daily[-1][0] if daily else ""

        return {"byCategory": by_category, "daily": daily, "minDate": minDate, "maxDate": maxDate}
    #未开发功能：用户权限获取


class NotificationService:
    def __init__(self, db_client = DatabaseClient()):
        self.col = db_client.db['notifications']

    @kernel_function(description="Creates a new notification.")
    def create(self, user_id: Annotated[str, "User ID"], 
               ledger_id: Annotated[str, "Ledger that this notification belongs to."], 
               record_id: Annotated[str, "Record that this notification belongs to."],
               is_read: Annotated[bool, "Whether this notification has been read."],
               message: Annotated[str, "Notification message."]
               ) -> Annotated[str, "Notification ID"]:
        result = self.col.insert_one({
            "_id": str(uuid.uuid4()),  # Generate a new UUID for the notification ID
            "user_id": user_id,
            "ledger_id": ledger_id,
            "record_id": record_id,
            "is_read": is_read,
            "message": message,
            "created_at": datetime.now()
        })
        return result.inserted_id
    
    @kernel_function(description="Retrieves the number of unread notifications by a user.")    
    def get_unread_number(self, user_id: Annotated[str, "User ID"]):
        unread_count = self.col.count_documents({"user_id": user_id, "is_read": False})
        return unread_count
    '''
    原来版本:
    @kernel_function(description="Retrieves all notifications by a user.")
    def get_by_user(self, user_id: Annotated[str, "User ID"]):
        return self.col.find({"user_id": user_id}).to_list() or {}
    🔵 问题分析：

    self.col.find({"user_id": user_id})：查到了这个用户的所有通知，但没有排序。

    .to_list()：MongoDB 官方 driver 其实没有 .to_list() 这个方法（注意⚡，find() 返回的是一个 Cursor，要手动 list()）。

    or {}：这里返回的是 {}（空字典）不是 []（空数组），不太符合前端预期（前端要的是列表 [] 不是 {} 字典）。

    所以你这版虽然可以正常返回，但是：

    1⃣ 返回类型应该是 列表，不是字典

    2⃣ 少了 按时间倒序 排序
    '''
    @kernel_function(description="Retrieves all notifications by a user name.")
    def get_by_user(self, user_id: Annotated[str, "User name"]):
        print(f"[LOG] Retrieving notifications for user ID: {user_id}")
        notifications = list(
            self.col.find({"user_id": user_id}).sort("created_at", -1)
        )
        # print(notifications)
        return notifications or []
    
    @kernel_function(description="Retrieves all unread notifications by a user name.")
    def get_unread_by_user(self, user_id: Annotated[str, "User name"]):
        print(f"[LOG] Retrieving unread notifications for user ID: {user_id}")
        notifications = list(
            self.col.find({"user_id": user_id, "is_read": False}).sort("created_at", -1)
        )
        return notifications or []

    @kernel_function(description="Sets a notification as read.")
    def set_read(self, user_id: Annotated[str, "User ID"], notification_id: Annotated[str, "Notification ID"]):
        result = self.col.update_one({"user_id": user_id, "_id": notification_id}, {"$set": {"is_read": True}})
        return {"ok":True} if result.matched_count else {"ok":False}
    
class UserService:
    def __init__(self, db_client = DatabaseClient()):
        self.col = db_client.db['users']

    @kernel_function(description="Creates a new user.")
    def create(self, name: str, email: str) -> Annotated[str, "User ID"]:
        user_data = {
            "_id": str(uuid.uuid4()),  # Generate a new UUID for the user ID
            "name": name,
            "email": email,
            "avatar": None
        }
        self.col.insert_one(user_data)
        
        return user_data["_id"]  # Return the ID of the created user
    
    @kernel_function(description="Retrieves a user by their ID.")
    def get(self, user_id: Annotated[str, "ID of the user"]) -> Annotated[Dict[str, Any], "User data."]:
        print(f"[LOG] Retrieving user with ID: {user_id}")
        return self.col.find_one({"_id": user_id}) or {}
    
    @kernel_function(description="Retrieves a user by their name.")
    def get_by_name(self, name: Annotated[str, "Name of the user"]) -> Annotated[Dict[str, Any], "User data."]:
        print(f"[LOG] Retrieving user with name: {name}")
        # Normalize the name for matching
        normalized_name = normalize_entry(name)
        # Get all names from the database
        reference_names = self.col.distinct("name")
        # Find the best match
        matched_name = similar_match(normalized_name, reference_names)
        print(f"[LOG] Matched name: {matched_name}")
        return self.col.find_one({"name": matched_name}) or {}
    
    @kernel_function(description="Retrieves All users.")
    # def get_all_users(self) -> Annotated[List[Dict[str, Any]], "List of users."]:
    #     print("[LOG] Retrieving all users...")
    #     all_users = self.col.find({}).to_list()
    #     return all_users or {}
    def get_all_users(self) -> List[Dict[str, Any]]:
        print("[LOG] Retrieving all users...")
        users = list(self.col.find({}))
        
        # 转换 ObjectId 为字符串
        for user in users:
            if '_id' in user and isinstance(user['_id'], ObjectId):
                user['_id'] = str(user['_id'])
        
        return users
class ChartPlugin:
    @kernel_function(description="Get chart summary by ledgerId, mode, selectedDate")
    def get_summary(self, ledger_id: str, mode: str = "all", selected_date: str = None):
        from backend.functions import RecordService  # 避免循环导入
        record_service = RecordService()
        return record_service.get_summary(ledger_id, mode, selected_date)
    
class OCR:
    def __init__(self, db_client = DatabaseClient()):
        self.reader = easyocr.Reader(['en'])

    def extract_text(self, image_path: str) -> str:
        image = cv2.imread(image_path)

        # Convert image to RGB (OpenCV uses BGR by default)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Perform OCR on the image
        results = self.reader.readtext(image_rgb)

        # Extract detected text into a list
        extracted_texts = [text for (_, text, _) in results]

        # Join all text into a single string
        combined_text = ' '.join(extracted_texts)

        return combined_text