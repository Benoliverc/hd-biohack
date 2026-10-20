# HD Biohack API — Railway / container image
# Build context: backend/ (set Railway Root Directory to `backend`)
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000 \
    SQLITE_PATH=/data/hd_biohack.db

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . .

# Ephemeris files are gitignored; download at build time
RUN chmod +x scripts/download_ephemeris.sh \
    && ./scripts/download_ephemeris.sh

# Persist SQLite (and optional uploads) on a Railway volume mounted at /data
RUN mkdir -p /data

EXPOSE 8000

# Railway injects PORT; healthcheck path is /health
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
