from enum import Enum

from pydantic import BaseModel


class PowerType(str, Enum):
    WIND = "wind"
    HYDRO = "hydro"
    SOLAR = "solar"
    GEOTHERMAL = "geothermal"
    NATURAL_GAS = "natural gas"
    COAL = "coal"
    NUCLEAR = "nuclear"
    WASTE_HEAT = "waste heat"


class PowerSourceBase(BaseModel):
    name: str
    power_type: PowerType
    instantaneous_output_mw: float
    actual_output_mwh: float


class PowerSourceCreate(PowerSourceBase):
    pass


class PowerSourceUpdate(BaseModel):
    name: str | None = None
    power_type: PowerType | None = None
    instantaneous_output_mw: float | None = None
    actual_output_mwh: float | None = None


class PowerSourceResponse(PowerSourceBase):
    id: str
