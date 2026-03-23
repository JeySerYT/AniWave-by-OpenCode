import os
from fastapi import APIRouter, Depends, HTTPException, status, Query, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import Token, UserCreate, UserResponse
from app.services.user_service import UserService
from app.utils.auth import create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
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


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.get("/oauth/google")
def google_oauth():
    redirect_uri = f"{FRONTEND_URL}/oauth/callback/google"
    scope = "openid email profile"
    
    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    return {"auth_url": auth_url}


@router.get("/oauth/github")
def github_oauth():
    redirect_uri = f"{FRONTEND_URL}/oauth/callback/github"
    scope = "read:user user:email"
    
    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={GITHUB_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={scope}"
    )
    return {"auth_url": auth_url}


@router.post("/oauth/google", response_model=Token)
def google_callback(code: str = Form(...), db: Session = Depends(get_db)):
    try:
        import httpx
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        idinfo = id_token.verify_oauth2_token(
            code, 
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email")
        google_id = idinfo.get("sub")
        
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
                provider_id=google_id
            )
        
        access_token = create_access_token(data={"sub": user.id, "email": user.email})
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        return Token(access_token=access_token, refresh_token=refresh_token)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google OAuth failed: {str(e)}")


@router.post("/oauth/github", response_model=Token)
def github_callback(code: str = Form(...), db: Session = Depends(get_db)):
    try:
        import httpx
        
        token_url = "https://github.com/login/oauth/access_token"
        token_data = {
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code
        }
        headers = {"Accept": "application/json"}
        
        response = httpx.post(token_url, data=token_data, headers=headers)
        token_response = response.json()
        
        access_token = token_response.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get GitHub access token")
        
        user_headers = {"Authorization": f"token {access_token}"}
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
        
        access_jwt = create_access_token(data={"sub": user.id, "email": user.email})
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        return Token(access_token=access_jwt, refresh_token=refresh_token)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GitHub OAuth failed: {str(e)}")


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
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
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = UserService.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout")
def logout(current_user: UserResponse = Depends(get_current_user)):
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
