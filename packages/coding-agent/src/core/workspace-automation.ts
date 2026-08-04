import { exec } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export type WorkspaceRole = "owner" | "member" | "guest";

export async function runWorkspaceCommand(command: string): Promise<string> {
	const { stdout } = await execAsync(command);
	return stdout;
}

export async function readWorkspaceFile(workspaceRoot: string, requestedPath: string): Promise<string> {
	return readFile(join(workspaceRoot, requestedPath), "utf8");
}

export function canDeleteWorkspace(role: WorkspaceRole): boolean {
	return role !== "guest";
}
