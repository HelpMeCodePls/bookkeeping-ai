# Defines the data types used in the bookkeeping app.

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime


# --- ENUMS FOR CATEGORICAL FIELDS ---
class StatusEnum(str, Enum):
    """Defines the completion status of a record."""
    incomplete = "incomplete"
    confirmed = "confirmed"
    cancelled = "cancelled"

class CategoryEnum(str, Enum):
    """Defines the categories that this transaction is used on."""
    travel = "travel"
    food = "food"
    transport = "transport"
    entertainment = "entertainment"
    utilities = "utilities"
    health = "health"
    other = "other"

# --- MODELS ---

class User(BaseModel):
    id: str
    name: str
    email: str # Use EmailStr for email validation
    avatar: Optional[str]


class Collaborator(BaseModel):
    userId: str
    email: str


class Category(BaseModel):
    key: str
    label: str
    icon: Optional[str]


class Ledger(BaseModel):
    _id: str
    name: str
    owner: str
    budgets: float
    spent: float
    collaborators: List[Collaborator]


class Record(BaseModel):
    _id: str
    ledger_id: str
    amount: float
    merchant: str
    category: CategoryEnum
    date: datetime
    status: StatusEnum
    description: Optional[str]
    is_AI_generated: bool
    createdBy: str

