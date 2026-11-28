"""Checking one local HTML file and handing it to a web browser, per system."""

from __future__ import annotations

import os
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import pytest

import dodaios.platform.open_path as op
from dodaios.platform.capabilities import Capabilities


def _caps(display: bool = True) -> Capabilities:
    return Capabilities(
        platform="linux",
        has_hotkey=False,
        has_ax_tree=False,
        has_overlay=False,
        has_pty=False,
        has_elevation=False,
        has_cursor=False,
        display_present=display,
        is_wayland=False,
        has_webview=False,
        ax_permission_granted=None,
    )


def _page(tmp_path: Path, name: str = "my page #1 100%.html") -> Path:
    page = tmp_path / name
    page.write_text("<h1>hi</h1>", encoding="utf-8")
    return page


def _on(platform: str, display: bool = True):
    return (
        patch.object(op, "detect_capabilities", return_value=_caps(display)),
        patch.object(op, "detect_platform", return_value=platform),
    )


@pytest.mark.parametrize("name", ["a.html", "b.HTM"])
def test_an_html_file_is_accepted(tmp_path: Path, name: str) -> None:
    page = _page(tmp_path, name)
    assert op.prepare_html_open(page) == page.resolve()


@pytest.mark.parametrize("name", ["a.exe", "a.html.bat", "a.hta", "a.txt", "html"])
def test_any_other_file_is_refused(tmp_path: Path, name: str) -> None:
    with pytest.raises(op.HtmlOpenRejected) as refused:
        op.prepare_html_open(_page(tmp_path, name))
    assert refused.value.reason == "not-html"


def test_a_missing_file_and_a_folder_are_refused(tmp_path: Path) -> None:
    (tmp_path / "folder.html").mkdir()
    for target, reason in (
        (tmp_path / "no.html", "not-found"),
        (tmp_path / "folder.html", "not-html"),
    ):
        with pytest.raises(op.HtmlOpenRejected) as refused:
            op.prepare_html_open(target)
        assert refused.value.reason == reason


def test_a_link_named_html_that_points_at_a_program_is_refused(tmp_path: Path) -> None:
    program = _page(tmp_path, "tool.exe")
    link = tmp_path / "report.html"
    try:
        os.symlink(program, link)
    except OSError:
        pytest.skip("this account may not create symbolic links")
    with pytest.raises(op.HtmlOpenRejected) as refused:
        op.prepare_html_open(link)
    assert refused.value.reason == "not-html"


@pytest.mark.parametrize("raw", [r"\\server\share\a.html", "//server/share/a.html"])
def test_a_network_share_is_refused_without_being_touched(raw: str) -> None:
    with patch.object(Path, "resolve", side_effect=AssertionError("touched the share")):
        with pytest.raises(op.HtmlOpenRejected) as refused:
            op.prepare_html_open(Path(raw))
    assert refused.value.reason == "network-file"


def test_a_mapped_network_drive_is_refused(tmp_path: Path) -> None:
    page = _page(tmp_path)
    with patch.object(op, "_on_network_drive", return_value=True):
        with pytest.raises(op.HtmlOpenRejected) as refused:
            op.prepare_html_open(page)
    assert refused.value.reason == "network-file"


def test_no_display_starts_nothing(tmp_path: Path) -> None:
    caps, plat = _on("linux", display=False)
    with (
        caps,
        plat,
        patch.object(op.subprocess, "Popen") as popen,
        patch.object(op.subprocess, "run") as run,
    ):
        assert op.open_html_in_browser(_page(tmp_path)) == "none"
    popen.assert_not_called()
    run.assert_not_called()


def test_windows_uses_chrome_first_with_an_encoded_address(tmp_path: Path) -> None:
    page = _page(tmp_path)
    caps, plat = _on("win32")
    edge, chrome = r"C:\x\msedge.exe", r"C:\x\chrome.exe"
    with (
        caps,
        plat,
        patch.object(op, "_windows_browser_candidates", return_value=[edge, chrome]),
        patch.object(op.subprocess, "Popen") as popen,
    ):
        assert op.open_html_in_browser(page) == "chrome"
    argv = popen.call_args.args[0]
    assert argv == [chrome, page.as_uri()]
    assert "%23" in argv[1] and "%25" in argv[1] and " " not in argv[1]


def test_windows_without_chrome_uses_the_default_browser_program(tmp_path: Path) -> None:
    caps, plat = _on("win32")
    with (
        caps,
        plat,
        patch.object(op, "_windows_browser_candidates", return_value=[r"C:\x\msedge.exe"]),
        patch.object(op.subprocess, "Popen") as popen,
        patch.object(op.os, "startfile", create=True) as startfile,
    ):
        assert op.open_html_in_browser(_page(tmp_path)) == "default"
    assert popen.call_args.args[0][0] == r"C:\x\msedge.exe"
    startfile.assert_not_called()


def test_windows_with_no_browser_never_follows_the_file_association(tmp_path: Path) -> None:
    caps, plat = _on("win32")
    with (
        caps,
        plat,
        patch.object(op, "_windows_browser_candidates", return_value=[]),
        patch.object(op.os, "startfile", create=True) as startfile,
    ):
        assert op.open_html_in_browser(_page(tmp_path)) == "none"
    startfile.assert_not_called()


@pytest.mark.parametrize(("codes", "expected"), [([0], "chrome"), ([1, 0], "default")])
def test_macos_asks_for_chrome_by_name_then_other_browsers(
    tmp_path: Path, codes: list[int], expected: str
) -> None:
    caps, plat = _on("darwin")
    answers = [SimpleNamespace(returncode=code) for code in codes]
    with caps, plat, patch.object(op.subprocess, "run", side_effect=answers) as run:
        assert op.open_html_in_browser(_page(tmp_path)) == expected
    argvs = [call.args[0] for call in run.call_args_list]
    assert argvs[0][:3] == ["open", "-a", "Google Chrome"]
    assert all(argv[:2] == ["open", "-a"] for argv in argvs)


def test_linux_takes_chromium_as_chrome(tmp_path: Path) -> None:
    caps, plat = _on("linux")
    found = {"chromium": "/usr/bin/chromium"}
    with (
        caps,
        plat,
        patch.object(op.shutil, "which", side_effect=found.get),
        patch.object(op.subprocess, "Popen") as popen,
    ):
        assert op.open_html_in_browser(_page(tmp_path)) == "chrome"
    assert popen.call_args.args[0][0] == "/usr/bin/chromium"


def test_linux_without_chrome_uses_the_desktop_default_browser(tmp_path: Path) -> None:
    caps, plat = _on("linux")
    found = {"xdg-settings": "/usr/bin/xdg-settings", "gtk-launch": "/usr/bin/gtk-launch"}
    answers = [
        SimpleNamespace(returncode=0, stdout="firefox.desktop\n"),
        SimpleNamespace(returncode=0, stdout=""),
    ]
    with (
        caps,
        plat,
        patch.object(op.shutil, "which", side_effect=found.get),
        patch.object(op.subprocess, "run", side_effect=answers) as run,
    ):
        assert op.open_html_in_browser(_page(tmp_path)) == "default"
    assert run.call_args_list[1].args[0][:2] == ["/usr/bin/gtk-launch", "firefox.desktop"]


def test_linux_with_no_browser_reports_none(tmp_path: Path) -> None:
    caps, plat = _on("linux")
    with (
        caps,
        plat,
        patch.object(op.shutil, "which", return_value=None),
        patch.object(op.subprocess, "Popen") as popen,
    ):
        assert op.open_html_in_browser(_page(tmp_path)) == "none"
    popen.assert_not_called()
