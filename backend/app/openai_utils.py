import os
import tempfile
import io
from typing import Tuple, List

try:
    from openai import OpenAI
    _OPENAI = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None
except Exception:
    _OPENAI = None

from langdetect import detect

async def transcribe_audio_and_detect(webm_bytes: bytes) -> Tuple[str, str]:
    if not webm_bytes:
        return ("", "en")
    # If OpenAI key present, use gpt-4o-mini-transcribe
    if _OPENAI:
        try:
            with tempfile.NamedTemporaryFile(suffix=".webm", delete=True) as f:
                f.write(webm_bytes)
                f.flush()
                with open(f.name, "rb") as fh:
                    tr = _OPENAI.audio.transcriptions.create(model="gpt-4o-mini-transcribe", file=fh)
                text = getattr(tr, "text", "")
                lang = detect(text) if text.strip() else "en"
                return (text, lang)
        except Exception:
            pass
    # Fallback: no transcription available; return empty transcript English
    return ("", "en")

async def generate_question(context: str, language: str) -> str:
    if _OPENAI:
        try:
            sys = (
                "You are a helpful interview assistant. Ask one concise interview question "
                "based on the candidate's previous answer/context. Respond strictly in the user's language: "
                f"{language}."
            )
            msg = [
                {"role": "system", "content": sys},
                {"role": "user", "content": context or "Ask a general behavioral interview question."},
            ]
            resp = _OPENAI.chat.completions.create(model="gpt-4o-mini", messages=msg, temperature=0.7)
            return resp.choices[0].message.content.strip()
        except Exception:
            pass
    # Fallback stub
    if language.startswith("ar"):
        return "حدثني عن مشروع حديث ساهمت فيه ودورك فيه."
    return "Tell me about a recent project you contributed to and your role."

async def summarize_feedback(transcript: str, language: str) -> Tuple[List[str], dict]:
    if _OPENAI and transcript:
        try:
            sys = (
                "You are an interview coach. Provide 3-5 bullet suggestions focused on delivery (clarity, pacing, tone) "
                "and content (structure, examples). Keep it concise and actionable. Reply in: " + language
            )
            msg = [
                {"role": "system", "content": sys},
                {"role": "user", "content": f"Transcript:\n{transcript}"},
            ]
            resp = _OPENAI.chat.completions.create(model="gpt-4o-mini", messages=msg, temperature=0.3)
            text = resp.choices[0].message.content.strip()
            # naive speech stats from transcript length
            words = len(transcript.split())
            return ([s.strip("- ") for s in text.split("\n") if s.strip()], {"words": words})
        except Exception:
            pass
    # Fallback suggestions
    if language.startswith("ar"):
        return ([
            "حافظ على سرعة حديث متوازنة وتوقفات طبيعية.",
            "استخدم أمثلة محددة لعرض مهاراتك.",
            "حافظ على تواصل بصري ولغة جسد واثقة.",
        ], {"words": len(transcript.split()) if transcript else 0})
    return ([
        "Maintain a steady pace with natural pauses.",
        "Use concrete examples to demonstrate your skills.",
        "Keep confident body language and eye contact.",
    ], {"words": len(transcript.split()) if transcript else 0})
