from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    terms_accepted: bool
    privacy_accepted: bool


class UserResponse(UserBase):
    id: str
    avatar: str
    banner: str
    bio: str
    provider: str
    terms_accepted: bool
    privacy_accepted: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    avatar: Optional[str] = None
    banner: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


class FavoriteBase(BaseModel):
    anime_id: str
    title: Optional[str] = None
    image: Optional[str] = None


class FavoriteResponse(FavoriteBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
