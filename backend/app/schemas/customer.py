from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class PaymentRecord(BaseModel):
    date: datetime
    amount: float

    @field_validator("amount")
    @classmethod
    def round_amount(cls, v: float) -> float:
        return round(v, 2)


class CustomerBase(BaseModel):
    service_account_number: str
    zip_code: str
    state: str
    city: str
    street_address: str
    kwh_consumed_current_cycle: float = 0.0
    lifetime_kwh_consumed: float = 0.0
    payment_history: list[PaymentRecord] = Field(default_factory=list)
    total_overdue_payment: float = 0.0

    @field_validator("total_overdue_payment")
    @classmethod
    def round_overdue(cls, v: float) -> float:
        return round(v, 2)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    service_account_number: str | None = None
    zip_code: str | None = None
    state: str | None = None
    city: str | None = None
    street_address: str | None = None
    kwh_consumed_current_cycle: float | None = None
    lifetime_kwh_consumed: float | None = None
    payment_history: list[PaymentRecord] | None = None
    total_overdue_payment: float | None = None

    @field_validator("total_overdue_payment")
    @classmethod
    def round_overdue(cls, v: float | None) -> float | None:
        return v if v is None else round(v, 2)


class CustomerResponse(CustomerBase):
    id: str
