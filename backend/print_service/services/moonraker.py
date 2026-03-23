"""
HTTP-клиент Moonraker (Klipper).
Документация: https://moonraker.readthedocs.io/en/latest/web_api/
"""
from __future__ import annotations

import os
from typing import Any

import requests
from django.conf import settings


class MoonrakerClient:
    def __init__(self) -> None:
        self.base_url = (os.getenv("MOONRAKER_API_URL") or getattr(settings, "MOONRAKER_API_URL", "")).rstrip("/")
        self.api_key = os.getenv("MOONRAKER_API_KEY") or getattr(settings, "MOONRAKER_API_KEY", "") or ""
        self.headers: dict[str, str] = {}
        if self.api_key:
            self.headers["X-Api-Key"] = self.api_key

    def _url(self, path: str) -> str:
        path = path if path.startswith("/") else f"/{path}"
        return f"{self.base_url}{path}"

    def upload_gcode(self, gcode_path: str, remote_subpath: str = "gcodes") -> str:
        """Загрузка G-code на Moonraker. Возвращает имя файла для print/start."""
        filename = os.path.basename(gcode_path)
        with open(gcode_path, "rb") as f:
            files = {"file": (filename, f, "application/octet-stream")}
            data = {"path": remote_subpath}
            r = requests.post(
                self._url("/server/files/upload"),
                files=files,
                data=data,
                headers=self.headers,
                timeout=120,
            )
        r.raise_for_status()
        body = r.json()
        # Ответ: result с item.path или просто имя файла
        result = body.get("result") or {}
        if isinstance(result, dict):
            item = result.get("item") or {}
            path = item.get("path") or result.get("path")
            if path:
                return str(path).replace(f"{remote_subpath}/", "")
        return filename

    def start_print(self, filename: str) -> str | None:
        """
        POST /printer/print/start
        body: { "filename": "gcodes/foo.gcode" } или относительно root gcodes
        """
        # Moonraker ожидает путь относительно gcodes или полный путь в gcodes/
        fname = filename if filename.startswith("gcodes/") else f"gcodes/{filename}"
        r = requests.post(
            self._url("/printer/print/start"),
            json={"filename": fname},
            headers={**self.headers, "Content-Type": "application/json"},
            timeout=30,
        )
        r.raise_for_status()
        data = r.json().get("result")
        if isinstance(data, dict):
            return data.get("job_id") or data.get("filename")
        return None

    def get_printer_objects(self) -> dict[str, Any]:
        """Снимок состояния принтера (для мониторинга)."""
        r = requests.get(
            self._url("/printer/objects/query"),
            params=[("objects", "print_stats")],
            headers=self.headers,
            timeout=15,
        )
        r.raise_for_status()
        return r.json().get("result", {}) or {}
