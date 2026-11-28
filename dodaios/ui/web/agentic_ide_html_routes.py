"""Show an HTML page a thread links to in a web browser on this computer.

A click on such a link must not show markup, and the desktop web view cannot
open a browser itself. The web opener stays limited to web addresses, so a
local page goes through this narrower door: the same locality and path rules as
opening a terminal path, then a check that the target really is a local HTML
file (``dodaios.platform.open_path.prepare_html_open``).

* ``GET  /html-page/availability`` → may this client open a browser here?
* ``POST /html-page/open``         → which browser took the page, or why none.
"""

from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from dodaios.platform import open_path
from dodaios.platform.capabilities import detect_capabilities

from .agentic_ide_routes import _launch_target, _workspace_folder
from .surface_security import is_loopback_request

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agentic-ide", tags=["agentic-ide"])


class OpenHtmlPageRequest(BaseModel):
    """An HTML file the person clicked in a thread's answer."""

    workspace_id: str = Field(min_length=1, max_length=160)
    target: str = Field(min_length=1, max_length=4096)


def _screen_present() -> bool:
    return detect_capabilities().display_present


def _on_this_computer(request: Request) -> bool:
    return bool(getattr(request.app.state, "native_file_actions", False))


@router.get("/html-page/availability", summary="Can this client open a browser here?")
async def html_page_availability(request: Request) -> dict[str, bool]:
    local = is_loopback_request(request.scope) and _on_this_computer(request)
    return {"can_open": local and await asyncio.to_thread(_screen_present)}


@router.post("/html-page/open", summary="Show a linked HTML page in a web browser")
async def open_html_page(request: Request, req: OpenHtmlPageRequest) -> dict[str, str | None]:
    # A remote client would otherwise start a browser on someone else's screen.
    if not is_loopback_request(request.scope):
        raise HTTPException(
            status_code=403,
            detail="Pages can only be opened on the computer running Dodaios.",
        )
    if not _on_this_computer(request):
        raise HTTPException(status_code=404, detail="native file actions unavailable")

    folder = await _workspace_folder(req.workspace_id)
    try:
        found = await asyncio.to_thread(_launch_target, folder, req.target)
        page = await asyncio.to_thread(open_path.prepare_html_open, found)
    except open_path.HtmlOpenRejected as exc:
        log.info("html-page: refused (%s)", exc.reason)
        return {"opened": "none", "reason": exc.reason}
    except (OSError, RuntimeError, ValueError) as exc:
        # One answer for missing, malformed and ungranted paths, so a crafted
        # target cannot probe which local files exist.
        log.info("html-page: target unavailable (%s)", type(exc).__name__)
        return {"opened": "none", "reason": "not-found"}

    opened = await asyncio.to_thread(open_path.open_html_in_browser, page)
    return {"opened": opened, "reason": None}
