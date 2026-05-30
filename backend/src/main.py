import os
import logging
import time
import json
import uuid
from datetime import datetime
from sqlalchemy import text
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from pythonjsonlogger import jsonlogger
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from .config import get_settings
from .routes import auth_router, policies_router, claims_router, storage_router, webhooks_router, transactions_router
from .errors import StellarInsureError
from .schemas import ErrorResponse
from .database import engine
from .rate_limiter import setup_rate_limiting
from .cache import get_redis_client

settings = get_settings()

tags_metadata = [
    {
        "name": "authentication",
        "description": "Operations for user login, registration, and token management using Stellar wallets.",
    },
    {
        "name": "policies",
        "description": "Manage insurance policies, create new ones, and list existing policies.",
    },
    {
        "name": "claims",
        "description": "Submit and track insurance claims against active policies.",
    },
    {
        "name": "transactions",
        "description": "View transaction history with filtering and pagination support.",
    },
    {
        "name": "storage",
        "description": "Secure access to uploaded proof documents.",
    },
    {
        "name": "webhooks",
        "description": "Manage webhook subscriptions for event notifications.",
    },
]

# Initialize Sentry
if settings.environment == "production" and os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
        ],
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

# Structured Logging Setup
handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    fmt='%(asctime)s %(levelname)s %(name)s %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%SZ'
)
handler.setFormatter(formatter)
root_logger = logging.getLogger()
root_logger.handlers = [handler]
root_logger.setLevel(logging.INFO if settings.environment == "production" else logging.DEBUG)

logger = logging.getLogger("stellar-insure")

app = FastAPI(
    title="StellarInsure API",
    description="""
Automated parametric insurance protocol on Stellar.
    
This API provides endpoints for:
* **Wallet Authentication**: Secure login using Stellar cryptographic signatures.
* **Policy Management**: Creating and tracking insurance policies.
* **Claims Processing**: Submitting claims with automated or manual verification.
* **Secure Storage**: Accessing sensitive proof documents via signed URLs.
    """,
    version="1.0.0",
    openapi_tags=tags_metadata,
)

# Request-Response Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    logger.info("request_started", extra={
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "query_params": str(request.query_params)
    })
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        logger.info("request_finished", extra={
            "request_id": request_id,
            "status_code": response.status_code,
            "duration_ms": int(process_time * 1000)
        })
        
        response.headers["X-Request-Id"] = request_id
        return response
    except Exception as e:
        logger.error("request_failed", extra={
            "request_id": request_id, 
            "error": str(e),
            "exception": type(e).__name__
        })
        raise

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(policies_router)
app.include_router(claims_router)
app.include_router(storage_router)
app.include_router(webhooks_router)
app.include_router(transactions_router)

setup_rate_limiting(app)

@app.get("/health", summary="Health check", description="Checks the health status of the API service and its dependencies.")
async def health():
    health_status = {"status": "healthy", "dependencies": {}}
    
    # Check DB connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            health_status["dependencies"]["database"] = "connected"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["dependencies"]["database"] = f"error: {str(e)}"
    
    # Check Redis when enabled
    if settings.redis_enabled:
        try:
            redis_client = get_redis_client()
            if redis_client is not None:
                redis_client.ping()
                health_status["dependencies"]["redis"] = "connected"
            else:
                health_status["dependencies"]["redis"] = "unhealthy"
                if health_status["status"] != "unhealthy":
                    health_status["status"] = "degraded"
        except Exception as e:
            health_status["dependencies"]["redis"] = f"error: {str(e)}"
            if health_status["status"] != "unhealthy":
                health_status["status"] = "degraded"
    else:
        health_status["dependencies"]["redis"] = "disabled"
        
    return health_status

@app.exception_handler(StellarInsureError)
async def stellar_insure_error_handler(request: Request, exc: StellarInsureError):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=exc.error_code,
            detail=exc.detail
        ).model_dump(mode="json")
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error_code=f"HTTP_{exc.status_code}",
            detail=exc.detail
        ).model_dump(mode="json")
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Format validation errors in a structured way
    errors = exc.errors()
    formatted_errors = []
    for error in errors:
        formatted_errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "VAL_001",
            "detail": "Request validation failed",
            "errors": formatted_errors,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.get("/", summary="Root endpoint", description="Returns a simple welcome message.")
async def root():
    return {"message": "Welcome to StellarInsure API"}
