from fastapi import APIRouter, Response, status

from app.core.database import ping_mongo

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(response: Response) -> dict:
    mongo_ok = await ping_mongo()
    if not mongo_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "error", "mongo": "unreachable"}

    return {"status": "ok", "mongo": "connected"}
