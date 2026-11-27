"""Whether coding threads get the connectors of the signed-in Claude account.

Claude Code loads every connector added to the account into each conversation:
tool definitions and server instructions travel with every message. A thread
that does not need them can start without
(``[agentic_ide] thread_account_connectors``). Servers set up on this computer
and Dodaios' own tools are not affected, and an assistant's chat never has the
connectors (``identity_turn_flags``).
"""

from __future__ import annotations

import logging
from typing import Final

log = logging.getLogger(__name__)

#: Claude Code's own switch for the account's connectors.
ENV: Final[str] = "ENABLE_CLAUDEAI_MCP_SERVERS"
CONFIG_KEY: Final[str] = "thread_account_connectors"


def enabled() -> bool:
    """The saved setting; on unless switched off."""
    try:
        from dodaios.core.config import load_config

        return bool(getattr(load_config().agentic_ide, CONFIG_KEY, True))
    except (OSError, ValueError) as exc:  # unreadable or invalid config
        log.warning("account connectors: config not read, keeping them on (%s)", exc)
        return True


def apply(env: dict[str, str]) -> dict[str, str]:
    """``env`` for a Claude Code thread. On leaves it as the person's own is."""
    return env if enabled() else {**env, ENV: "false"}


__all__ = ["CONFIG_KEY", "ENV", "apply", "enabled"]
