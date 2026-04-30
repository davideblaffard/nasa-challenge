FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY compose/production/django/entrypoint.sh /entrypoint.sh
COPY compose/production/django/start.sh /start.sh
RUN chmod +x /entrypoint.sh /start.sh

COPY . .

RUN python manage.py collectstatic --noinput

ENTRYPOINT ["/entrypoint.sh"]
