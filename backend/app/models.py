from sqlalchemy import Column, String, Float, Boolean, Date, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base


class Asteroid(Base):
    __tablename__ = "asteroids"

    nasa_id = Column(String(20), primary_key=True)
    name = Column(String(255), nullable=False)
    close_approach_date = Column(Date, nullable=False, index=True)
    diameter_min_km = Column(Float)
    diameter_max_km = Column(Float)
    velocity_kmh = Column(Float)
    miss_distance_km = Column(Float)
    is_potentially_hazardous = Column(Boolean, default=False)
    absolute_magnitude = Column(Float, nullable=True)
    nasa_url = Column(String(500), default="")
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())


class NeoDetailCache(Base):
    __tablename__ = "neo_detail_cache"

    nasa_id = Column(String(20), primary_key=True)
    data = Column(JSON, nullable=False)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
