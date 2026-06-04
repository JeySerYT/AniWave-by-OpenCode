from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import ProfileUpdate, UserResponse, FavoriteBase, FavoriteUpdate, FavoriteResponse, WatchProgressBase, WatchProgressResponse
from app.services.user_service import UserService
from app.services.favorite_service import FavoriteService
from app.services.watch_progress_service import WatchProgressService
from app.routers.auth import get_current_user, verify_origin
from app.models.models import User

router = APIRouter(tags=["Profile"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    request: Request,
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_origin(request)
    if profile_data.username and profile_data.username != current_user.username:
        existing = UserService.get_by_username(db, profile_data.username)
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=409,
                detail="Имя пользователя уже занято"
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
    collection_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorites = FavoriteService.get_by_user(db, current_user.id, collection_type)
    return favorites


@router.post("/favorites", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def add_favorite(
    request: Request,
    favorite_data: FavoriteBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_origin(request)
    existing = FavoriteService.get_by_user_and_anime(
        db, current_user.id, favorite_data.anime_id
    )
    if existing:
        existing.collection_type = favorite_data.collection_type or "planned"
        db.commit()
        db.refresh(existing)
        return existing

    favorite = FavoriteService.create(
        db,
        user_id=current_user.id,
        anime_id=favorite_data.anime_id,
        title=favorite_data.title,
        image=favorite_data.image,
        collection_type=favorite_data.collection_type
    )
    return favorite


@router.patch("/favorites/{anime_id}", response_model=FavoriteResponse)
def update_favorite(
    request: Request,
    anime_id: str,
    update_data: FavoriteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_origin(request)
    favorite = FavoriteService.update_type(db, current_user.id, anime_id, update_data.collection_type)
    if not favorite:
        raise HTTPException(status_code=404, detail="Избранное не найдено")
    return favorite


@router.delete("/favorites/{anime_id}")
def remove_favorite(
    request: Request,
    anime_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_origin(request)
    deleted = FavoriteService.delete(db, current_user.id, anime_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Избранное не найдено"
        )
    return {"message": "Удалено из избранного"}


@router.get("/watch-progress", response_model=list[WatchProgressResponse])
def get_watch_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return WatchProgressService.get_by_user(db, current_user.id)


@router.post("/watch-progress", response_model=WatchProgressResponse)
def save_watch_progress(
    request: Request,
    progress_data: WatchProgressBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_origin(request)
    return WatchProgressService.upsert(
        db,
        user_id=current_user.id,
        anime_id=progress_data.anime_id,
        title=progress_data.title,
        poster=progress_data.poster,
        episode=progress_data.episode,
        episodes_total=progress_data.episodes_total,
        genres=progress_data.genres
    )


@router.delete("/watch-progress/{anime_id}")
def remove_watch_progress(
    request: Request,
    anime_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_origin(request)
    deleted = WatchProgressService.delete(db, current_user.id, anime_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Прогресс просмотра не найден"
        )
    return {"message": "Удалено из просмотренного"}
