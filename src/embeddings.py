from __future__ import annotations

import hashlib
import json
import math
import os
import re
import threading
import time
from urllib.error import HTTPError
from urllib import request

from dotenv import load_dotenv

# Multilingual model suitable for the Vietnamese corpora used in this Lab.
# The local backend remains optional; required checkpoints use MockEmbedder.
LOCAL_EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"
VOYAGE_EMBEDDING_MODEL = "voyage-4-lite"
FPT_EMBEDDING_MODEL = "Vietnamese_Embedding"
EMBEDDING_PROVIDER_ENV = "EMBEDDING_PROVIDER"
VOYAGE_RATE_LIMIT_TPM = 10000
VOYAGE_RATE_LIMIT_RPM = 3


EMBEDDING_ENDPOINTS = {
    "voyage": ("https://api.voyageai.com/v1/embeddings", "VOYAGE_API_KEY"),
    "fpt": ("https://mkp-api.fptcloud.com/v1/embeddings", "FPT_API_KEY"),
}


class MockEmbedder:
    """Deterministic embedding backend used by tests and default classroom runs."""

    def __init__(self, dim: int = 64) -> None:
        self.dim = dim
        self._backend_name = "mock embeddings fallback"

    def __call__(self, text: str) -> list[float]:
        digest = hashlib.md5(text.encode()).hexdigest()
        seed = int(digest, 16)
        vector = []
        for _ in range(self.dim):
            seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
            vector.append((seed / 0xFFFFFFFF) * 2 - 1)
        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]


class LocalEmbedder:
    """Sentence Transformers-backed local embedder."""

    def __init__(self, model_name: str = LOCAL_EMBEDDING_MODEL) -> None:
        from sentence_transformers import SentenceTransformer

        self.model_name = model_name
        self._backend_name = model_name
        self.model = SentenceTransformer(model_name)

    def __call__(self, text: str) -> list[float]:
        embedding = self.model.encode(text, normalize_embeddings=True)
        if hasattr(embedding, "tolist"):
            return embedding.tolist()
        return [float(value) for value in embedding]


class OpenAIEmbedder:
    """OpenAI embeddings API-backed embedder."""

    def __init__(self, model_name: str = OPENAI_EMBEDDING_MODEL) -> None:
        from openai import OpenAI

        self.model_name = model_name
        self._backend_name = model_name
        self.client = OpenAI()

    def __call__(self, text: str) -> list[float]:
        response = self.client.embeddings.create(model=self.model_name, input=text)
        return [float(value) for value in response.data[0].embedding]


class RequestEmbedder:
    """HTTP embedding client. Starts with Voyage; add providers by extending EMBEDDING_ENDPOINTS."""

    # ponytail: process-local throttle; use a shared queue if multiple backend workers matter.
    _global_lock = threading.Lock()
    _global_request_times: dict[tuple[str, str], list[float]] = {}
    _global_token_windows: dict[tuple[str, str], tuple[float, int]] = {}

    def __init__(
        self,
        provider: str = "voyage",
        model_name: str = VOYAGE_EMBEDDING_MODEL,
        api_key: str | None = None,
        input_type: str | None = None,
        output_dimension: int | None = None,
        rate_limit_tpm: int = VOYAGE_RATE_LIMIT_TPM,
        rate_limit_rpm: int = VOYAGE_RATE_LIMIT_RPM,
        timeout: int = 30,
        urlopen=request.urlopen,
    ) -> None:
        load_dotenv(dotenv_path=".env", override=False)
        if provider not in EMBEDDING_ENDPOINTS:
            raise ValueError(f"unknown embedding provider: {provider}")
        endpoint, env_key = EMBEDDING_ENDPOINTS[provider]
        self.provider = provider
        self.model_name = model_name
        self.api_key = api_key or os.getenv(env_key)
        if not self.api_key:
            raise ValueError(f"missing API key; pass api_key or set {env_key}")
        self.input_type = input_type
        self.output_dimension = output_dimension
        self.rate_limit_tpm = rate_limit_tpm
        self.rate_limit_rpm = rate_limit_rpm
        self.timeout = timeout
        self.endpoint = endpoint
        self.urlopen = urlopen
        self._backend_name = f"{provider}:{model_name}"

    def __call__(self, text: str) -> list[float]:
        return self.embed([text])[0]

    def embed(self, texts: list[str]) -> list[list[float]]:
        vectors = []
        for batch in self._batches(texts):
            vectors.extend(self._embed_batch(batch))
        return vectors

    def _embed_batch(self, texts: list[str]) -> list[list[float]]:
        self._wait_for_rate_limit(texts)
        if self.provider == "fpt":
            body = {
                "model": self.model_name,
                "input": texts,
                "encoding_format": "float",
                "input_text_truncate": "none",
            }
            if self.output_dimension:
                body["dimensions"] = self.output_dimension
            if self.input_type:
                body["input_type"] = self.input_type
        else:
            body = {"model": self.model_name, "input": texts}
            if self.input_type:
                body["input_type"] = self.input_type
            if self.output_dimension:
                body["output_dimension"] = self.output_dimension
        req = request.Request(
            self.endpoint,
            data=json.dumps(body).encode(),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with self.urlopen(req, timeout=self.timeout) as response:
                payload = json.loads(response.read().decode())
        except HTTPError as exc:
            if exc.code != 429:
                raise
            time.sleep(60)
            with self.urlopen(req, timeout=self.timeout) as response:
                payload = json.loads(response.read().decode())
        return [[float(value) for value in item["embedding"]] for item in payload["data"]]

    def _wait_for_rate_limit(self, texts: list[str]) -> None:
        key = (self.provider, self.model_name)
        with self._global_lock:
            now = time.monotonic()
            request_times = [item for item in self._global_request_times.get(key, []) if now - item < 60]
            if len(request_times) >= self.rate_limit_rpm:
                time.sleep(60 - (now - request_times[0]))
                now = time.monotonic()
                request_times = [item for item in request_times if now - item < 60]

            window_start, tokens_used = self._global_token_windows.get(key, (now, 0))
            if now - window_start >= 60:
                window_start, tokens_used = now, 0
            tokens = sum(_estimate_tokens(text) for text in texts)
            if tokens_used + tokens > self.rate_limit_tpm:
                time.sleep(60 - (now - window_start))
                window_start, tokens_used = time.monotonic(), 0
            self._global_token_windows[key] = (window_start, tokens_used + tokens)
            request_times.append(time.monotonic())
            self._global_request_times[key] = request_times

    def _batches(self, texts: list[str]) -> list[list[str]]:
        batches: list[list[str]] = []
        current: list[str] = []
        tokens = 0
        for text in texts:
            item_tokens = _estimate_tokens(text)
            if current and tokens + item_tokens > self.rate_limit_tpm:
                batches.append(current)
                current, tokens = [], 0
            current.append(text)
            tokens += item_tokens
        if current:
            batches.append(current)
        return batches


def _estimate_tokens(text: str) -> int:
    return max(1, len(re.findall(r"\w+|[^\w\s]", text, flags=re.UNICODE)))


_mock_embed = MockEmbedder()
