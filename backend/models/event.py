from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

# This is the database table
class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    start: datetime
    end: datetime
    description: Optional[str] = None
    source: str = "local"
    category: str = "general"
    reminder: str = "none"
    owner: str = "user"

# This is the request body schema
class EventCreate(SQLModel):
    title: str
    start: datetime
    end: datetime
    description: Optional[str] = None
    source: str = "local"
    category: str = "general"
    reminder: str = "none"
    owner: str = "user"