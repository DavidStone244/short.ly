"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the application."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "short.ly"
    app_base_url: str = "http://localhost:8000"
    environment: Literal["development", "staging", "production", "test"] = "development"
    debug: bool = False

    secret_key: str = Field(default="dev-secret-change-me", min_length=8)
    access_token_expire_minutes: int = 60
    jwt_algorithm: str = "HS256"

    database_url: str = "postgresql+asyncpg://shortly:shortly@localhost:5432/shortly"
    redis_url: str | None = "redis://localhost:6379/0"

    rate_limit_per_minute: int = 60
    rate_limit_shorten_per_minute: int = 20

    short_code_min_length: int = 6
    short_code_id_offset: int = 10_000

    cors_origins: list[str] = Field(default_factory=lambda: ["*"])

    @property
    def is_test(self) -> bool:
        return self.environment == "test"


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
