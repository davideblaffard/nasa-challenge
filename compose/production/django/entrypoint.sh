#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
until python -c "
import sys
import psycopg2
import os
try:
    psycopg2.connect(
        dbname=os.environ['POSTGRES_DB'],
        user=os.environ['POSTGRES_USER'],
        password=os.environ['POSTGRES_PASSWORD'],
        host=os.environ['POSTGRES_HOST'],
        port=os.environ.get('POSTGRES_PORT', '5432'),
    )
except psycopg2.OperationalError:
    sys.exit(1)
"; do
  echo "PostgreSQL unavailable - sleeping 1s"
  sleep 1
done

echo "PostgreSQL ready."

python manage.py migrate --noinput

exec "$@"
