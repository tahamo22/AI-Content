# AI Interview Platform (Next.js + FastAPI)

An AI-powered mock interview platform with live audio/video, real-time feedback, WebSocket/WebRTC, and bilingual support (English + Arabic).

## Features
- Live camera and microphone capture (WebRTC)
- Real-time feedback via WebSocket (speaking level, pace, posture/gaze placeholders)
- Interview session flow with start/stop controls
- Question generation and final feedback using OpenAI (with Arabic/English support)
- Automatic language detection and response in the same language
- Next.js + TailwindCSS frontend
- FastAPI backend with session management

## Monorepo structure
```
frontend/   # Next.js + TS + Tailwind
backend/    # FastAPI + OpenAI + langdetect
```

## Prerequisites
- Node.js 18+
- Python 3.10+
- ffmpeg (for audio/webm handling on backend)
- An OpenAI API key (optional: required for question generation and transcription)

## Quick Start

### 1) Backend
```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Copy env
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=... (or leave empty to use stubbed responses)

# Run
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2) Frontend
```
cd frontend
npm install

# Copy env
cp .env.example .env.local
# Make sure BACKEND_URL matches backend (e.g., http://localhost:8000)

npm run dev
```

Open http://localhost:3000 and start an interview.

## Environment Variables

### Frontend (.env.local)
- BACKEND_URL=http://localhost:8000

### Backend (.env)
- OPENAI_API_KEY=your_key_here (optional)
- ALLOW_RECORDING=true|false (default false)

## Notes on Language Support
- Backend detects language from the transcript via `langdetect`.
- If Arabic is detected, the model is prompted to respond in Arabic; otherwise English.
- When OpenAI is not configured, stubbed logic returns basic questions and feedback in the detected language.

## Security and Privacy
- This demo stores sessions in-memory for simplicity. Add Postgres/S3 for production.
- Recording upload is disabled by default; enable only with user consent.

## Scripts
- Backend: `uvicorn app.main:app --reload`
- Frontend: `npm run dev`

## License
MIT
