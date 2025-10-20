import os
import io
import base64
import tempfile
from typing import Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langdetect import detect, DetectorFactory

from .openai_utils import generate_question, summarize_feedback, transcribe_audio_and_detect

DetectorFactory.seed = 0

app = FastAPI(title="AI Interview Backend")

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (simple demo)
sessions: Dict[str, Dict[str, Any]] = {}

class SessionCreate(BaseModel):
    jobTitle: str | None = None

class SessionOut(BaseModel):
    sessionId: str
    wsUrl: str

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/sessions", response_model=SessionOut)
async def create_session(_: SessionCreate):
    import uuid
    sid = str(uuid.uuid4())
    sessions[sid] = {
        "audio_chunks": [],  # webm/opus chunks (bytes)
        "lang": "en",
        "transcript": "",
    }
    ws_url = f"/ws/{sid}"
    return SessionOut(sessionId=sid, wsUrl=ws_url)

@app.post("/sessions/{session_id}/next-question")
async def next_question(session_id: str, body: Dict[str, Any] = Body(...)):
    sess = sessions.get(session_id)
    if not sess:
        return {"error": "not_found"}
    context = body.get("context") or ""
    preferred_lang = body.get("lang") or sess.get("lang", "en")
    q = await generate_question(context=context, language=preferred_lang)
    return {"question": q, "lang": preferred_lang}

@app.get("/sessions/{session_id}/report")
async def report(session_id: str):
    sess = sessions.get(session_id)
    if not sess:
        return {"error": "not_found"}
    return {
        "sessionId": session_id,
        "lang": sess.get("lang", "en"),
        "transcript": sess.get("transcript", ""),
        "speech": sess.get("speech", {}),
        "vision": sess.get("vision", {}),
        "suggestions": sess.get("suggestions", []),
    }

@app.websocket("/ws/{session_id}")
async def ws(session: WebSocket, session_id: str):
    await session.accept()
    sess = sessions.get(session_id)
    if not sess:
        await session.send_json({"t": "error", "message": "session not found"})
        await session.close()
        return

    # rolling metrics for demo
    rolling_level = 0.0
    words_spoken_est = 0

    try:
        while True:
            msg = await session.receive_json()
            t = msg.get("t")
            if t == "hello":
                await session.send_json({"t": "ack", "sessionId": session_id})
            elif t == "audio":
                # base64 webm/opus chunk
                b64 = msg.get("data", "")
                try:
                    raw = base64.b64decode(b64)
                    sess["audio_chunks"].append(raw)
                    # naive real-time metric: approximate level by chunk size
                    size_kb = len(raw) / 1024.0
                    rolling_level = 0.8 * rolling_level + 0.2 * min(size_kb / 16.0, 1.0)
                    # naive words estimate
                    words_spoken_est += int(size_kb / 2.5)
                except Exception:
                    pass
                await session.send_json({"t": "metrics", "speech_level": round(rolling_level, 3), "wpm_est": words_spoken_est})
            elif t == "landmarks":
                # placeholders for vision metrics
                await session.send_json({"t": "metrics", "eye_contact": 0.7, "posture": 0.8})
            elif t == "end":
                # finalize: join chunks -> transcribe -> detect language -> summarize
                webm_bytes = b"".join(sess.get("audio_chunks", []))
                transcript, lang = await transcribe_audio_and_detect(webm_bytes)
                sess["transcript"] = transcript
                sess["lang"] = lang
                # produce suggestions
                suggestions, speech_stats = await summarize_feedback(transcript=transcript, language=lang)
                sess["suggestions"] = suggestions
                sess["speech"] = speech_stats
                await session.send_json({"t": "final_report_ready", "lang": lang})
                await session.close()
                break
    except WebSocketDisconnect:
        # client disconnected; keep partial data
        return
