import os
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Form, Response, Cookie, Query, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.database import get_db
from app.schemas.schemas import Token, UserCreate, UserResponse
from app.services.user_service import UserService
from pydantic import BaseModel

from app.utils.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_oauth_state,
    OAUTH_STATE_COOKIE_NAME,
)


class LoginRequest(BaseModel):
    email: str
    password: str

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

BACKEND_URL = os.getenv("BACKEND_URL")
if not BACKEND_URL:
    raise RuntimeError("BACKEND_URL environment variable is required")
FRONTEND_URL = os.getenv("FRONTEND_URL")
if not FRONTEND_URL:
    raise RuntimeError("FRONTEND_URL environment variable is required")


def _refresh_access_token(response: Response, db: Session, refresh_token: str) -> Optional[User]:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = UserService.get_by_id(db, user_id)
    if not user:
        return None
    new_access = create_access_token(data={"sub": user.id, "email": user.email})
    response.set_cookie(key="access_token", value=new_access, httponly=True, samesite="lax", secure=True, max_age=900)
    return user


def get_current_user(
    response: Response,
    token: Optional[str] = Depends(oauth2_scheme),
    cookie_token: Optional[str] = Cookie(None, alias="access_token"),
    cookie_refresh: Optional[str] = Cookie(None, alias="refresh_token"),
    db: Session = Depends(get_db)
):
    if not token and cookie_token:
        token = cookie_token
    
    if not token:
        if cookie_refresh:
            user = _refresh_access_token(response, db, cookie_refresh)
            if user:
                return user
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не авторизован",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if not payload:
        if cookie_refresh:
            user = _refresh_access_token(response, db, cookie_refresh)
            if user:
                return user
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный или просроченный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительная полезная нагрузка токена",
        )
    user = UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )
    return user


def verify_oauth_state(state: Optional[str], stored_state: Optional[str]) -> bool:
    if not state or not stored_state:
        return False
    return state == stored_state


@router.get("/oauth/google")
def google_oauth(response: Response):
    state = generate_oauth_state()
    response.set_cookie(
        key=OAUTH_STATE_COOKIE_NAME,
        value=state,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=600,
        domain=None
    )
    redirect_uri = f"{BACKEND_URL}/api/auth/oauth/google/callback"
    scope = "openid email profile"
    
    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={os.getenv('GOOGLE_CLIENT_ID')}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline&"
        f"prompt=consent&"
        f"state={state}"
    )
    return {"auth_url": auth_url}


@router.get("/oauth/github")
def github_oauth(response: Response):
    state = generate_oauth_state()
    response.set_cookie(
        key=OAUTH_STATE_COOKIE_NAME,
        value=state,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=600,
        domain=None
    )
    redirect_uri = f"{BACKEND_URL}/api/auth/oauth/github/callback"
    scope = "read:user user:email"
    
    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={os.getenv('GITHUB_CLIENT_ID')}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={scope}&"
        f"state={state}"
    )
    return {"auth_url": auth_url}


@router.get("/oauth/google/callback")
def google_callback(
    response: Response,
    code: str = Query(...),
    state: str = Query(...),
    oauth_state: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    if not verify_oauth_state(state, oauth_state):
        raise HTTPException(status_code=400, detail="Недействительное состояние OAuth")
    
    response.delete_cookie(key=OAUTH_STATE_COOKIE_NAME, domain=None)
    
    try:
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        
        if not google_client_id or not google_client_secret:
            raise HTTPException(status_code=500, detail="Google OAuth не настроен")
        
        token_url = "https://oauth2.googleapis.com/token"
        redirect_uri = f"{BACKEND_URL}/api/auth/oauth/google/callback"
        
        token_data = {
            "client_id": google_client_id,
            "client_secret": google_client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        }
        
        token_response = httpx.post(token_url, data=token_data)
        token_json = token_response.json()
        
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=400, 
                detail=f"Ошибка обмена токена Google: {token_json}"
            )
        
        if "id_token" not in token_json:
            raise HTTPException(
                status_code=400, 
                detail=f"Не удалось получить ID токен Google. Ответ: {token_json}"
            )
        
        id_info = id_token.verify_oauth2_token(
            token_json["id_token"],
            google_requests.Request(),
            google_client_id
        )
        email = id_info.get("email")
        google_id = id_info.get("sub")
        
        if not email:
            raise HTTPException(status_code=400, detail="Нет email в ответе Google")
        
        user = UserService.get_by_email(db, email)
        
        if not user:
            username = email.split("@")[0]
            counter = 1
            base_username = username
            while UserService.get_by_username(db, username):
                username = f"{base_username}{counter}"
                counter += 1
            
            user = UserService.create_oauth_user(
                db,
                email=email,
                username=username,
                provider="google",
                provider_id=str(google_id)
            )
        
        access_token = create_access_token(data={"sub": user.id, "email": user.email})
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=True,
            max_age=900,
            domain=None
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            secure=True,
            max_age=604800,
            domain=None
        )
        
        response.headers["Location"] = f"{FRONTEND_URL}/oauth/callback/google"
        response.status_code = status.HTTP_302_FOUND
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка Google OAuth: {str(e)}")


@router.get("/oauth/github/callback")
def github_callback(
    response: Response,
    code: str = Query(...),
    state: str = Query(...),
    oauth_state: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    if not verify_oauth_state(state, oauth_state):
        raise HTTPException(status_code=400, detail="Недействительное состояние OAuth")
    
    response.delete_cookie(key=OAUTH_STATE_COOKIE_NAME, domain=None)
    
    try:
        github_client_id = os.getenv("GITHUB_CLIENT_ID")
        github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        
        if not github_client_id or not github_client_secret:
            raise HTTPException(status_code=500, detail="GitHub OAuth не настроен")
        
        token_url = "https://github.com/login/oauth/access_token"
        token_data = {
            "client_id": github_client_id,
            "client_secret": github_client_secret,
            "code": code
        }
        headers = {"Accept": "application/json"}
        
        token_response = httpx.post(token_url, data=token_data, headers=headers)
        token_json = token_response.json()
        
        access_token_github = token_json.get("access_token")
        if not access_token_github:
            raise HTTPException(status_code=400, detail="Не удалось получить токен доступа GitHub")
        
        user_headers = {"Authorization": f"token {access_token_github}"}
        user_response = httpx.get("https://api.github.com/user", headers=user_headers)
        github_user = user_response.json()
        
        email_response = httpx.get("https://api.github.com/user/emails", headers=user_headers)
        emails = email_response.json()
        email = next((e["email"] for e in emails if e.get("primary")), None)
        
        if not email:
            raise HTTPException(status_code=400, detail="Нет email от GitHub")
        
        github_id = str(github_user.get("id"))
        github_login = github_user.get("login")
        
        user = UserService.get_by_email(db, email)
        
        if not user:
            username = github_login
            counter = 1
            base_username = username
            while UserService.get_by_username(db, username):
                username = f"{base_username}{counter}"
                counter += 1
            
            user = UserService.create_oauth_user(
                db,
                email=email,
                username=username,
                provider="github",
                provider_id=github_id
            )
        
        access_token_jwt = create_access_token(data={"sub": user.id, "email": user.email})
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        response.set_cookie(
            key="access_token",
            value=access_token_jwt,
            httponly=True,
            samesite="lax",
            secure=True,
            max_age=900,
            domain=None
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            secure=True,
            max_age=604800,
            domain=None
        )
        
        response.headers["Location"] = f"{FRONTEND_URL}/oauth/callback/github"
        response.status_code = status.HTTP_302_FOUND
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка GitHub OAuth: {str(e)}")


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(response: Response, user_data: UserCreate, db: Session = Depends(get_db)):
    if not user_data.terms_accepted or not user_data.privacy_accepted:
        raise HTTPException(
            status_code=400,
            detail="Вы должны принять условия и политику конфиденциальности"
        )
    
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Пароль должен содержать минимум 8 символов"
        )
    
    if UserService.get_by_email(db, user_data.email):
        raise HTTPException(
            status_code=409,
            detail="Email уже зарегистрирован"
        )
    
    if UserService.get_by_username(db, user_data.username):
        raise HTTPException(
            status_code=409,
            detail="Имя пользователя уже занято"
        )
    
    user = UserService.create(db, user_data)
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=900,
        domain=None
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=604800,
        domain=None
    )
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=Token)
def login(response: Response, form_data: LoginRequest, db: Session = Depends(get_db)):
    user = UserService.authenticate(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=900,
        domain=None
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=604800,
        domain=None
    )
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout")
def logout(response: Response, current_user: UserResponse = Depends(get_current_user)):
    response.delete_cookie(key="access_token", domain=None)
    response.delete_cookie(key="refresh_token", domain=None)
    return {"message": "Выход выполнен успешно"}


@router.get("/me")
def get_me(
    response: Response,
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    token = access_token
    
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
    
    if not token:
        if refresh_token:
            user = _refresh_access_token(response, db, refresh_token)
            if user:
                return user
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не авторизован",
        )
    
    payload = decode_token(token)
    if not payload:
        if refresh_token:
            user = _refresh_access_token(response, db, refresh_token)
            if user:
                return user
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный или просроченный токен",
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительная полезная нагрузка токена",
        )
    
    user = UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )
    return user
