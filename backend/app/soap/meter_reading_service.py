"""Mock SOAP service simulating a legacy meter-reading system.

There's no real backing store: GetMeterReading returns a plausible reading
derived deterministically from the service account number (so the same
account always lands in the same realistic range) plus a small amount of
jitter, so it doesn't look like a canned constant.
"""

import hashlib
import random
from datetime import datetime, timezone
from decimal import Decimal as PyDecimal

from spyne import Application, ComplexModel, DateTime, Decimal, ServiceBase, Unicode, rpc
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication


class MeterReading(ComplexModel):
    service_account_number = Unicode
    kwh_reading = Decimal(fraction_digits=2)
    reading_timestamp = DateTime


def _simulate_reading(service_account_number: str) -> PyDecimal:
    seed = int(hashlib.sha256(service_account_number.encode("utf-8")).hexdigest(), 16)
    baseline = random.Random(seed).uniform(500.0, 5000.0)
    # Unseeded, so this varies call to call even for the same account - a real meter
    # reading isn't a fixed constant.
    jitter = random.uniform(-2.0, 2.0)
    return PyDecimal(str(round(baseline + jitter, 2)))


class MeterReadingService(ServiceBase):
    @rpc(Unicode, _returns=MeterReading)
    def GetMeterReading(ctx, service_account_number):
        reading = MeterReading()
        reading.service_account_number = service_account_number
        reading.kwh_reading = _simulate_reading(service_account_number)
        reading.reading_timestamp = datetime.now(timezone.utc)
        return reading


soap_application = Application(
    [MeterReadingService],
    tns="http://power-service-prototype/soap/meter-reading",
    in_protocol=Soap11(validator="lxml"),
    out_protocol=Soap11(),
)

wsgi_app = WsgiApplication(soap_application)
