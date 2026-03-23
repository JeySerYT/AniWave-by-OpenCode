from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import ProfileUpdate, UserResponse, FavoriteBase, FavoriteResponse
from app.services.user_service import UserService
from app.services.favorite_service import FavoriteService
from app.routers.auth import get_current_user
from app.models.models import User

router = APIRouter(tags=["Profile"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.username and profile_data.username != current_user.username:
        existing = UserService.get_by_username(db, profile_data.username)
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=409,
                detail="Username already taken"
            )
    
    user = UserService.update_profile(
        db,
        current_user,
        username=profile_data.username,
        avatar=profile_data.avatar,
        banner=profile_data.banner,
        bio=profile_data.bio
    )
    return user


@router.get("/favorites", response_model=list[FavoriteResponse])
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorites = FavoriteService.get_by_user(db, current_user.id)
    return favorites


@router.post("/favorites", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def add_favorite(
    favorite_data: FavoriteBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = FavoriteService.get_by_user_and_anime(
        db, current_user.id, favorite_data.anime_id
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Already in favorites"
        )
    
    favorite = FavoriteService.create(
        db,
        user_id=current_user.id,
        anime_id=favorite_data.anime_id,
        title=favorite_data.title,
        image=favorite_data.image
    )
    return favorite


@router.delete("/favorites/{anime_id}")
def remove_favorite(
    anime_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deleted = FavoriteService.delete(db, current_user.id, anime_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Favorite not found"
        )
    return {"message": "Removed from favorites"}
