from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.common import serialize_doc

COLLECTION_NAME = "clients"


def _collection(db: AsyncIOMotorDatabase):
    return db[COLLECTION_NAME]


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await _collection(db).create_index("username", unique=True)


async def create_client(db: AsyncIOMotorDatabase, data: dict) -> dict:
    result = await _collection(db).insert_one(data)
    created = await _collection(db).find_one({"_id": result.inserted_id})
    return serialize_doc(created)


async def get_client_by_username(db: AsyncIOMotorDatabase, username: str) -> dict | None:
    doc = await _collection(db).find_one({"username": username})
    return serialize_doc(doc) if doc else None
