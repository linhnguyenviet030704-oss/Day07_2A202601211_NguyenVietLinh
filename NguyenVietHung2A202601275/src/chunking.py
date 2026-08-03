from __future__ import annotations

import math
import re


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
        if not text:
            return []
        
        parts = re.split(r'(\.\s+|\!\s+|\?\s+|\.\n)', text)
        sentences = []
        current = ""
        for p in parts:
            current += p
            if re.match(r'(\.\s+|\!\s+|\?\s+|\.\n)', p):
                sentences.append(current.strip())
                current = ""
        if current.strip():
            sentences.append(current.strip())
            
        chunks = []
        for i in range(0, len(sentences), self.max_sentences_per_chunk):
            chunk = " ".join(sentences[i:i+self.max_sentences_per_chunk])
            chunks.append(chunk)
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
        if not text:
            return []
        return self._split(text, self.separators)

    def _split(self, current_text: str, remaining_separators: list[str]) -> list[str]:
        if len(current_text) <= self.chunk_size:
            return [current_text]
            
        if not remaining_separators:
            # Base case: fallback to fixed size chunking if no separators left
            return [current_text[i:i+self.chunk_size] for i in range(0, len(current_text), self.chunk_size)]
            
        separator = remaining_separators[0]
        next_separators = remaining_separators[1:]
        
        # Avoid splitting by empty string separator which doesn't work well with .split()
        if separator == "":
            parts = list(current_text)
        else:
            parts = current_text.split(separator)
            
        final_chunks = []
        current_chunk_parts = []
        current_length = 0
        
        for part in parts:
            # Length of this part plus separator (if we already have parts)
            part_len = len(part) if not current_chunk_parts else len(part) + len(separator)
            
            if current_length + part_len <= self.chunk_size:
                current_chunk_parts.append(part)
                current_length += part_len
            else:
                if current_chunk_parts:
                    final_chunks.append(separator.join(current_chunk_parts))
                    current_chunk_parts = []
                    current_length = 0
                    
                if len(part) > self.chunk_size:
                    final_chunks.extend(self._split(part, next_separators))
                else:
                    current_chunk_parts.append(part)
                    current_length = len(part)
                    
        if current_chunk_parts:
            final_chunks.append(separator.join(current_chunk_parts))
            
        return final_chunks


def _dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def compute_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Compute cosine similarity between two vectors.

    cosine_similarity = dot(a, b) / (||a|| * ||b||)

    Returns 0.0 if either vector has zero magnitude.
    """
    dot = _dot(vec_a, vec_b)
    norm_a = math.sqrt(sum(x * x for x in vec_a))
    norm_b = math.sqrt(sum(x * x for x in vec_b))
    
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
        
    return dot / (norm_a * norm_b)


class ChunkingStrategyComparator:
    """Run all built-in chunking strategies and compare their results."""

    def compare(self, text: str, chunk_size: int = 200) -> dict:
        results = {}
        
        strategies = {
            'fixed_size': FixedSizeChunker(chunk_size=chunk_size, overlap=20),
            'by_sentences': SentenceChunker(max_sentences_per_chunk=3),
            'recursive': RecursiveChunker(chunk_size=chunk_size)
        }
        
        for name, chunker in strategies.items():
            chunks = chunker.chunk(text)
            count = len(chunks)
            avg_length = sum(len(c) for c in chunks) / count if count > 0 else 0
            results[name] = {
                'count': count,
                'avg_length': avg_length,
                'chunks': chunks
            }
            
        return results
