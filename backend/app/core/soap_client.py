import asyncio
from functools import lru_cache

import zeep
from zeep.exceptions import Error as ZeepError

from app.core.config import settings


class MeterReadingUnavailable(Exception):
    """Raised when the mock SOAP meter-reading service can't be reached or fails."""


@lru_cache(maxsize=1)
def _get_client() -> zeep.Client:
    return zeep.Client(f"{settings.soap_meter_reading_url}?wsdl")


def _call_get_meter_reading(service_account_number: str) -> dict:
    result = _get_client().service.GetMeterReading(service_account_number)
    return {
        "service_account_number": result.service_account_number,
        "kwh_reading": float(result.kwh_reading),
        "reading_timestamp": result.reading_timestamp,
    }


async def get_meter_reading(service_account_number: str) -> dict:
    """Calls the mock SOAP service off the event loop (zeep is sync), with a timeout."""
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_call_get_meter_reading, service_account_number),
            timeout=settings.soap_timeout_seconds,
        )
    except asyncio.TimeoutError as exc:
        raise MeterReadingUnavailable("Meter reading service timed out") from exc
    except ZeepError as exc:
        raise MeterReadingUnavailable(f"Meter reading service returned an error: {exc}") from exc
    except Exception as exc:
        raise MeterReadingUnavailable("Meter reading service is unreachable") from exc
