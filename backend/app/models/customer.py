from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.models.common import drop_stale_unique_index, serialize_doc, to_object_id

COLLECTION_NAME = "customers"


def _collection(db: AsyncIOMotorDatabase):
    return db[COLLECTION_NAME]


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    collection = _collection(db)
    await drop_stale_unique_index(collection, [("service_account_number", 1)])
    await collection.create_index(
        [("client_username", 1), ("service_account_number", 1)], unique=True
    )


async def create_customer(db: AsyncIOMotorDatabase, data: dict) -> dict:
    result = await _collection(db).insert_one(data)
    created = await _collection(db).find_one({"_id": result.inserted_id})
    return serialize_doc(created)


async def list_customers(db: AsyncIOMotorDatabase, client_username: str) -> list[dict]:
    return [
        serialize_doc(doc)
        async for doc in _collection(db).find({"client_username": client_username})
    ]


async def get_customer(
    db: AsyncIOMotorDatabase, customer_id: str, client_username: str
) -> dict | None:
    oid = to_object_id(customer_id)
    if oid is None:
        return None
    doc = await _collection(db).find_one({"_id": oid, "client_username": client_username})
    return serialize_doc(doc) if doc else None


async def update_customer(
    db: AsyncIOMotorDatabase, customer_id: str, client_username: str, data: dict
) -> dict | None:
    oid = to_object_id(customer_id)
    if oid is None:
        return None
    if not data:
        return await get_customer(db, customer_id, client_username)
    doc = await _collection(db).find_one_and_update(
        {"_id": oid, "client_username": client_username},
        {"$set": data},
        return_document=ReturnDocument.AFTER,
    )
    return serialize_doc(doc) if doc else None


async def delete_customer(db: AsyncIOMotorDatabase, customer_id: str, client_username: str) -> bool:
    oid = to_object_id(customer_id)
    if oid is None:
        return False
    result = await _collection(db).delete_one({"_id": oid, "client_username": client_username})
    return result.deleted_count == 1
