"""FastAPI application factory."""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api import analysis, market_data, scenarios, simulations
from app.config import get_settings
from app.db.database import close_db, init_db

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging requests and responses."""

    async def dispatch(self, request: Request, call_next):
        """Log request details and execution time."""
        start_time = time.time()
        
        # Log request
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Client: {request.client.host if request.client else 'unknown'}"
        )
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"{request.method} {request.url.path} - "
                f"Status: {response.status_code} - "
                f"Time: {process_time:.3f}s"
            )
            
            response.headers["X-Process-Time"] = str(process_time)
            return response
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"{request.method} {request.url.path} - "
                f"Error: {str(e)} - "
                f"Time: {process_time:.3f}s",
                exc_info=True
            )
            raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    logger.info("=" * 60)
    logger.info("Starting MacroSphere API...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"API Version: {settings.api_version}")
    
    try:
        await init_db()
        logger.info("✓ Database initialized successfully")
    except Exception as e:
        logger.error(f"✗ Database initialization failed: {e}", exc_info=True)
        raise

    yield

    # Shutdown
    logger.info("Shutting down MacroSphere API...")
    try:
        await close_db()
        logger.info("✓ Database connection closed")
    except Exception as e:
        logger.error(f"✗ Database shutdown error: {e}", exc_info=True)
    
    logger.info("=" * 60)


def create_app() -> FastAPI:
    """Create and configure FastAPI application.

    Returns:
        Configured FastAPI app instance
    """
    app = FastAPI(
        title=settings.api_title,
        description="AI-Powered India Macro Allocation Engine",
        version=settings.api_version,
        lifespan=lifespan,
        docs_url="/docs",
        openapi_url="/openapi.json",
    )

    # Add logging middleware
    app.add_middleware(LoggingMiddleware)

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=3600,
    )

    # Add GZIP compression middleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Include routers
    app.include_router(analysis.router)
    app.include_router(market_data.router)
    app.include_router(scenarios.router)
    app.include_router(simulations.router)

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "ok",
            "version": settings.api_version,
            "environment": settings.environment,
        }

    # Root endpoint
    @app.get("/")
    async def root():
        """API documentation and info."""
        return {
            "name": "MacroSphere API",
            "version": settings.api_version,
            "description": "AI-Powered India Macro Allocation Engine",
            "docs": "/docs",
            "redoc": "/redoc",
            "status_check": "/health",
        }

    # Global exception handler for validation errors
    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        """Handle ValueError exceptions."""
        logger.warning(f"Validation error on {request.url.path}: {exc}")
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc), "error_type": "validation_error"},
        )

    # Global exception handler for all other exceptions
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Handle unhandled exceptions."""
        logger.error(
            f"Unhandled exception on {request.url.path}: {exc}",
            exc_info=True
        )
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "error_type": "internal_error",
            },
        )

    return app


app = create_app()
