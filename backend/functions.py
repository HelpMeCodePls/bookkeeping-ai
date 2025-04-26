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
class DatabaseClient:
    def __init__(self, uri: str = "mongodb+srv://ldvdzhang:Zsk011006@cluster0.ltnlqvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", db_name: str = "bookkeeping_db"):

        # Create a new client and connect to the server
        client = MongoClient(uri)

        # Send a ping to confirm a successful connection
        try:
            client.admin.command('ping')
            print("Pinged your deployment. You successfully connected to MongoDB!")
            self.client = client
            self.db = client[db_name]
        except Exception as e:
            print(e)


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
            "name": normalize_entry(name),
            "owner": owner,
            "budgets": float(budgets),
            "spent": float(spent),
            "collaborators": []  # Initialize with an empty list of collaborators
        }
        self.col.insert_one(ledger_data)
        
        return ledger_data["_id"]  # Return the ID of the created ledger
    
    @kernel_function(description="Searches for ledgers based on a single field and its value.")
    def search_ledger_by_field(
        self,
        field_name: Annotated[str, "Name of the field to search by. The only acceptable names are 'owner', 'name', '_id', 'budgets', and 'spent'."],
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
            return {"permission": "VIEWER"}  # 没找到就默认最低权限
        if ledger.get("owner") == user_id:
            return {"permission": "OWNER"}
        # 可加协作者判断，这里暂时默认 viewer
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
# --- RECORD OPERATIONS ---
class RecordService:
    def __init__(self, db_client = DatabaseClient()):
        self.col = db_client.db['records']

    @kernel_function(description="Creates a new record in a ledger.")
    def create(self, 
            ledger_id: Annotated[str, "Ledger ID that this record belongs to. If not provided, this ID must be a valid uuid ledger ID retrieved from the ledger service."], 
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
            "merchant": normalize_entry(merchant),
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
    
    @kernel_function(description="Searches for records based on a single field and its value.")
    def search_records_by_field(
        self,
        field_name: Annotated[str, "Name of the field to search by. The only acceptable names are 'ledger_id', 'amount', 'merchant', 'category', 'date', 'status', 'description', and 'createdBy'."],
        field_value: Annotated[str, "Value to search for in the specified field."]
    ) -> Annotated[List[Dict[str, Any]], "List of matching records."]:
        print(f"[LOG] Searching records where {field_name} = {field_value}")
        
        # Optional: Validate allowed fields
        allowed_fields = {"ledger_id", "amount", "merchant", "category", "date", "status", "description", "createdBy"}
        if field_name not in allowed_fields:
            print(f"[ERROR] Invalid field name '{field_name}'. Allowed fields: {allowed_fields}")
            return []
        
        if field_name in ["merchant", "category", "description", "createdBy"]:
            reference_values = self.col.distinct(field_name)
            matched_value = similar_match(field_value, reference_values)
            print(f"[LOG] Matched value: {matched_value}")
        
        return self.col.find({field_name: matched_value}).to_list()
    
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
                "is_AI_generated": is_AI_generated,
                "createdBy": createdBy
            }.items() if v is not None
        }

        result = self.col.update_one({"id": record_id}, {"$set": update_data})
        return {"ok":True} if result.matched_count else {"ok":False}
    
    def get_unfinished_records(self, ledger_id: str) -> List[Dict[str, Any]]:
        return self.col.find({"ledger_id": ledger_id, "status": StatusEnum.incomplete}).to_list() or []

    @kernel_function(description="Deletes a record by its ID.")
    def delete(self, record_id: Annotated[str, "ID of the record to delete"]) -> Annotated[str, "Confirmation message."]:
        result = self.col.delete_one({"id": record_id})
        return f"Record {record_id} deleted." if result.deleted_count else f"Record {record_id} not found."

    # add by antonio: 🛠 获取所有记录
    @kernel_function(description="Retrieves all records across all ledgers.")
    def get_all_records(self) -> Annotated[List[Dict[str, Any]], "List of all records."]:
        return list(self.col.find({}))
    
    
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

    @kernel_function(description="Retrieves all notifications by a user.")
    def get_by_user(self, user_id: Annotated[str, "User ID"]):
        return self.col.find({"user_id": user_id}).to_list() or {}

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
    def get_all(self) -> Annotated[List[Dict[str, Any]], "List of users."]:
        print("[LOG] Retrieving all users...")
        all_users = self.col.find({}).to_list()
        return all_users or {}