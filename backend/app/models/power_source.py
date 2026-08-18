from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.models.common import serialize_doc, to_object_id

COLLECTION_NAME = "power_sources"


def _collection(db: AsyncIOMotorDatabase):
    return db[COLLECTION_NAME]


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await _collection(db).create_index("name", unique=True)


async def create_power_source(db: AsyncIOMotorDatabase, data: dict) -> dict:
    result = await _collection(db).insert_one(data)
    created = await _collection(db).find_one({"_id": result.inserted_id})
    return serialize_doc(created)


async def list_power_sources(db: AsyncIOMotorDatabase) -> list[dict]:
    return [serialize_doc(doc) async for doc in _collection(db).find()]


async def get_power_source(db: AsyncIOMotorDatabase, power_source_id: str) -> dict | None:
    oid = to_object_id(power_source_id)
    if oid is None:
        return None
    doc = await _collection(db).find_one({"_id": oid})
    return serialize_doc(doc) if doc else None


async def update_power_source(db: AsyncIOMotorDatabase, power_source_id: str, data: dict) -> dict | None:
    oid = to_object_id(power_source_id)
    if oid is None:
        return None
    if not data:
        return await get_power_source(db, power_source_id)
    doc = await _collection(db).find_one_and_update(
        {"_id": oid}, {"$set": data}, return_document=ReturnDocument.AFTER
    )
    return serialize_doc(doc) if doc else None


async def delete_power_source(db: AsyncIOMotorDatabase, power_source_id: str) -> bool:
    oid = to_object_id(power_source_id)
    if oid is None:
        return False
    result = await _collection(db).delete_one({"_id": oid})
    return result.deleted_count == 1
