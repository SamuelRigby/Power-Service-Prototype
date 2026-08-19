from typing import Annotated

from pydantic import BaseModel, Field

Day = Annotated[int, Field(ge=0, le=6)]  # 0 = Sunday, ..., 6 = Saturday
Hour = Annotated[int, Field(ge=0, le=23)]

ScheduleGrid = dict[Day, dict[Hour, str]]


class ScheduleUpdate(BaseModel):
    grid: ScheduleGrid = Field(default_factory=dict)


class ScheduleResponse(BaseModel):
    grid: ScheduleGrid = Field(default_factory=dict)
