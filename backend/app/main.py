from contextlib import asynccontextmanager
from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from decouple import config

from .cache import get_feed, get_neo_detail
from .database import Base, engine, get_db
from .nasa import NASAAPIError
from .schemas import AsteroidOut, NeoDetail

ALLOWED_ORIGIN = config("ALLOWED_ORIGIN", default="*")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="NASA NEO API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/feed", response_model=list[AsteroidOut])
def feed(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    if start_date > end_date:
        raise HTTPException(400, "start_date deve precedere end_date")
    if (end_date - start_date).days > 365:
        raise HTTPException(400, "Range massimo: 365 giorni")
    try:
        return get_feed(start_date, end_date, db)
    except NASAAPIError as e:
        raise HTTPException(e.status_code, str(e))


@app.get("/api/neo/{nasa_id}", response_model=NeoDetail)
def neo_detail(nasa_id: str, db: Session = Depends(get_db)):
    try:
        result = get_neo_detail(nasa_id, db)
    except NASAAPIError as e:
        raise HTTPException(e.status_code, str(e))
    if not result:
        raise HTTPException(404, "Asteroide non trovato o NASA API non disponibile")
    return result
