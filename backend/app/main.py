import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import close_mongo_connection, connect_to_mongo, get_database
from app.models.customer import ensure_indexes as ensure_customer_indexes
from app.models.power_source import ensure_indexes as ensure_power_source_indexes
from app.routers import customers, health, power_sources

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    db = get_database()
    for ensure_fn, label in (
        (ensure_customer_indexes, "customers"),
        (ensure_power_source_indexes, "power_sources"),
    ):
        try:
            await ensure_fn(db)
        except Exception:
            logger.warning(
                "Could not create MongoDB indexes for %s at startup (Mongo may be unreachable)",
                label,
                exc_info=True,
            )
    yield
    close_mongo_connection()


app = FastAPI(title="Power Service Prototype API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(power_sources.router, prefix="/api/v1")
