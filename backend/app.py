from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from .service import BackendService


service = BackendService()


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self._send({}, status=204)

    def do_GET(self):
        try:
            parsed = urlparse(self.path)
            path = parsed.path
            query = parse_qs(parsed.query)
            if path == "/options":
                return self._send(service.options())
            if path == "/users":
                return self._send(service.list_users())
            if path == "/knowledge-bases":
                return self._send(service.list_knowledge_bases(_one(query, "user_id")))
            if path == "/documents":
                return self._send(service.list_documents(_one(query, "knowledge_base_id")))
            if path == "/chats":
                return self._send(service.list_chats(_one(query, "user_id")))
            if path.startswith("/chats/"):
                return self._send(service.get_chat(path.split("/", 2)[2]))
            self._send({"error": "not found"}, status=404)
        except Exception as exc:
            self._send({"error": str(exc)}, status=400)

    def do_POST(self):
        try:
            path = urlparse(self.path).path
            body = self._json()
            if path == "/users":
                return self._send(service.create_user(body["name"]), status=201)
            if path == "/knowledge-bases":
                return self._send(
                    service.create_knowledge_base(body.get("user_id", service.default_user_id), body["name"]),
                    status=201,
                )
            if path == "/documents":
                return self._send(
                    service.upload_document(
                        filename=body["filename"],
                        content_b64=body["content_b64"],
                        chunking=body.get("chunking"),
                        embedding=body.get("embedding"),
                        knowledge_base_id=body.get("knowledge_base_id"),
                        user_id=body.get("user_id"),
                    ),
                    status=201,
                )
            if path == "/documents/scan":
                return self._send(
                    service.scan_document(
                        filename=body["filename"],
                        content_b64=body["content_b64"],
                        chunking=body.get("chunking"),
                    )
                )
            if path == "/chats":
                return self._send(
                    service.create_chat(
                        body.get("title", "New chat"),
                        user_id=body.get("user_id"),
                        knowledge_base_id=body.get("knowledge_base_id"),
                    ),
                    status=201,
                )
            if path.startswith("/chats/") and path.endswith("/messages"):
                chat_id = path.split("/")[2]
                return self._send(service.add_message(chat_id, body["message"], body.get("retrieval")))
            self._send({"error": "not found"}, status=404)
        except Exception as exc:
            self._send({"error": str(exc)}, status=400)

    def _json(self):
        size = int(self.headers.get("Content-Length", "0"))
        return json.loads(self.rfile.read(size).decode("utf-8") or "{}")

    def _send(self, payload, status=200):
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        if status != 204:
            self.wfile.write(raw)


def run(host: str = "127.0.0.1", port: int = 8000) -> None:
    print(f"Backend listening on http://{host}:{port}")
    ThreadingHTTPServer((host, port), Handler).serve_forever()


def _one(query: dict[str, list[str]], key: str) -> str | None:
    values = query.get(key)
    return values[0] if values else None


if __name__ == "__main__":
    run()
