from pydantic import BaseModel
from pymongo import MongoClient
from typing import Annotated, Dict, Any, List
from datetime import datetime
from semantic_kernel.functions import kernel_function
import uuid
from backend.datatypes import *
from bson import ObjectId  # add by antonio: 🛠 for ObjectId support
from typing import Optional # add by antonio: 🛠 for Optional type
import os

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
    def create(self, name: str, owner: str, budgets: Annotated[str, "The total amount of budget, set by the user."], spent: Annotated[str, "The amount of money that have been spent so far, as an initial value"]) -> Annotated[str, "Ledger ID"]:
        # Instantiate via model constructor
        # print("TAKING LEDGER DATA: ****************\n",name, owner, budgets, spent)
        ledger_data = {
            "_id": str(uuid.uuid4()),  # Generate a new UUID for the ledger ID
            "name": name,
            "owner": owner,
            "budgets": float(budgets),
            "spent": float(spent),
            "collaborators": []  # Initialize with an empty list of collaborators
        }
        self.col.insert_one(ledger_data)
        
        return ledger_data["_id"]  # Return the ID of the created ledger

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
    def get_by_user(self, user_name: Annotated[str, "User name"]) -> Annotated[List[Dict[str, Any]], "List of ledgers."]:
        return self.col.find({"owner": user_name}).to_list()

    @kernel_function(description="Updates the budget of an existing ledger.")
    def update_budget(self, ledger_id: Annotated[str, "ID of the ledger to update"], new_budgets: Annotated[float, "The amount of new budget"]) -> Annotated[Dict[str, bool], "Confirmation message."]:
        result = self.col.update_one({"_id": ledger_id}, {"$set": {"budgets": new_budgets}})
        return {"ok":True} if result.matched_count else f"Ledger {ledger_id} not found."

    @kernel_function(description="Deletes a ledger by its ID.")
    def delete(self, ledger_id: Annotated[str, "ID of the ledger to delete"]) -> Annotated[str, "Confirmation message."]:
        result = self.col.delete_one({"_id": ledger_id})
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

        # 计算总支出，确保 amount 是数字
        total_spent = sum(float(record.get("amount", 0)) for record in records if isinstance(record.get("amount", 0), (int, float)))

        # 更新到 ledger
        result = self.col.update_one({"_id": ledger_id}, {"$set": {"spent": total_spent}})

        return {
            "ok": bool(result.matched_count),
            "new_spent": total_spent
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
            ledger_id: Annotated[str, "Ledger ID that this record belongs to"], 
            amount: Annotated[float, "Amount of money spent on this record"], 
            merchant: Annotated[str, "The merchant or service provider for this record"],
            category: Annotated[CategoryEnum, "The category of purpose that this moneyh is spent for"],
            date: Annotated[str, "The date and time of this transaction in yyyy-mm-dd format"],
            status: Annotated[StatusEnum, "The completion status of this record"],
            description: Annotated[str, "User defined, optional description of this record"], 
            is_AI_generated: Annotated[bool, "Whether this record is generated by AI Agent or not"],
            createdBy: Annotated[str, "User ID of the creator of this record"]
        ) -> Annotated[str, "Record ID"]:
        print("[LOG] Creating a new record...")
        print(ledger_id, amount, merchant, category, date, status, description, is_AI_generated, createdBy)
        try:
            result = self.col.insert_one({
            "_id": str(uuid.uuid4()),  # Generate a new UUID for the record ID
            "ledger_id": ledger_id,
            "amount": amount,
            "merchant": merchant,
            "category": category,
            "date": datetime.strptime(date, "%Y-%m-%d"),
            "status": status,
            "description": description,
            "is_AI_generated": is_AI_generated,
            "createdBy": createdBy
        })
        except Exception as e:
            print("[ERROR] Failed to create record:", e)
            return None
        return result.inserted_id

    @kernel_function(description="Retrieves all records for a specific ledger.")
    def get_by_ledger(self, ledger_id: Annotated[str, "ID of the ledger that this record belongs to"]) -> Annotated[Dict[str, Any], "Record data."]:
        return self.col.find({"ledger_id": ledger_id}).to_list() or {}

    @kernel_function(description="Write the necessary arguments provided by user prompt and the record id, and leave the rest as default values.")
    def update(self, record_id: Annotated[str, "ID of the record"], 
                ledger_id: Annotated[str, "Ledger ID that this record belongs to"]= None, 
                amount: Annotated[float, "Amount of money spent on this record"] = None, 
                merchant: Annotated[str, "The merchant or service provider for this record"] = None,
                category: Annotated[CategoryEnum, "The category of purpose that this moneyh is spent for"] = None,
                date: Annotated[datetime, "The date and time of this transaction"] = None,
                status: Annotated[StatusEnum, "The completion status of this record"] = None,
                description: Annotated[str, "User defined, optional description of this record"]= None,
                is_AI_generated: Annotated[bool, "Whether this record is generated by AI Agent or not"]= None,
                createdBy: Annotated[str, "User ID of the creator of this record"]= None
            ) -> Annotated[str, "Confirmation message."]:
        print("[LOG] Updating record...")
        update_data = { 
            k: v for k, v in {
                "ledger_id": ledger_id,
                "amount": amount,
                "merchant": merchant,
                "category": category,
                "date": date,
                "status": status,
                "description": description,
                "createdBy": createdBy
            }.items() if v is not None
        }

        result = self.col.update_one({"id": record_id}, {"$set": update_data})
        return {"ok":True} if result.matched_count else {"ok":False}

    @kernel_function(description="Deletes a record by its ID.")
    def delete(self, record_id: Annotated[str, "ID of the record to delete"]) -> Annotated[str, "Confirmation message."]:
        result = self.col.delete_one({"id": record_id})
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
            if (mode == "month" or mode == "year") and len(selected_date) >= 7:
                filtered = [r for r in filtered if r.get("date", "").startswith(selected_date)]
            elif mode == "week" and "~" in selected_date:
                start, end = selected_date.split("~")
                start_date = datetime.strptime(start.strip(), "%Y-%m-%d")
                end_date = datetime.strptime(end.strip(), "%Y-%m-%d")
                filtered = [r for r in filtered if start_date <= datetime.strptime(r.get("date", "1970-01-01"), "%Y-%m-%d") <= end_date]

        # 分类统计
        by_category = {}
        for r in filtered:
            category = r.get("category", "Other")
            amount = float(r.get("amount", 0))
            by_category[category] = by_category.get(category, 0) + amount

        # 每日统计
        daily_map = {}
        for r in filtered:
            date = r.get("date")
            amount = float(r.get("amount", 0))
            if date:
                daily_map[date] = daily_map.get(date, 0) + amount

        daily = sorted(daily_map.items(), key=lambda x: x[0])  # 按日期排序

        return {"byCategory": by_category, "daily": daily}
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
    @kernel_function(description="Retrieves all notifications by a user.")
    def get_by_user(self, user_id: Annotated[str, "User ID"]):
        notifications = list(
            self.col.find({"user_id": user_id}).sort("created_at", -1)
        )
        return notifications or []

    @kernel_function(description="Sets a notification as read.")
    def set_read(self, user_id: Annotated[str, "User ID"], notification_id: Annotated[str, "Notification ID"]):
        result = self.col.update_one({"user_id": user_id, "_id": notification_id}, {"$set": {"is_read": True}})
        return {"ok":True} if result.matched_count else {"ok":False}
    
#  edit by antonio: 🛠 获取用户相关代码
class UserService:
    def __init__(self, db_client=DatabaseClient()):
        self.col = db_client.db['users']

    @kernel_function(description="Get all users.")
    def get_all_users(self) -> Annotated[List[Dict[str, Any]], "List of users"]:
        users = list(self.col.find({}))
        return users or []

    @kernel_function(description="Get current user by ID.")
    def get_user_by_id(self, user_id: Annotated[str, "User ID"]) -> Annotated[Dict[str, Any], "User info"]:
        user = self.col.find_one({"id": user_id})
        return user or {}
        
class ChartPlugin:
    @kernel_function(description="Get chart summary by ledgerId, mode, selectedDate")
    def get_summary(self, ledger_id: str, mode: str = "all", selected_date: str = None):
        from backend.functions import RecordService  # 避免循环导入
        record_service = RecordService()
        return record_service.get_summary(ledger_id, mode, selected_date)