from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection


def serialize_doc(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


def to_object_id(id_str: str) -> ObjectId | None:
    if not ObjectId.is_valid(id_str):
        return None
    return ObjectId(id_str)


async def drop_stale_unique_index(
    collection: AsyncIOMotorCollection, key: list[tuple[str, int]]
) -> None:
    """
    Drops any existing index on `collection` whose key spec exactly matches `key`.

    Some resources (customers, power sources) originally had a single-field unique
    index (e.g. on just `name`) before per-client ownership was retrofitted and
    uniqueness was rescoped to a compound (client_username, <field>) index instead.
    `create_index` never removes an old index with a different key spec, so on any
    database that's been running since before that change, the stale globally-unique
    index is still silently enforced *alongside* the new compound one - a client can
    fail to create a record whose value is already used by a completely different
    client, even though the app-level query logic is correctly scoped per-client.
    Call this before creating the compound index so ensure_indexes self-heals a
    database left in that pre-migration state, not just a fresh one.
    """
    existing = await collection.index_information()
    for index_name, info in existing.items():
        if index_name != "_id_" and info.get("key") == key:
            await collection.drop_index(index_name)
