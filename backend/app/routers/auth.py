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
from app.utils.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_oauth_state,
    OAUTH_STATE_COOKIE_NAME,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8081")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    cookie_token: Optional[str] = Cookie(None, alias="access_token"),
    db: Session = Depends(get_db)
):
    if not token and cookie_token:
        token = cookie_token
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    user = UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
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
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    
    response.delete_cookie(key=OAUTH_STATE_COOKIE_NAME, domain=None)
    
    try:
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        
        if not google_client_id or not google_client_secret:
            raise HTTPException(status_code=500, detail="Google OAuth not configured")
        
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
                detail=f"Google token exchange failed: {token_json}"
            )
        
        if "id_token" not in token_json:
            raise HTTPException(
                status_code=400, 
                detail=f"Failed to get Google ID token. Response: {token_json}"
            )
        
        access_token_google = token_json.get("access_token")
        
        userinfo_response = httpx.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token_google}"}
        )
        userinfo = userinfo_response.json()
        
        email = userinfo.get("email")
        google_id = userinfo.get("sub")
        
        if not email:
            raise HTTPException(status_code=400, detail="No email in Google response")
        
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
            max_age=900,
            domain=None
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            max_age=604800,
            domain=None
        )
        
        response.headers["Location"] = f"{FRONTEND_URL}/profile?logged_in=true"
        response.status_code = status.HTTP_302_FOUND
        return response
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google OAuth failed: {str(e)}")


@router.get("/oauth/github/callback")
def github_callback(
    response: Response,
    code: str = Query(...),
    state: str = Query(...),
    oauth_state: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
):
    if not verify_oauth_state(state, oauth_state):
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    
    response.delete_cookie(key=OAUTH_STATE_COOKIE_NAME, domain=None)
    
    try:
        github_client_id = os.getenv("GITHUB_CLIENT_ID")
        github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        
        if not github_client_id or not github_client_secret:
            raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
        
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
            raise HTTPException(status_code=400, detail="Failed to get GitHub access token")
        
        user_headers = {"Authorization": f"token {access_token_github}"}
        user_response = httpx.get("https://api.github.com/user", headers=user_headers)
        github_user = user_response.json()
        
        email_response = httpx.get("https://api.github.com/user/emails", headers=user_headers)
        emails = email_response.json()
        email = next((e["email"] for e in emails if e.get("primary")), None)
        
        if not email:
            raise HTTPException(status_code=400, detail="No email from GitHub")
        
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
            max_age=900,
            domain=None
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            max_age=604800,
            domain=None
        )
        
        response.headers["Location"] = f"{FRONTEND_URL}/profile?logged_in=true"
        response.status_code = status.HTTP_302_FOUND
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GitHub OAuth failed: {str(e)}")


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(response: Response, user_data: UserCreate, db: Session = Depends(get_db)):
    if not user_data.terms_accepted or not user_data.privacy_accepted:
        raise HTTPException(
            status_code=400,
            detail="You must accept terms and privacy policy"
        )
    
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )
    
    if UserService.get_by_email(db, user_data.email):
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )
    
    if UserService.get_by_username(db, user_data.username):
        raise HTTPException(
            status_code=409,
            detail="Username already taken"
        )
    
    user = UserService.create(db, user_data)
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=900,
        domain=None
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=604800,
        domain=None
    )
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=Token)
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = UserService.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=900,
        domain=None
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=604800,
        domain=None
    )
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout")
def logout(response: Response, current_user: UserResponse = Depends(get_current_user)):
    response.delete_cookie(key="access_token", domain=None)
    response.delete_cookie(key="refresh_token", domain=None)
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(
    access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    token = access_token
    
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        user = UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        return user
    finally:
        db.close()
