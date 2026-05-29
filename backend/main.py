import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy import text
from sqlalchemy.orm import Session

load_dotenv()

limiter = Limiter(key_func=get_remote_address)

from app.database import engine, get_db
from app.models.models import Base
from app.routers import auth, profile



@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_event_loop()
    executor = ThreadPoolExecutor()
    try:
        await loop.run_in_executor(executor, Base.metadata.create_all, engine)
        yield
    finally:
        executor.shutdown(wait=True)


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


@app.get("/")
def root():
    return {"message": "AniWave API", "status": "running"}



@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unhealthy: {e}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8081))
    uvicorn.run(app, host="0.0.0.0", port=port)
