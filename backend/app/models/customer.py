from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.models.common import serialize_doc, to_object_id

COLLECTION_NAME = "customers"


def _collection(db: AsyncIOMotorDatabase):
    return db[COLLECTION_NAME]


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await _collection(db).create_index("service_account_number", unique=True)


async def create_customer(db: AsyncIOMotorDatabase, data: dict) -> dict:
    result = await _collection(db).insert_one(data)
    created = await _collection(db).find_one({"_id": result.inserted_id})
    return serialize_doc(created)


async def list_customers(db: AsyncIOMotorDatabase) -> list[dict]:
    return [serialize_doc(doc) async for doc in _collection(db).find()]


async def get_customer(db: AsyncIOMotorDatabase, customer_id: str) -> dict | None:
    oid = to_object_id(customer_id)
    if oid is None:
        return None
    doc = await _collection(db).find_one({"_id": oid})
    return serialize_doc(doc) if doc else None


async def update_customer(db: AsyncIOMotorDatabase, customer_id: str, data: dict) -> dict | None:
    oid = to_object_id(customer_id)
    if oid is None:
        return None
    if not data:
        return await get_customer(db, customer_id)
    doc = await _collection(db).find_one_and_update(
        {"_id": oid}, {"$set": data}, return_document=ReturnDocument.AFTER
    )
    return serialize_doc(doc) if doc else None


async def delete_customer(db: AsyncIOMotorDatabase, customer_id: str) -> bool:
    oid = to_object_id(customer_id)
    if oid is None:
        return False
    result = await _collection(db).delete_one({"_id": oid})
    return result.deleted_count == 1
