import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    avatar = Column(Text, default="")
    banner = Column(Text, default="")
    bio = Column(String(500), default="")
    provider = Column(String(20), default="email")
    provider_id = Column(String(255), default="")
    email_verified = Column(Boolean, default=False)
    terms_accepted = Column(Boolean, default=False)
    privacy_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    watch_progress = relationship("WatchProgress", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"


class WatchProgress(Base):
    __tablename__ = "watch_progress"
    __table_args__ = (
        UniqueConstraint('user_id', 'anime_id', name='uq_watch_progress_user_anime'),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    anime_id = Column(String, nullable=False)
    title = Column(String(255), default="")
    poster = Column(String(500), default="")
    episode = Column(String, default="1")
    episodes_total = Column(String, default="")
    genres = Column(String(500), default="[]")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="watch_progress")

    def __repr__(self):
        return f"<WatchProgress {self.anime_id} for user {self.user_id}>"


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    anime_id = Column(String, nullable=False)
    title = Column(String(255), default="")
    image = Column(String(500), default="")
    collection_type = Column(String(20), default="planned")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="favorites")

    def __repr__(self):
        return f"<Favorite {self.anime_id} for user {self.user_id} ({self.collection_type})>"
