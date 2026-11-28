"""Opening a thread's HTML page: only from this computer, only a real page."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from dodaios.platform import open_path
from dodaios.ui.web import agentic_ide_html_routes as routes

# The app under test has no sign-in layer, and the shared auto sign-in cannot
# pass a client address through.
pytestmark = pytest.mark.no_auto_web_auth

AVAILABILITY = "/api/agentic-ide/html-page/availability"
OPEN = "/api/agentic-ide/html-page/open"


def _client(tmp_path: Path, *, native: bool = True, host: str = "127.0.0.1") -> TestClient:
    app = FastAPI()
    app.include_router(routes.router)
    app.state.native_file_actions = native
    return TestClient(app, base_url=f"http://{host}", client=(host, 50000))


@pytest.fixture
def workspace(tmp_path: Path):
    async def folder(workspace_id: str) -> str:
        if workspace_id != "ws":
            raise HTTPException(status_code=404, detail="That workspace is not open.")
        return str(tmp_path)

    (tmp_path / "report.html").write_text("<p>ok</p>", encoding="utf-8")
    (tmp_path / "setup.bat").write_text("echo", encoding="utf-8")
    with patch.object(routes, "_workspace_folder", folder):
        yield tmp_path


@pytest.fixture
def launcher():
    with patch.object(open_path, "open_html_in_browser", return_value="chrome") as launch:
        yield launch


def _open(client: TestClient, target: str) -> dict:
    answer = client.post(OPEN, json={"workspace_id": "ws", "target": target})
    assert answer.status_code == 200, answer.text
    return answer.json()


def test_a_page_is_handed_to_the_browser(workspace: Path, launcher) -> None:
    assert _open(_client(workspace), "report.html") == {"opened": "chrome", "reason": None}
    launcher.assert_called_once_with((workspace / "report.html").resolve())


def test_no_browser_is_reported(workspace: Path, launcher) -> None:
    launcher.return_value = "none"
    assert _open(_client(workspace), "report.html") == {"opened": "none", "reason": None}


@pytest.mark.parametrize(
    ("target", "reason"),
    [("setup.bat", "not-html"), ("missing.html", "not-found"), ("../outside.html", "not-found")],
)
def test_anything_else_starts_nothing(workspace: Path, launcher, target: str, reason: str) -> None:
    assert _open(_client(workspace), target) == {"opened": "none", "reason": reason}
    launcher.assert_not_called()


def test_a_network_file_is_named_as_such(workspace: Path, launcher) -> None:
    refusal = open_path.HtmlOpenRejected("network-file")
    with patch.object(open_path, "prepare_html_open", side_effect=refusal):
        assert _open(_client(workspace), "report.html")["reason"] == "network-file"
    launcher.assert_not_called()


@pytest.mark.parametrize(
    ("native", "host", "status"), [(True, "192.168.1.20", 403), (False, "127.0.0.1", 404)]
)
def test_a_remote_or_headless_client_starts_nothing(
    workspace: Path, launcher, native: bool, host: str, status: int
) -> None:
    client = _client(workspace, native=native, host=host)
    answer = client.post(OPEN, json={"workspace_id": "ws", "target": "report.html"})
    assert answer.status_code == status
    assert client.get(AVAILABILITY).json() == {"can_open": False}
    launcher.assert_not_called()


@pytest.mark.parametrize("display", [True, False])
def test_availability_on_this_computer_follows_the_screen(workspace: Path, display: bool) -> None:
    with patch.object(routes, "_screen_present", return_value=display):
        assert _client(workspace).get(AVAILABILITY).json() == {"can_open": display}
