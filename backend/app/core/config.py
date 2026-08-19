from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables (or a .env file)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Mongo
    mongo_uri: str = "mongodb://mongo:27017"
    mongo_db_name: str = "power_service"

    # CORS - comma-separated list of allowed origins for local frontend dev
    cors_origins: str = "http://localhost:3000"

    # JWT auth. jwt_secret_key MUST be overridden (via env/.env) outside local dev.
    jwt_secret_key: str = "insecure-dev-secret-change-me"
    jwt_expiration_hours: int = 24

    # Mock SOAP meter-reading service. It's mounted inside this same app (see main.py),
    # so this must point back at wherever this app is actually reachable from itself.
    soap_meter_reading_url: str = "http://localhost:8000/soap/meter-reading"
    soap_timeout_seconds: float = 5.0

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
