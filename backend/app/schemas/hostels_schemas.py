from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class HostelModel(BaseModel):
    id: int
    hostel_id: str
    name: str
    is_active: bool
    created_on: datetime
    updated_on: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "Hostel One",
                "is_active": True
            }
        }

class HostelCreateModel(BaseModel):
    names: List[str]
    is_active: bool = True

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "names": ["Hostel One", "Hostel Two"],
                "is_active": True
            }
        }


class HosteUpdateModel(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
