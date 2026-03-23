from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Favorite


class FavoriteService:
    @staticmethod
    def get_by_user(db: Session, user_id: str) -> List[Favorite]:
        return db.query(Favorite).filter(
            Favorite.user_id == user_id
        ).order_by(Favorite.created_at.desc()).all()

    @staticmethod
    def get_by_user_and_anime(db: Session, user_id: str, anime_id: str) -> Optional[Favorite]:
        return db.query(Favorite).filter(
            Favorite.user_id == user_id,
            Favorite.anime_id == anime_id
        ).first()

    @staticmethod
    def create(
        db: Session,
        user_id: str,
        anime_id: str,
        title: Optional[str] = None,
        image: Optional[str] = None
    ) -> Favorite:
        favorite = Favorite(
            user_id=user_id,
            anime_id=anime_id,
            title=title or "",
            image=image or ""
        )
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
        return favorite

    @staticmethod
    def delete(db: Session, user_id: str, anime_id: str) -> bool:
        favorite = FavoriteService.get_by_user_and_anime(db, user_id, anime_id)
        if favorite:
            db.delete(favorite)
            db.commit()
            return True
        return False
