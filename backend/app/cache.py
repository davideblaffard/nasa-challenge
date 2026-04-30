import logging
from datetime import date, timedelta

import requests
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from .models import Asteroid, NeoDetailCache
from .nasa import NeoWSClient, parse_neo, split_range

logger = logging.getLogger(__name__)


def get_feed(start_date: date, end_date: date, db: Session) -> list[Asteroid]:
    existing_dates = {
        row[0]
        for row in db.query(Asteroid.close_approach_date)
        .filter(Asteroid.close_approach_date.between(start_date, end_date))
        .distinct()
        .all()
    }

    all_dates = {
        start_date + timedelta(days=i)
        for i in range((end_date - start_date).days + 1)
    }
    missing = all_dates - existing_dates

    if missing:
        client = NeoWSClient()
        missing_min, missing_max = min(missing), max(missing)

        for chunk_start, chunk_end in split_range(missing_min, missing_max):
            try:
                data = client.fetch_feed(chunk_start, chunk_end)
            except requests.RequestException as e:
                logger.error("NASA API error: %s", e)
                continue

            rows = []
            for date_str, neos in data.get("near_earth_objects", {}).items():
                for neo in neos:
                    try:
                        rows.append(parse_neo(neo, date_str))
                    except (KeyError, StopIteration) as e:
                        logger.warning("Skip NEO %s: %s", neo.get("id"), e)

            if rows:
                stmt = pg_insert(Asteroid).values(rows)
                update_cols = {
                    c.name: stmt.excluded[c.name]
                    for c in Asteroid.__table__.columns
                    if c.name not in ("nasa_id", "fetched_at")
                }
                update_cols["fetched_at"] = func.now()
                stmt = stmt.on_conflict_do_update(
                    index_elements=["nasa_id"],
                    set_=update_cols,
                )
                db.execute(stmt)
                db.commit()

    return (
        db.query(Asteroid)
        .filter(Asteroid.close_approach_date.between(start_date, end_date))
        .order_by(Asteroid.close_approach_date, Asteroid.name)
        .all()
    )


def get_neo_detail(nasa_id: str, db: Session) -> dict | None:
    cached = db.get(NeoDetailCache, nasa_id)
    if cached:
        return {"nasa_id": nasa_id, "data": cached.data}

    try:
        client = NeoWSClient()
        data = client.fetch_neo(nasa_id)
        db.merge(NeoDetailCache(nasa_id=nasa_id, data=data))
        db.commit()
        return {"nasa_id": nasa_id, "data": data}
    except requests.RequestException as e:
        logger.error("NASA API error for NEO %s: %s", nasa_id, e)
        return None
