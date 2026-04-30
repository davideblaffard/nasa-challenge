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

COPY compose/local/django/entrypoint.sh /entrypoint.sh
COPY compose/local/django/start.sh /start.sh
RUN chmod +x /entrypoint.sh /start.sh

COPY . .

ENTRYPOINT ["/entrypoint.sh"]
