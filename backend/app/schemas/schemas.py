from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str
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
    username: Optional[str] = None
    avatar: Optional[str] = None
    banner: Optional[str] = None
    bio: Optional[str] = None


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
