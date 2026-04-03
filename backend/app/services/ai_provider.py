from __future__ import annotations

import json
from urllib import error, request

from app.core.config import settings


class AIProviderError(Exception):
    pass


def _chat_completion(system_prompt: str, user_text: str) -> str:
    if not settings.openai_api_key:
        raise AIProviderError("OPENAI_API_KEY is not configured")

    payload = {
        "model": settings.openai_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_text},
        ],
        "temperature": 0.4,
    }

    body = json.dumps(payload).encode("utf-8")
    api_url = f"{settings.openai_base_url.rstrip('/')}/chat/completions"

    req = request.Request(
        api_url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.openai_api_key}",
        },
    )

    try:
        with request.urlopen(req, timeout=45) as response:
            data = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="ignore")
        raise AIProviderError(f"Provider HTTP error: {details or exc.reason}") from exc
    except error.URLError as exc:
        raise AIProviderError(f"Provider connection error: {exc.reason}") from exc

    try:
        return data["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        raise AIProviderError("Invalid provider response format") from exc


def detect_ai_text(text: str) -> str:
    prompt = (
        "You are an AI text detection assistant. Analyze the text and return a concise report with:\n"
        "1) AI-likelihood percentage\n2) Human-likelihood percentage\n3) 3-5 reasoning bullets."
    )
    return _chat_completion(prompt, text)


def paraphrase_text(text: str) -> str:
    prompt = (
        "You are a professional paraphrasing assistant. Rewrite the text with improved clarity and flow, "
        "preserving original meaning. Return only the rewritten text."
    )
    return _chat_completion(prompt, text)


def humanize_text(text: str) -> str:
    prompt = (
        "You are a humanization assistant. Transform robotic, AI-like writing into natural human language "
        "that sounds authentic while preserving meaning. Return only the transformed text."
    )
    return _chat_completion(prompt, text)
