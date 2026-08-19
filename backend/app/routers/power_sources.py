from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.core.database import get_database
from app.core.security import get_current_client
from app.models import power_source as power_source_repo
from app.schemas.power_source import PowerSourceCreate, PowerSourceResponse, PowerSourceUpdate

router = APIRouter(
    prefix="/power-sources", tags=["power-sources"], dependencies=[Depends(get_current_client)]
)


def _not_found(power_source_id: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Power source with id '{power_source_id}' not found",
    )


def _conflict(name: str | None) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"Power source with name '{name}' already exists",
    )


@router.post("", response_model=PowerSourceResponse, status_code=status.HTTP_201_CREATED)
async def create_power_source(
    payload: PowerSourceCreate, db: AsyncIOMotorDatabase = Depends(get_database)
) -> dict:
    try:
        return await power_source_repo.create_power_source(db, payload.model_dump())
    except DuplicateKeyError:
        raise _conflict(payload.name)


@router.get("", response_model=list[PowerSourceResponse])
async def list_power_sources(db: AsyncIOMotorDatabase = Depends(get_database)) -> list[dict]:
    return await power_source_repo.list_power_sources(db)


@router.get("/{power_source_id}", response_model=PowerSourceResponse)
async def get_power_source(
    power_source_id: str, db: AsyncIOMotorDatabase = Depends(get_database)
) -> dict:
    power_source = await power_source_repo.get_power_source(db, power_source_id)
    if power_source is None:
        raise _not_found(power_source_id)
    return power_source


@router.put("/{power_source_id}", response_model=PowerSourceResponse)
async def update_power_source(
    power_source_id: str,
    payload: PowerSourceUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    update_data = payload.model_dump(exclude_unset=True)
    try:
        updated = await power_source_repo.update_power_source(db, power_source_id, update_data)
    except DuplicateKeyError:
        raise _conflict(update_data.get("name"))
    if updated is None:
        raise _not_found(power_source_id)
    return updated


@router.delete("/{power_source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_power_source(
    power_source_id: str, db: AsyncIOMotorDatabase = Depends(get_database)
) -> None:
    deleted = await power_source_repo.delete_power_source(db, power_source_id)
    if not deleted:
        raise _not_found(power_source_id)
