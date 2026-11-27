"""A coding thread's Claude can start without the connectors of the Claude account.

Each connector is loaded with every message of a conversation, so a thread that
does not need them is lighter without. The config file, the planner and the
routes are the real ones.
"""

from __future__ import annotations

import tomllib
from pathlib import Path
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from dodaios.agent_chat import account_connectors, dodaios_harness, runner_cli
from dodaios.agent_chat.runner_cli.claude import plan_claude
from dodaios.ui.web.agent_chat_routes import router

URL = "/api/agent-chat/account-connectors"


@pytest.fixture
def config_file(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    path = tmp_path / "dodaios.toml"
    path.write_text("[agentic_ide]\nfollow_main = false\n", encoding="utf-8")
    monkeypatch.setenv("JARVIS_CONFIG", str(path))
    monkeypatch.setattr(runner_cli, "claude_argv_prefix", lambda: ["claude"])
    monkeypatch.delenv(account_connectors.ENV, raising=False)
    return path


def _env(folder: Path, identity: Any = None) -> dict[str, str]:
    return plan_claude(
        prompt="hi",
        cwd=folder,
        model="",
        effort="",
        permission_mode="default",
        resume=None,
        identity=identity,
    ).env


def _switch_off(config_file: Path) -> None:
    config_file.write_text("[agentic_ide]\nthread_account_connectors = false\n", encoding="utf-8")


def test_a_thread_keeps_the_account_connectors_unless_switched_off(config_file, tmp_path):
    assert account_connectors.ENV not in _env(tmp_path)


def test_switched_off_a_coding_thread_starts_without_them(config_file, tmp_path):
    _switch_off(config_file)
    assert _env(tmp_path)[account_connectors.ENV] == "false"


def test_the_switch_leaves_an_assistants_chat_alone(config_file, tmp_path):
    _switch_off(config_file)
    identity = dodaios_harness.Identity(session_id="s", text="x", compact="x", path=None)
    assert account_connectors.ENV not in _env(tmp_path, identity)


def test_a_person_who_set_the_variable_keeps_it_while_the_switch_is_on(
    config_file, tmp_path, monkeypatch
):
    monkeypatch.setenv(account_connectors.ENV, "false")
    assert _env(tmp_path)[account_connectors.ENV] == "false"


def test_the_screen_reads_and_changes_the_switch(config_file):
    app = FastAPI()
    app.include_router(router)
    with TestClient(app) as client:
        assert client.get(URL).json() == {"enabled": True}
        assert client.put(URL, json={"enabled": False}).json() == {"enabled": False}
        assert client.get(URL).json() == {"enabled": False}

    saved = tomllib.loads(config_file.read_text(encoding="utf-8"))["agentic_ide"]
    assert saved == {"follow_main": False, "thread_account_connectors": False}
