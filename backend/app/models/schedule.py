from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

COLLECTION_NAME = "schedules"


def _collection(db: AsyncIOMotorDatabase):
    return db[COLLECTION_NAME]


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await _collection(db).create_index("client_username", unique=True)


def _grid_to_mongo(grid: dict[int, dict[int, str]]) -> dict[str, dict[str, str]]:
    return {
        str(day): {str(hour): power_source_id for hour, power_source_id in hours.items()}
        for day, hours in grid.items()
    }


async def get_schedule(db: AsyncIOMotorDatabase, client_username: str) -> dict | None:
    return await _collection(db).find_one({"client_username": client_username})


async def upsert_schedule(
    db: AsyncIOMotorDatabase,
    client_username: str,
    grid: dict[int, dict[int, str]],
) -> dict:
    return await _collection(db).find_one_and_update(
        {"client_username": client_username},
        {
            "$set": {
                "client_username": client_username,
                "grid": _grid_to_mongo(grid),
            }
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
