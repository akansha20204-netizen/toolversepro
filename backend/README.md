# ToolHub Pro — yt-dlp API (Render, Docker)

Stateless FastAPI service that powers the **YouTube Video Downloader** tool on
the frontend. It uses **yt-dlp + FFmpeg** for real downloads — no third-party
downloader APIs, no database, no Redis, no permanent storage.

## Folder structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py        FastAPI app: /health, /info, /download
│   └── youtube.py     URL validation, format selection, error mapping
├── requirements.txt
├── Dockerfile         Python 3.12 + FFmpeg + yt-dlp
├── .dockerignore
├── render.yaml        Render blueprint (Docker web service)
└── README.md
```

## API

| Method | Path        | Body                                                     | Returns |
| ------ | ----------- | -------------------------------------------------------- | ------- |
| GET    | `/health`   | —                                                        | `{"status":"ok"}` |
| POST   | `/info`     | `{"url":"https://www.youtube.com/watch?v=..."}`           | `{title, thumbnail, duration, uploader, formats[]}` |
| POST   | `/download` | `{"url":"...","quality":"720p","format_id":null,"type":"video"}` | the MP4 / MP3 file |

`quality` must be one of `best`, `2160p`, `1440p`, `1080p`, `720p`, `480p`,
`360p`, `240p`, `144p`, `audio`. `type` is `video` or `audio` (MP3, 192 kbps).

Errors return a JSON body `{"code":"..."}` with codes such as `invalid_url`,
`unsupported_url`, `unavailable`, `private`, `age_restricted`,
`geo_restricted`, `removed`, `too_large`, `timeout`, `processing_failed`,
`rate_limited`, `busy`, `download_failed`. Raw yt-dlp/FFmpeg output, paths and
stack traces are logged server-side only — never returned.

## Render deployment steps

1. Push this repository to GitHub/GitLab.
2. Render dashboard → **New → Web Service** → connect the repo.
3. **Runtime:** Docker. **Root Directory:** `backend`. **Dockerfile path:** `./Dockerfile`.
   (Or use **New → Blueprint** and let Render read `backend/render.yaml`.)
4. **Health check path:** `/health`.
5. Add the environment variables below and click **Create Web Service**.
6. When the build finishes, copy the service URL, e.g.
   `https://toolhub-ytdlp-api.onrender.com`.

Pick at least the Starter instance — the free instance sleeps and has limited
CPU/RAM, which makes 1080p+ merges slow or prone to timeouts.

### Render environment variables

| Variable | Example | Purpose |
| --- | --- | --- |
| `FRONTEND_URL` | `https://toolsforuse.online,https://www.toolsforuse.online` | Allowed browser origins (comma-separated, no trailing slash) |
| `MAX_FILESIZE_MB` | `600` | Hard ceiling for a generated file |
| `DOWNLOAD_TIMEOUT` | `600` | Seconds a single job may run |
| `MAX_CONCURRENT_DOWNLOADS` | `2` | Simultaneous downloads per instance |
| `RATE_LIMIT_PER_MINUTE` | `12` | Requests per client IP per minute |
| `PORT` | set by Render | The app binds `0.0.0.0:$PORT` |

All are optional; the defaults above apply when unset. Localhost origins are
always allowed for development.

### Getting past YouTube's "confirm you're not a bot" check

YouTube challenges requests from datacenter IP ranges, and Render runs in a
datacenter. When that happens the API returns `{"code":"bot_check"}` and the
tool tells the user to try again later. Two supported ways to fix it:

| Variable | Value | Notes |
| --- | --- | --- |
| `YTDLP_COOKIES` | contents of a `cookies.txt` file | Export cookies for `youtube.com` from a signed-in browser (Netscape format) and paste the whole file as the value. Written to a temp file at startup. |
| `YTDLP_COOKIEFILE` | path to a `cookies.txt` | Alternative if you mount the file yourself. |
| `YTDLP_PROXY` | `http://user:pass@host:port` | Route requests through a residential/mobile proxy. |
| `YTDLP_PLAYER_CLIENTS` | `default,web_safari,mweb,tv` | Advanced: which YouTube clients yt-dlp tries, in order. |

Use a throwaway Google account for cookies, never your main one, and refresh
them when downloads start failing again.

## Frontend environment variable

Set this on the frontend (Lovable / your host), no trailing slash:

```
VITE_YTDLP_API_URL=https://toolhub-ytdlp-api.onrender.com
```

The tool then calls `${VITE_YTDLP_API_URL}/health`, `/info` and `/download`.

## Local testing

```bash
cd backend
docker build -t ytdlp-api .
docker run --rm -p 8000:8000 \
  -e FRONTEND_URL=http://localhost:8080 ytdlp-api

curl http://localhost:8000/health
curl -X POST http://localhost:8000/info \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
curl -X POST http://localhost:8000/download \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","quality":"360p","type":"video"}' \
  -o out.mp4
```

Without Docker (FFmpeg must already be installed):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then run the frontend with `VITE_YTDLP_API_URL=http://localhost:8000`.

## Security notes

- yt-dlp is used as a Python library; no shell command is ever built from user input.
- Only single-video YouTube URLs are accepted; the URL is rebuilt from a validated
  11-character video ID, so `?list=` playlists cannot be passed through.
- `quality` and `format_id` are checked against an allow-list / strict regex.
- Downloads run in a per-request temp directory that is deleted after the
  response is streamed; nothing is stored permanently.
- Concurrency semaphore, per-IP rate limit, request timeout and max file size
  are all enforced. No DRM or access-restriction bypass is attempted.

## Keeping yt-dlp fresh

YouTube changes often. Redeploy periodically (Render → Manual Deploy → Clear
build cache & deploy) to pull the newest yt-dlp, or bump the pinned version in
`requirements.txt`.
