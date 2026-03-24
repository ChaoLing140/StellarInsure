from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .routes import auth_router, policies_router

settings = get_settings()

app = FastAPI(title="StellarInsure API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(policies_router)


@app.get("/")
async def root():
    return {"message": "StellarInsure API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
