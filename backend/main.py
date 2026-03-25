import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

load_dotenv()

limiter = Limiter(key_func=get_remote_address)

from app.database import engine
from app.models.models import Base
from app.routers import auth, profile, shikimori


@limiter.limit("30/minute")
async def slowapi_default(request: Request):
    pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AniWave API",
    description="Backend API for AniWave anime tracking platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)
app.state.limiter = limiter

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8081")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, BACKEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(
    status_code=429,
    content={"error": "Too many requests. Please try again later."}
))

app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(shikimori.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "AniWave API", "status": "running"}


@app.get("/docs")
def docs():
    return RedirectResponse(url="/docs/")


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8081))
    uvicorn.run(app, host="0.0.0.0", port=port)
