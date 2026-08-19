from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.security import get_current_client
from app.models import power_source as power_source_repo
from app.models import schedule as schedule_repo
from app.schemas.schedule import ScheduleResponse, ScheduleUpdate

router = APIRouter(prefix="/schedules", tags=["schedules"], dependencies=[Depends(get_current_client)])


@router.get("", response_model=ScheduleResponse)
async def get_schedule(
    client_username: str = Depends(get_current_client),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    doc = await schedule_repo.get_schedule(db, client_username)
    if doc is None:
        return {"grid": {}}
    return doc


@router.put("", response_model=ScheduleResponse)
async def put_schedule(
    payload: ScheduleUpdate,
    client_username: str = Depends(get_current_client),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    referenced_ids = {
        power_source_id for hours in payload.grid.values() for power_source_id in hours.values()
    }
    for power_source_id in referenced_ids:
        if await power_source_repo.get_power_source(db, power_source_id) is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Power source with id '{power_source_id}' does not exist",
            )

    return await schedule_repo.upsert_schedule(db, client_username, payload.grid)
