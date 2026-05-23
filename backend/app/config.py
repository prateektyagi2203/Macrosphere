"""Configuration module for MacroSphere backend."""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Database
    database_url: str = "sqlite+aiosqlite:///./macrosphere.db"
    sqlalchemy_echo: bool = False

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_env: str = "development"
    environment: str = "development"
    api_title: str = "MacroSphere API"
    api_version: str = "1.0.0"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4-turbo-preview"
    openai_timeout: int = 30

    # CORS — set CORS_ORIGINS=["*"] in production via env var
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://macrosphere.vercel.app",
        "https://macrosphere-web.onrender.com",
    ]

    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl: int = 300  # 5 minutes

    # Logging
    log_level: str = "INFO"

    class Config:
        """Pydantic settings configuration."""

        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
