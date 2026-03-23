from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import User
from app.utils.auth import get_password_hash, verify_password
from app.schemas.schemas import UserCreate


class UserService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def create(db: Session, user_data: UserCreate) -> User:
        user = User(
            email=user_data.email,
            username=user_data.username,
            password_hash=get_password_hash(user_data.password),
            terms_accepted=user_data.terms_accepted,
            privacy_accepted=user_data.privacy_accepted,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def create_oauth_user(db: Session, email: str, username: str, provider: str, provider_id: str) -> User:
        user = User(
            email=email,
            username=username,
            provider=provider,
            provider_id=provider_id,
            email_verified=True,
            terms_accepted=True,
            privacy_accepted=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        user = UserService.get_by_email(db, email)
        if not user:
            return None
        if not user.password_hash:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def update_profile(
        db: Session,
        user: User,
        username: Optional[str] = None,
        avatar: Optional[str] = None,
        banner: Optional[str] = None,
        bio: Optional[str] = None
    ) -> User:
        if username:
            user.username = username
        if avatar is not None:
            user.avatar = avatar
        if banner is not None:
            user.banner = banner
        if bio is not None:
            user.bio = bio
        db.commit()
        db.refresh(user)
        return user
