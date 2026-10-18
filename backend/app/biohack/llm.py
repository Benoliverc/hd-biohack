"""Optional LLM coaching copy on top of deterministic protocol JSON."""
from __future__ import annotations

import json
from typing import Any

import httpx

from ..config import get_settings


SYSTEM = (
    "You are a concise Human Design + wellness coach. "
    "Rewrite the given structured protocol into short, practical coaching copy. "
    "Do not invent new supplements. Do not give medical diagnoses. "
    "Keep under 180 words. Include a one-line disclaimer that this is not medical advice."
)


def maybe_synthesize(protocol: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    if not settings.llm_api_key or not settings.llm_provider:
        return protocol

    provider = settings.llm_provider.lower().strip()
    try:
        text = _call_llm(provider, settings.llm_api_key, protocol)
        protocol = {**protocol, "coaching_copy": text, "source": f"rules+{provider}"}
    except Exception as exc:  # noqa: BLE001
        protocol = {**protocol, "coaching_copy_error": str(exc)}
    return protocol


def _call_llm(provider: str, api_key: str, protocol: dict[str, Any]) -> str:
    user = "Protocol JSON:\n" + json.dumps(protocol, indent=2)[:6000]
    if provider == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}"}
        body = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": user},
            ],
            "temperature": 0.4,
        }
        with httpx.Client(timeout=45) as client:
            r = client.post(url, headers=headers, json=body)
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
    if provider == "anthropic":
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        body = {
            "model": "claude-3-5-haiku-latest",
            "max_tokens": 400,
            "system": SYSTEM,
            "messages": [{"role": "user", "content": user}],
        }
        with httpx.Client(timeout=45) as client:
            r = client.post(url, headers=headers, json=body)
            r.raise_for_status()
            return r.json()["content"][0]["text"]
    if provider == "xai":
        url = "https://api.x.ai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}"}
        body = {
            "model": "grok-2-latest",
            "messages": [
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": user},
            ],
            "temperature": 0.4,
        }
        with httpx.Client(timeout=45) as client:
            r = client.post(url, headers=headers, json=body)
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
    raise ValueError(f"Unknown LLM_PROVIDER: {provider}")
