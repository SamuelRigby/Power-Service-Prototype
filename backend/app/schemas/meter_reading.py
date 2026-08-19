from datetime import datetime

from pydantic import BaseModel


class MeterReadingResponse(BaseModel):
    service_account_number: str
    kwh_reading: float
    reading_timestamp: datetime
