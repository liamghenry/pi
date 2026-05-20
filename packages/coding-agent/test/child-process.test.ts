import { describe, expect, it } from "vitest";
import { shouldUseWindowsShell } from "../src/utils/child-process.js";

describe("shouldUseWindowsShell", () => {
	const isWin32 = process.platform === "win32";

	if (!isWin32) {
		it("returns false for any command on non-Windows platforms", () => {
			// Regression: non-win32 should always return false
			expect(shouldUseWindowsShell("node")).toBe(false);
			expect(shouldUseWindowsShell("npm")).toBe(false);
			expect(shouldUseWindowsShell("npx")).toBe(false);
			expect(shouldUseWindowsShell("yarn")).toBe(false);
			expect(shouldUseWindowsShell("pnpm")).toBe(false);
			expect(shouldUseWindowsShell("/usr/bin/env")).toBe(false);
			expect(shouldUseWindowsShell("some-command.cmd")).toBe(false);
			expect(shouldUseWindowsShell("script.bat")).toBe(false);
		});

		it("returns false regardless of the command name on non-Windows", () => {
			// Even commands that would require shell on Windows must return false elsewhere
			expect(shouldUseWindowsShell("corepack")).toBe(false);
			expect(shouldUseWindowsShell("yarnpkg")).toBe(false);
		});
	} else {
		it("returns true for .cmd files on Windows", () => {
			expect(shouldUseWindowsShell("script.cmd")).toBe(true);
		});

		it("returns true for .bat files on Windows", () => {
			expect(shouldUseWindowsShell("script.bat")).toBe(true);
		});

		it("returns true for known shell commands on Windows", () => {
			expect(shouldUseWindowsShell("npm")).toBe(true);
			expect(shouldUseWindowsShell("npx")).toBe(true);
			expect(shouldUseWindowsShell("pnpm")).toBe(true);
			expect(shouldUseWindowsShell("yarn")).toBe(true);
			expect(shouldUseWindowsShell("yarnpkg")).toBe(true);
			expect(shouldUseWindowsShell("corepack")).toBe(true);
		});

		it("returns false for regular executables on Windows", () => {
			expect(shouldUseWindowsShell("node.exe")).toBe(false);
			expect(shouldUseWindowsShell("python.exe")).toBe(false);
		});
	}

	it("is case-insensitive for extension matching on Windows", () => {
		// This only matters on win32 but the test structure is safe on all platforms
		if (isWin32) {
			expect(shouldUseWindowsShell("SCRIPT.CMD")).toBe(true);
			expect(shouldUseWindowsShell("SCRIPT.BAT")).toBe(true);
			expect(shouldUseWindowsShell("NPM")).toBe(true);
		}
	});

	it("uses the basename so that path components do not affect the result", () => {
		if (isWin32) {
			expect(shouldUseWindowsShell("C:\\tools\\npm")).toBe(true);
			expect(shouldUseWindowsShell("C:\\projects\\run.bat")).toBe(true);
		} else {
			expect(shouldUseWindowsShell("/usr/local/bin/npm")).toBe(false);
		}
	});
});