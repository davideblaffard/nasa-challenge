from __future__ import annotations

import logging
from datetime import date, timedelta

import requests
from django.conf import settings

from .models import Asteroid

logger = logging.getLogger(__name__)

NASA_MAX_RANGE_DAYS = 7  # NeoWS hard limit per request


class NeoWSClient:
    BASE_URL = settings.NASA_NEO_BASE_URL

    def __init__(self):
        self.api_key = settings.NASA_API_KEY
        self.session = requests.Session()
        self.session.params = {"api_key": self.api_key}  # type: ignore[assignment]

    def fetch_feed(self, start_date: date, end_date: date) -> dict:
        url = f"{self.BASE_URL}/feed"
        params = {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
        }
        response = self.session.get(url, params=params, timeout=15)
        response.raise_for_status()
        return response.json()


def _parse_neo(neo: dict, approach_date: str) -> dict:
    """Extract flat fields from a raw NeoWS NEO object."""
    estimated = neo["estimated_diameter"]["kilometers"]
    close_approach = next(
        ca for ca in neo["close_approach_data"] if ca["close_approach_date"] == approach_date
    )
    return {
        "nasa_id": neo["id"],
        "name": neo["name"],
        "close_approach_date": approach_date,
        "diameter_min_km": estimated["estimated_diameter_min"],
        "diameter_max_km": estimated["estimated_diameter_max"],
        "velocity_kmh": float(close_approach["relative_velocity"]["kilometers_per_hour"]),
        "miss_distance_km": float(close_approach["miss_distance"]["kilometers"]),
        "is_potentially_hazardous": neo["is_potentially_hazardous_asteroid"],
        "absolute_magnitude": neo.get("absolute_magnitude_h"),
        "nasa_url": neo.get("nasa_jpl_url", ""),
    }


def _split_range(start: date, end: date) -> list[tuple[date, date]]:
    """Split date range into NASA-compliant 7-day chunks."""
    chunks = []
    current = start
    while current <= end:
        chunk_end = min(current + timedelta(days=NASA_MAX_RANGE_DAYS - 1), end)
        chunks.append((current, chunk_end))
        current = chunk_end + timedelta(days=1)
    return chunks


def fetch_and_cache(start_date: date, end_date: date) -> list[Asteroid]:
    """
    Return Asteroids for the given range.
    Fetches missing dates from NASA API and upserts into DB.
    """
    from django.db.models import Q

    existing_dates = set(
        Asteroid.objects.filter(
            close_approach_date__range=(start_date, end_date)
        ).values_list("close_approach_date", flat=True)
    )

    # Build set of all dates in range
    all_dates = {
        start_date + timedelta(days=i)
        for i in range((end_date - start_date).days + 1)
    }
    missing_dates = all_dates - existing_dates

    if missing_dates:
        missing_min = min(missing_dates)
        missing_max = max(missing_dates)
        client = NeoWSClient()

        for chunk_start, chunk_end in _split_range(missing_min, missing_max):
            try:
                data = client.fetch_feed(chunk_start, chunk_end)
            except requests.RequestException as exc:
                logger.error("NeoWS API error: %s", exc)
                continue

            for date_str, neos in data.get("near_earth_objects", {}).items():
                to_upsert = []
                for neo in neos:
                    try:
                        parsed = _parse_neo(neo, date_str)
                        to_upsert.append(Asteroid(**parsed))
                    except (KeyError, StopIteration) as exc:
                        logger.warning("Skip NEO %s: %s", neo.get("id"), exc)

                # Bulk upsert — update all fields except nasa_id (PK)
                update_fields = [
                    f.name for f in Asteroid._meta.get_fields()
                    if hasattr(f, "column") and f.name != "nasa_id"
                ]
                Asteroid.objects.bulk_create(
                    to_upsert,
                    update_conflicts=True,
                    unique_fields=["nasa_id"],
                    update_fields=update_fields,
                )

    return list(
        Asteroid.objects.filter(close_approach_date__range=(start_date, end_date))
    )
