import json

from src.embeddings import RequestEmbedder


class FakeResponse:
    def __init__(self, count=1):
        self.count = count

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False

    def read(self):
        return json.dumps({"data": [{"embedding": [0.1, 0.2, 0.3]} for _ in range(self.count)]}).encode()


def reset_request_embedder_limits():
    RequestEmbedder._global_request_times.clear()
    RequestEmbedder._global_token_windows.clear()


def test_request_embedder_calls_voyage_embeddings_endpoint():
    reset_request_embedder_limits()
    captured = {}

    def fake_urlopen(request, timeout):
        captured["url"] = request.full_url
        captured["timeout"] = timeout
        captured["headers"] = dict(request.header_items())
        captured["body"] = json.loads(request.data.decode())
        return FakeResponse()

    embedder = RequestEmbedder(
        provider="voyage",
        model_name="voyage-4-lite",
        api_key="test-key",
        input_type="document",
        output_dimension=1024,
        urlopen=fake_urlopen,
    )

    assert embedder("hello") == [0.1, 0.2, 0.3]
    assert captured["url"] == "https://api.voyageai.com/v1/embeddings"
    assert captured["headers"]["Authorization"] == "Bearer test-key"
    assert captured["body"] == {
        "model": "voyage-4-lite",
        "input": ["hello"],
        "input_type": "document",
        "output_dimension": 1024,
    }


def test_request_embedder_calls_fpt_embedding_endpoint():
    reset_request_embedder_limits()
    captured = {}

    def fake_urlopen(request, timeout):
        captured["url"] = request.full_url
        captured["headers"] = dict(request.header_items())
        captured["body"] = json.loads(request.data.decode())
        return FakeResponse()

    embedder = RequestEmbedder(
        provider="fpt",
        model_name="Vietnamese_Embedding",
        api_key="fpt-key",
        input_type="passage",
        output_dimension=1024,
        urlopen=fake_urlopen,
    )

    assert embedder("xin chao") == [0.1, 0.2, 0.3]
    assert captured["url"] == "https://mkp-api.fptcloud.com/v1/embeddings"
    assert captured["headers"]["Authorization"] == "Bearer fpt-key"
    assert captured["body"] == {
        "model": "Vietnamese_Embedding",
        "input": ["xin chao"],
        "dimensions": 1024,
        "encoding_format": "float",
        "input_text_truncate": "none",
        "input_type": "passage",
    }


def test_request_embedder_can_embed_batches():
    reset_request_embedder_limits()

    def fake_urlopen(request, timeout):
        body = json.loads(request.data.decode())
        return FakeResponse(len(body["input"]))

    embedder = RequestEmbedder(api_key="test-key", urlopen=fake_urlopen)
    assert embedder.embed(["a", "b"]) == [[0.1, 0.2, 0.3], [0.1, 0.2, 0.3]]


def test_request_embedder_splits_batches_over_tpm(monkeypatch):
    reset_request_embedder_limits()
    sleeps = []
    bodies = []

    monkeypatch.setattr("src.embeddings.time.sleep", lambda seconds: sleeps.append(seconds))

    def fake_urlopen(request, timeout):
        body = json.loads(request.data.decode())
        bodies.append(body["input"])
        return FakeResponse(len(body["input"]))

    embedder = RequestEmbedder(
        api_key="test-key",
        rate_limit_tpm=3,
        rate_limit_rpm=999,
        urlopen=fake_urlopen,
    )

    assert embedder.embed(["one two three", "four five six"]) == [[0.1, 0.2, 0.3], [0.1, 0.2, 0.3]]
    assert bodies == [["one two three"], ["four five six"]]
    assert sleeps


def test_request_embedder_loads_dotenv_api_key_and_sets_rate_limits(monkeypatch, tmp_path):
    env = tmp_path / ".env"
    env.write_text("VOYAGE_API_KEY=env-key\n", encoding="utf-8")
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("VOYAGE_API_KEY", raising=False)

    embedder = RequestEmbedder(urlopen=lambda request, timeout: FakeResponse())

    assert embedder.api_key == "env-key"
    assert embedder.rate_limit_tpm == 10000
    assert embedder.rate_limit_rpm == 3
