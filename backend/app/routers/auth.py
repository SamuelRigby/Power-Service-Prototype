from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.core.database import get_database
from app.core.security import create_access_token, hash_password, verify_password
from app.models import client as client_repo
from app.schemas.client import ClientLogin, ClientResponse, ClientSignup, Token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: ClientSignup, db: AsyncIOMotorDatabase = Depends(get_database)) -> dict:
    data = {"username": payload.username, "password_hash": hash_password(payload.password)}
    try:
        return await client_repo.create_client(db, data)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{payload.username}' already exists",
        )


@router.post("/login", response_model=Token)
async def login(payload: ClientLogin, db: AsyncIOMotorDatabase = Depends(get_database)) -> dict:
    client = await client_repo.get_client_by_username(db, payload.username)
    if client is None or not verify_password(payload.password, client["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(subject=client["username"])
    return {"access_token": token, "token_type": "bearer"}
