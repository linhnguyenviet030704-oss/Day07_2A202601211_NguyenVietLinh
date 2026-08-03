from __future__ import annotations

import math
import re
from typing import Callable


class FixedSizeChunker:
    """
    Split text into fixed-size chunks with optional overlap.

    Rules:
        - Each chunk is at most chunk_size characters long.
        - Consecutive chunks share overlap characters.
        - The last chunk contains whatever remains.
        - If text is shorter than chunk_size, return [text].
    """

    def __init__(self, chunk_size: int = 500, overlap: int = 50) -> None:
        if chunk_size <= 0:
            raise ValueError("chunk_size must be positive")
        if overlap < 0 or overlap >= chunk_size:
            raise ValueError("overlap must be >= 0 and < chunk_size")
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, text: str) -> list[str]:
        if not text:
            return []
        if len(text) <= self.chunk_size:
            return [text]

        step = self.chunk_size - self.overlap
        chunks: list[str] = []
        for start in range(0, len(text), step):
            chunk = text[start : start + self.chunk_size]
            chunks.append(chunk)
            if start + self.chunk_size >= len(text):
                break
        return chunks


class SentenceChunker:
    """
    Split text into chunks of at most max_sentences_per_chunk sentences.

    Sentence detection: split on ". ", "! ", "? " or ".\n".
    Strip extra whitespace from each chunk.
    """

    def __init__(self, max_sentences_per_chunk: int = 3) -> None:
        self.max_sentences_per_chunk = max(1, max_sentences_per_chunk)

    def chunk(self, text: str) -> list[str]:
        sentences = _sentences(text)
        return [
            " ".join(sentences[i : i + self.max_sentences_per_chunk]).strip()
            for i in range(0, len(sentences), self.max_sentences_per_chunk)
        ]


class SemanticChunker:
    """Group adjacent sentences while they stay lexically related."""

    def __init__(
        self,
        max_sentences_per_chunk: int = 4,
        similarity_threshold: float = 0.15,
        embedding_fn: Callable[[str], list[float]] | None = None,
    ) -> None:
        self.max_sentences_per_chunk = max(1, max_sentences_per_chunk)
        self.similarity_threshold = similarity_threshold
        self.embedding_fn = embedding_fn

    def chunk(self, text: str) -> list[str]:
        sentences = _sentences(text)
        if not sentences:
            return []
        chunks: list[list[str]] = [[sentences[0]]]
        for sentence in sentences[1:]:
            current = chunks[-1]
            if len(current) < self.max_sentences_per_chunk and self._similarity(" ".join(current), sentence) >= self.similarity_threshold:
                current.append(sentence)
            else:
                chunks.append([sentence])
        return [" ".join(chunk).strip() for chunk in chunks]

    def _similarity(self, a: str, b: str) -> float:
        if self.embedding_fn:
            return compute_similarity(self.embedding_fn(a), self.embedding_fn(b))
        return _token_similarity(a, b)


class DocumentStructureChunker:
    """Split Markdown-like documents by headings, then cap long sections."""

    def __init__(self, chunk_size: int = 500) -> None:
        self.chunk_size = chunk_size

    def chunk(self, text: str) -> list[str]:
        if not text:
            return []
        sections = re.split(r"(?m)(?=^#{1,6}\s+)", text.strip())
        sections = [section.strip() for section in sections if section.strip()]
        if len(sections) == 1 and not sections[0].startswith("#"):
            sections = [part.strip() for part in re.split(r"\n\s*\n", text.strip()) if part.strip()]

        fixed = FixedSizeChunker(chunk_size=self.chunk_size, overlap=0)
        chunks: list[str] = []
        for section in sections:
            chunks.extend(fixed.chunk(section) if len(section) > self.chunk_size else [section])
        return chunks


class RecursiveChunker:
    """
    Recursively split text using separators in priority order.

    Default separator priority:
        ["\n\n", "\n", ". ", " ", ""]
    """

    DEFAULT_SEPARATORS = ["\n\n", "\n", ". ", " ", ""]

    def __init__(self, separators: list[str] | None = None, chunk_size: int = 500) -> None:
        self.separators = self.DEFAULT_SEPARATORS if separators is None else list(separators)
        self.chunk_size = chunk_size

    def chunk(self, text: str) -> list[str]:
        return [chunk.strip() for chunk in self._split(text, self.separators) if chunk.strip()]

    def _split(self, current_text: str, remaining_separators: list[str]) -> list[str]:
        if len(current_text) <= self.chunk_size:
            return [current_text]
        if not remaining_separators:
            return FixedSizeChunker(chunk_size=self.chunk_size, overlap=0).chunk(current_text)

        separator, rest = remaining_separators[0], remaining_separators[1:]
        if not separator:
            return FixedSizeChunker(chunk_size=self.chunk_size, overlap=0).chunk(current_text)
        if separator not in current_text:
            return self._split(current_text, rest)

        chunks: list[str] = []
        current = ""
        for part in current_text.split(separator):
            candidate = part if not current else current + separator + part
            if len(candidate) <= self.chunk_size:
                current = candidate
                continue
            if current:
                chunks.extend(self._split(current, rest))
            current = part
        if current:
            chunks.extend(self._split(current, rest))
        return chunks


def _dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def compute_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Compute cosine similarity between two vectors.

    cosine_similarity = dot(a, b) / (||a|| * ||b||)

    Returns 0.0 if either vector has zero magnitude.
    """
    norm_a = math.sqrt(_dot(vec_a, vec_a))
    norm_b = math.sqrt(_dot(vec_b, vec_b))
    if not norm_a or not norm_b:
        return 0.0
    return _dot(vec_a, vec_b) / (norm_a * norm_b)


class ChunkingStrategyComparator:
    """Run all built-in chunking strategies and compare their results."""

    def compare(self, text: str, chunk_size: int = 200) -> dict:
        strategies = {
            "fixed_size": FixedSizeChunker(chunk_size=chunk_size, overlap=0),
            "by_sentences": SentenceChunker(max_sentences_per_chunk=3),
            "recursive": RecursiveChunker(chunk_size=chunk_size),
            "semantic": SemanticChunker(max_sentences_per_chunk=3),
            "document_structure": DocumentStructureChunker(chunk_size=chunk_size),
        }
        return {name: _chunk_stats(chunker.chunk(text)) for name, chunker in strategies.items()}


def _sentences(text: str) -> list[str]:
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+|\n+", text.strip()) if part.strip()]


def _tokens(text: str) -> set[str]:
    return set(re.findall(r"\w+", text.lower(), flags=re.UNICODE))


def _token_similarity(a: str, b: str) -> float:
    left, right = _tokens(a), _tokens(b)
    return len(left & right) / len(left | right) if left and right else 0.0


def _chunk_stats(chunks: list[str]) -> dict:
    return {
        "count": len(chunks),
        "avg_length": sum(map(len, chunks)) / len(chunks) if chunks else 0,
        "chunks": chunks,
    }
