from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Favorite


class FavoriteService:
    @staticmethod
    def get_by_user(db: Session, user_id: str, collection_type: Optional[str] = None) -> List[Favorite]:
        q = db.query(Favorite).filter(Favorite.user_id == user_id)
        if collection_type:
            q = q.filter(Favorite.collection_type == collection_type)
        return q.order_by(Favorite.created_at.desc()).all()

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
        image: Optional[str] = None,
        collection_type: Optional[str] = "planned"
    ) -> Favorite:
        favorite = Favorite(
            user_id=user_id,
            anime_id=anime_id,
            title=title or "",
            image=image or "",
            collection_type=collection_type or "planned"
        )
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
        return favorite

    @staticmethod
    def update_type(db: Session, user_id: str, anime_id: str, collection_type: str) -> Optional[Favorite]:
        favorite = FavoriteService.get_by_user_and_anime(db, user_id, anime_id)
        if favorite:
            favorite.collection_type = collection_type
            db.commit()
            db.refresh(favorite)
            return favorite
        return None

    @staticmethod
    def delete(db: Session, user_id: str, anime_id: str) -> bool:
        favorite = FavoriteService.get_by_user_and_anime(db, user_id, anime_id)
        if favorite:
            db.delete(favorite)
            db.commit()
            return True
        return False
