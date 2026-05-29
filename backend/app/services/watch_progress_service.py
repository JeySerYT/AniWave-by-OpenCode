from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import WatchProgress


class WatchProgressService:
    @staticmethod
    def get_by_user(db: Session, user_id: str) -> List[WatchProgress]:
        return db.query(WatchProgress).filter(
            WatchProgress.user_id == user_id
        ).order_by(WatchProgress.updated_at.desc()).all()

    @staticmethod
    def get_by_user_and_anime(db: Session, user_id: str, anime_id: str) -> Optional[WatchProgress]:
        return db.query(WatchProgress).filter(
            WatchProgress.user_id == user_id,
            WatchProgress.anime_id == anime_id
        ).first()

    @staticmethod
    def upsert(
        db: Session,
        user_id: str,
        anime_id: str,
        title: Optional[str] = None,
        poster: Optional[str] = None,
        episode: Optional[str] = "1",
        episodes_total: Optional[str] = "",
        genres: Optional[str] = "[]"
    ) -> WatchProgress:
        existing = WatchProgressService.get_by_user_and_anime(db, user_id, anime_id)
        if existing:
            existing.episode = episode or existing.episode
            existing.episodes_total = episodes_total or existing.episodes_total
            existing.title = title or existing.title
            existing.poster = poster or existing.poster
            existing.genres = genres or existing.genres
            existing.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            progress = WatchProgress(
                user_id=user_id,
                anime_id=anime_id,
                title=title or "",
                poster=poster or "",
                episode=episode or "1",
                episodes_total=episodes_total or "",
                genres=genres or "[]"
            )
            db.add(progress)
            db.commit()
            db.refresh(progress)
            return progress

    @staticmethod
    def delete(db: Session, user_id: str, anime_id: str) -> bool:
        progress = WatchProgressService.get_by_user_and_anime(db, user_id, anime_id)
        if progress:
            db.delete(progress)
            db.commit()
            return True
        return False
