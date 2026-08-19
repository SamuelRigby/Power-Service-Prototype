from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.core.database import get_database
from app.core.security import get_current_client
from app.core.soap_client import MeterReadingUnavailable, get_meter_reading
from app.models import customer as customer_repo
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from app.schemas.meter_reading import MeterReadingResponse

router = APIRouter(prefix="/customers", tags=["customers"], dependencies=[Depends(get_current_client)])


def _not_found(customer_id: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Customer with id '{customer_id}' not found",
    )


def _conflict(service_account_number: str | None) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"Customer with service account number '{service_account_number}' already exists",
    )


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerCreate,
    client_username: str = Depends(get_current_client),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    data = payload.model_dump()
    data["client_username"] = client_username
    try:
        return await customer_repo.create_customer(db, data)
    except DuplicateKeyError:
        raise _conflict(payload.service_account_number)


@router.get("", response_model=list[CustomerResponse])
async def list_customers(
    client_username: str = Depends(get_current_client),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> list[dict]:
    return await customer_repo.list_customers(db, client_username)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: str,
    client_username: str = Depends(get_current_client),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    customer = await customer_repo.get_customer(db, customer_id, client_username)
    if customer is None:
        raise _not_found(customer_id)
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    payload: CustomerUpdate,
    client_username: str = Depends(get_current_client),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    update_data = payload.model_dump(exclude_unset=True)
    try:
        updated = await customer_repo.update_customer(db, customer_id, client_username, update_data)
    except DuplicateKeyError:
        raise _conflict(update_data.get("service_account_number"))
    if updated is None:
        raise _not_found(customer_id)
    return updated


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    client_username: str = Depends(get_current_client),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> None:
    deleted = await customer_repo.delete_customer(db, customer_id, client_username)
    if not deleted:
        raise _not_found(customer_id)


@router.get("/{customer_id}/meter-reading", response_model=MeterReadingResponse)
async def get_customer_meter_reading(
    customer_id: str,
    client_username: str = Depends(get_current_client),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    customer = await customer_repo.get_customer(db, customer_id, client_username)
    if customer is None:
        raise _not_found(customer_id)
    try:
        return await get_meter_reading(customer["service_account_number"])
    except MeterReadingUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Meter reading service is currently unavailable",
        ) from exc
