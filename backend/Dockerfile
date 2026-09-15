# Production image for the ToolHub Pro yt-dlp API.
# Includes Python 3.12, FastAPI, yt-dlp and FFmpeg.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

# FFmpeg + ffprobe are required by yt-dlp for merging video/audio streams
# and for extracting MP3 audio.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Run as a non-root user; temporary downloads go to /tmp.
RUN useradd --create-home --shell /usr/sbin/nologin appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Render provides $PORT. Single worker keeps memory predictable; concurrency
# is bounded inside the app by a semaphore.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --timeout-keep-alive 75"]
