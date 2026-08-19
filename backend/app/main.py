import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import close_mongo_connection, connect_to_mongo, get_database
from app.models.client import ensure_indexes as ensure_client_indexes
from app.models.customer import ensure_indexes as ensure_customer_indexes
from app.models.power_source import ensure_indexes as ensure_power_source_indexes
from app.models.schedule import ensure_indexes as ensure_schedule_indexes
from app.routers import auth, customers, health, power_sources, schedules

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    db = get_database()
    index_jobs = (
        ("clients", ensure_client_indexes),
        ("customers", ensure_customer_indexes),
        ("power_sources", ensure_power_source_indexes),
        ("schedules", ensure_schedule_indexes),
    )
    results = await asyncio.gather(
        *(ensure_fn(db) for _, ensure_fn in index_jobs), return_exceptions=True
    )
    for (label, _), result in zip(index_jobs, results):
        if isinstance(result, Exception):
            logger.warning(
                "Could not create MongoDB indexes for %s at startup (Mongo may be unreachable)",
                label,
                exc_info=result,
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
app.include_router(auth.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(power_sources.router, prefix="/api/v1")
app.include_router(schedules.router, prefix="/api/v1")
