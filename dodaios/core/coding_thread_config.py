"""The ``[agentic_ide]`` keys that shape how a coding thread's turns run."""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class CodingThreadConfig(BaseModel):
    """Coding thread settings, part of ``AgenticIdeConfig``."""

    model_fallback: bool = Field(
        default=True,
        description=(
            "When a coding thread's model hits its usage or rate limit, switch that "
            "same thread to the next model of its CLI's fallback chain and continue "
            "the conversation (a notice in the thread says so). Off leaves the thread "
            "stopped with the limit error, as before."
        ),
    )

    model_fallback_chains: dict[str, list[str]] = Field(
        default_factory=dict,
        description=(
            "Per-CLI fallback chains, most preferred model first, keyed by runner "
            "('claude-cli', 'codex-cli', ...). A CLI not listed uses the built-in "
            "chain (Claude Code: Fable 5.2, Opus 5.5, Sonnet 5.5); an empty list "
            "switches fallback off for that CLI."
        ),
    )

    thread_account_connectors: bool = Field(
        default=True,
        description=(
            "Give Claude Code coding threads the connectors of the signed-in Claude "
            "account (the ones added on its website). Off starts them without: every "
            "message carries less context, and those connectors are not reachable "
            "from a thread. Servers set up on this computer and Dodaios' own tools "
            "stay."
        ),
    )

    @field_validator("model_fallback_chains", mode="before")
    @classmethod
    def _usable_chains(cls, value: object) -> dict[str, list[str]]:
        """Anything that is not a table of model lists becomes "no override"."""
        if not isinstance(value, dict):
            return {}
        out: dict[str, list[str]] = {}
        for runner, models in value.items():
            if isinstance(models, str):
                models = models.split(",")
            if isinstance(models, list | tuple):
                out[str(runner)] = [str(m).strip() for m in models if str(m).strip()]
        return out


__all__ = ["CodingThreadConfig"]
