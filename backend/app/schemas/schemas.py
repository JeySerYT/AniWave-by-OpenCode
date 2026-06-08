import re
from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
from typing import Optional, Literal
from datetime import datetime


CollectionType = Literal["watching", "completed", "planned"]


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    terms_accepted: bool
    privacy_accepted: bool

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


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


class WatchProgressBase(BaseModel):
    anime_id: str
    title: Optional[str] = None
    poster: Optional[str] = None
    episode: Optional[str] = "1"
    episodes_total: Optional[str] = ""
    genres: Optional[str] = "[]"


class WatchProgressResponse(WatchProgressBase):
    id: str
    user_id: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FavoriteBase(BaseModel):
    anime_id: str
    title: Optional[str] = None
    image: Optional[str] = None
    collection_type: Optional[CollectionType] = "planned"


class FavoriteUpdate(BaseModel):
    collection_type: CollectionType


class FavoriteResponse(FavoriteBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
