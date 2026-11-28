"""The remembered answer to "how do HTML links in answers open"."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from dodaios.core.config import load_config
from dodaios.ui.web import settings_routes


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    config = tmp_path / "jarvis.toml"
    config.write_text("[ui]\n", encoding="utf-8")
    monkeypatch.setenv("JARVIS_CONFIG", str(config))
    app = FastAPI()
    app.include_router(settings_routes.router)
    return TestClient(app)


def test_a_configuration_without_the_key_asks(client: TestClient) -> None:
    body = client.get("/api/settings/html-link-open").json()
    assert body == {"mode": "ask", "options": ["ask", "browser", "source"]}


def test_a_choice_survives_a_reload(client: TestClient) -> None:
    answer = client.put("/api/settings/html-link-open", json={"mode": "browser"})
    assert answer.status_code == 200
    assert load_config().ui.html_link_open == "browser"
    assert client.get("/api/settings/html-link-open").json()["mode"] == "browser"


def test_an_unknown_value_is_rejected_and_nothing_changes(client: TestClient) -> None:
    client.put("/api/settings/html-link-open", json={"mode": "source"})
    assert client.put("/api/settings/html-link-open", json={"mode": "editor"}).status_code == 400
    assert load_config().ui.html_link_open == "source"


def test_a_hand_edited_value_falls_back_to_asking(tmp_path: Path) -> None:
    config = tmp_path / "jarvis.toml"
    config.write_text('[ui]\nhtml_link_open = "vim"\n', encoding="utf-8")
    assert load_config(config).ui.html_link_open == "ask"
