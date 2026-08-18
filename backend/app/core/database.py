from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


class Mongo:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None


mongo = Mongo()


def connect_to_mongo() -> None:
    mongo.client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
    mongo.db = mongo.client[settings.mongo_db_name]


def close_mongo_connection() -> None:
    if mongo.client is not None:
        mongo.client.close()


def get_database() -> AsyncIOMotorDatabase:
    return mongo.db


async def ping_mongo() -> bool:
    try:
        await mongo.client.admin.command("ping")
        return True
    except Exception:
        return False
