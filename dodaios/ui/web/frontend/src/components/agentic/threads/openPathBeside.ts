import { panelWorkspace } from "@/store/ideChat";
import { openOutsideFile } from "@/components/agentic/editor/editorApi";
import { fetchTypeahead } from "@/lib/agentChatApi";
import { openLocalPath } from "@/lib/openLocalPath";
import { revealInExplorer } from "@/store/ideExplorer";
import { useIdeProjectsStore } from "@/store/ideProjects";
import { absoluteFilePath, useSideFileStore } from "@/store/sideFile";
import { matchProjectPath, type ProjectPathMatch } from "./projectPathMatch";

/** A path with no drive, no leading slash and no `~`: an answer named it from some folder. */
function isRelative(path: string): boolean {
  return !/^(?:[a-z]:[\\/]|[\\/]|~(?:[\\/]|$))/i.test(path.trim());
}

/** The most entries one lookup reads; the search ranks exact names first. */
const LOOKUP_LIMIT = 1000;

/**
 * The full path of the one file or folder of the project a relative path
 * means when it is not there as written (`core/config.py` for
 * `dodaios/core/config.py`); null when none or several fit.
 *
 * The candidates are the files and folders under the thread's folder whose
 * name holds the named one, from the composer's file search (`@`): it reads
 * the thread's own folder, whichever workspace is open, and the server keeps
 * the listing warm.
 */
async function findInProject(path: string, folder: string): Promise<ProjectPathMatch | null> {
  const target = path.trim().replace(/\\/g, "/").replace(/\/+$/, "");
  const name = target.slice(target.lastIndexOf("/") + 1);
  if (!name) return null;
  try {
    const found = await fetchTypeahead({ surface: "agent", provider: "", cwd: folder, trigger: "@", q: name, limit: LOOKUP_LIMIT });
    // Folders come back as `path/`, which is how the match tells them from files.
    const entries = found.items.filter((item) => item.kind === "file" || item.kind === "folder").map((item) => item.value);
    const match = matchProjectPath(path, folder, entries);
    return match ? { ...match, path: absoluteFilePath(match.path, folder) } : null;
  } catch {
    return null; // The lookup is a second chance; without it the path reads as missing.
  }
}

/** Where a path an answer names turned out to be. */
export type LocatedPath =
  /** A file: `shown` is how the File tab reads it, `target` how the server knows it. */
  | { kind: "file"; shown: string; workspaceId: string; target: string }
  /** A folder of the project: the Files tab can show it. */
  | { kind: "folder"; workspaceId: string; path: string }
  /** No workspace to read from, or nothing found; `elsewhere` may still be a folder on the computer. */
  | { kind: "none"; elsewhere: string | null };

/**
 * Agents do not always name a file from the thread's folder. A relative path
 * that is not there as written is looked for in the project (the one file
 * whose path ends in it: `core/config.py` is `dodaios/core/config.py`), then
 * in the home folder (`Downloads\demo\clip.mp4`), before it reads as missing.
 *
 * Only a click calls this, so it may grant a file outside the project to the
 * panel, the same way a modifier-click on a terminal path does.
 */
export async function locatePath(path: string, folder: string): Promise<LocatedPath> {
  const absolute = absoluteFilePath(path, folder);
  const workspaceId = panelWorkspace()?.id ?? useIdeProjectsStore.getState().activeWorkspaceId;
  if (!workspaceId) return { kind: "none", elsewhere: null };
  const lookUp = async (candidate: string) => {
    try {
      return await openOutsideFile(workspaceId, candidate);
    } catch {
      return null; // Not here: try the next place it may be.
    }
  };
  const as = (answer: { path: string; kind: "file" | "directory" }, shown: string): LocatedPath =>
    answer.kind === "directory"
      ? { kind: "folder", workspaceId, path: answer.path }
      : { kind: "file", shown, workspaceId, target: answer.path };

  const written = await lookUp(absolute);
  if (written) return as(written, path);
  // A project folder the open workspace has no tree for opens on the computer.
  let elsewhere = absolute;
  if (isRelative(path) && folder) {
    const inProject = await findInProject(path, folder);
    const found = inProject ? await lookUp(inProject.path) : null;
    if (inProject && found) return as(found, inProject.path);
    if (inProject?.kind === "directory") elsewhere = inProject.path;
    const home = `~/${path.trim().replace(/^\.[\\/]/, "").replace(/\\/g, "/")}`;
    const atHome = await lookUp(home);
    // The server answers with the full path of a file outside the project.
    if (atHome) return as(atHome, isRelative(atHome.path) ? home : atHome.path);
  }
  return { kind: "none", elsewhere };
}

/**
 * Open a path a thread's answer names, beside the conversation: a file in the
 * side panel's File tab (at `line` when the answer named one), a folder of the
 * project in its Files tab. A folder elsewhere on the computer has no tree
 * here, so the file manager shows it. The File tab shows the path that was found.
 */
export async function openPathBeside(path: string, folder: string, line?: number): Promise<void> {
  const show = (shown = path) => useSideFileStore.getState().show({ path: shown, folder, diff: null, ...(line ? { line } : {}) });
  const found = await locatePath(path, folder);
  if (found.kind === "file") return show(found.shown);
  if (found.kind === "folder") {
    revealInExplorer({ workspaceId: found.workspaceId, path: found.path });
    return;
  }
  // Not a file, and not a folder of the project: a folder elsewhere opens
  // on the computer; anything else reads as unavailable in the File tab.
  const { elsewhere } = found;
  if (elsewhere && !/\.[A-Za-z0-9]{1,10}$/.test(elsewhere.replace(/[\\/]+$/, "")) && await openLocalPath(elsewhere)) return;
  show();
}
