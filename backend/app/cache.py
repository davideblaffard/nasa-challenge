import logging
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from .models import Asteroid, NeoDetailCache
from .nasa import NASAAPIError, get_nasa_client, parse_neo, split_range

logger = logging.getLogger(__name__)

NEO_CACHE_TTL_DAYS = 7


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
        client = get_nasa_client()
        missing_min, missing_max = min(missing), max(missing)

        for chunk_start, chunk_end in split_range(missing_min, missing_max):
            try:
                data = client.fetch_feed(chunk_start, chunk_end)
            except NASAAPIError:
                raise  # propagate 429 / 5xx to the endpoint
            except Exception as e:
                logger.error("NASA fetch error for %s–%s: %s", chunk_start, chunk_end, e)
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
    if cached and cached.fetched_at:
        fetched_at = cached.fetched_at.replace(tzinfo=timezone.utc)
        age = datetime.now(timezone.utc) - fetched_at
        if age < timedelta(days=NEO_CACHE_TTL_DAYS):
            return {"nasa_id": nasa_id, "data": cached.data}

    try:
        client = get_nasa_client()
        data = client.fetch_neo(nasa_id)
        stmt = pg_insert(NeoDetailCache).values(nasa_id=nasa_id, data=data)
        stmt = stmt.on_conflict_do_update(
            index_elements=["nasa_id"],
            set_={"data": stmt.excluded.data, "fetched_at": func.now()},
        )
        db.execute(stmt)
        db.commit()
        return {"nasa_id": nasa_id, "data": data}
    except NASAAPIError:
        raise
    except Exception as e:
        logger.error("NASA API error for NEO %s: %s", nasa_id, e)
        return None
