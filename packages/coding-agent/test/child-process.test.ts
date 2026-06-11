import { describe, expect, it } from "vitest";
import { shouldUseWindowsShell } from "../src/utils/child-process.js";

describe("shouldUseWindowsShell", () => {
	it("returns false on non-Windows platforms for regular commands", () => {
		if (process.platform === "win32") return;
		expect(shouldUseWindowsShell("node")).toBe(false);
		expect(shouldUseWindowsShell("python")).toBe(false);
		expect(shouldUseWindowsShell("/usr/bin/git")).toBe(false);
		expect(shouldUseWindowsShell("bash")).toBe(false);
	});

	it("returns false on non-Windows platforms for npm-like commands", () => {
		if (process.platform === "win32") return;
		// npm, npx, pnpm etc. only need shell: true on Windows
		expect(shouldUseWindowsShell("npm")).toBe(false);
		expect(shouldUseWindowsShell("npx")).toBe(false);
		expect(shouldUseWindowsShell("pnpm")).toBe(false);
		expect(shouldUseWindowsShell("yarn")).toBe(false);
	});

	it("returns false on non-Windows platforms for .cmd or .bat files", () => {
		if (process.platform === "win32") return;
		// .cmd and .bat extension handling is Windows-only
		expect(shouldUseWindowsShell("script.cmd")).toBe(false);
		expect(shouldUseWindowsShell("run.bat")).toBe(false);
	});

	it("returns true on Windows for .cmd files", () => {
		if (process.platform !== "win32") return;
		expect(shouldUseWindowsShell("script.cmd")).toBe(true);
	});

	it("returns true on Windows for .bat files", () => {
		if (process.platform !== "win32") return;
		expect(shouldUseWindowsShell("run.bat")).toBe(true);
	});

	it("returns true on Windows for shell-required commands like npm", () => {
		if (process.platform !== "win32") return;
		expect(shouldUseWindowsShell("npm")).toBe(true);
		expect(shouldUseWindowsShell("npx")).toBe(true);
		expect(shouldUseWindowsShell("pnpm")).toBe(true);
		expect(shouldUseWindowsShell("yarn")).toBe(true);
		expect(shouldUseWindowsShell("yarnpkg")).toBe(true);
		expect(shouldUseWindowsShell("corepack")).toBe(true);
	});

	it("returns false on Windows for regular executables that don't need shell", () => {
		if (process.platform !== "win32") return;
		expect(shouldUseWindowsShell("node")).toBe(false);
		expect(shouldUseWindowsShell("git")).toBe(false);
	});

	it("handles full paths on non-Windows by extracting the basename", () => {
		if (process.platform === "win32") return;
		expect(shouldUseWindowsShell("/usr/local/bin/npm")).toBe(false);
		expect(shouldUseWindowsShell("/usr/local/bin/python3")).toBe(false);
	});
});