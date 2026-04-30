import logging
from datetime import date, timedelta

import requests
from decouple import config

logger = logging.getLogger(__name__)

NASA_BASE_URL = "https://api.nasa.gov/neo/rest/v1"
NASA_MAX_RANGE = 7


class NASAAPIError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        super().__init__(message)


class NeoWSClient:
    def __init__(self):
        self.api_key = config("NASA_API_KEY")
        self.session = requests.Session()
        self.session.params = {"api_key": self.api_key}  # type: ignore[assignment]

    def _check(self, r: requests.Response) -> None:
        if r.status_code == 429:
            raise NASAAPIError(429, "NASA API rate limit raggiunto (500 req/h). Riprova tra qualche minuto.")
        if r.status_code >= 500:
            raise NASAAPIError(r.status_code, f"NASA API non disponibile (HTTP {r.status_code}).")
        r.raise_for_status()

    def fetch_feed(self, start_date: date, end_date: date) -> dict:
        r = self.session.get(
            f"{NASA_BASE_URL}/feed",
            params={
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
            },
            timeout=15,
        )
        self._check(r)
        return r.json()

    def fetch_neo(self, nasa_id: str) -> dict:
        r = self.session.get(f"{NASA_BASE_URL}/neo/{nasa_id}", timeout=15)
        self._check(r)
        return r.json()


# Module-level singleton — one Session pool for all requests
_client: NeoWSClient | None = None


def get_nasa_client() -> NeoWSClient:
    global _client
    if _client is None:
        _client = NeoWSClient()
    return _client


def split_range(start: date, end: date) -> list[tuple[date, date]]:
    chunks = []
    current = start
    while current <= end:
        chunk_end = min(current + timedelta(days=NASA_MAX_RANGE - 1), end)
        chunks.append((current, chunk_end))
        current = chunk_end + timedelta(days=1)
    return chunks


def parse_neo(neo: dict, approach_date: str) -> dict:
    estimated = neo["estimated_diameter"]["kilometers"]
    ca = next(
        c for c in neo["close_approach_data"]
        if c["close_approach_date"] == approach_date
    )
    return {
        "nasa_id": neo["id"],
        "name": neo["name"],
        "close_approach_date": approach_date,
        "diameter_min_km": estimated["estimated_diameter_min"],
        "diameter_max_km": estimated["estimated_diameter_max"],
        "velocity_kmh": float(ca["relative_velocity"]["kilometers_per_hour"]),
        "miss_distance_km": float(ca["miss_distance"]["kilometers"]),
        "is_potentially_hazardous": neo["is_potentially_hazardous_asteroid"],
        "absolute_magnitude": neo.get("absolute_magnitude_h"),
        "nasa_url": neo.get("nasa_jpl_url", ""),
    }
