from pydantic import BaseModel, computed_field
from datetime import date
from typing import Optional, Any


class AsteroidOut(BaseModel):
    nasa_id: str
    name: str
    close_approach_date: date
    diameter_min_km: float
    diameter_max_km: float
    velocity_kmh: float
    miss_distance_km: float
    is_potentially_hazardous: bool
    absolute_magnitude: Optional[float] = None
    nasa_url: str = ""

    @computed_field
    @property
    def diameter_avg_m(self) -> float:
        return (self.diameter_min_km + self.diameter_max_km) / 2 * 1000

    model_config = {"from_attributes": True}


class NeoDetail(BaseModel):
    nasa_id: str
    data: dict[str, Any]
