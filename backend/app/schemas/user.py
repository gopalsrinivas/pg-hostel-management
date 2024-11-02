from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    user_role: str
    mobile: str
    password: str
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_role":"Admin",
                "name": "Your Name",
                "email": "your_email@example.com",
                "mobile": "1234567890",
                "password": "your_password"
            }
        }

class UserResponse(BaseModel):
    id: int
    user_id: str
    name: str
    profile_image: str
    user_role: str
    bio: str
    email: EmailStr
    mobile: str
    is_active: bool
    verified_at: Optional[datetime] = None
    created_on: datetime
    updated_on: Optional[datetime] = None

    class Config:
        from_attributes = True

