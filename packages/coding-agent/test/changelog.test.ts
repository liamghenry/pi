import { describe, expect, it } from "vitest";
import type { ChangelogEntry } from "../src/utils/changelog.js";
import { compareVersions, getNewEntries } from "../src/utils/changelog.js";

function entry(major: number, minor: number, patch: number, content = ""): ChangelogEntry {
	return { major, minor, patch, content };
}

describe("compareVersions", () => {
	it("returns positive when v1 is greater than v2 (v1 is newer)", () => {
		// The docstring says: returns 1 if v1 > v2
		expect(compareVersions(entry(2, 0, 0), entry(1, 0, 0))).toBeGreaterThan(0);
	});

	it("returns negative when v1 is less than v2 (v1 is older)", () => {
		// The docstring says: returns -1 if v1 < v2
		expect(compareVersions(entry(1, 0, 0), entry(2, 0, 0))).toBeLessThan(0);
	});

	it("returns 0 when versions are equal", () => {
		expect(compareVersions(entry(1, 2, 3), entry(1, 2, 3))).toBe(0);
	});

	it("compares minor versions correctly when major is equal", () => {
		expect(compareVersions(entry(1, 3, 0), entry(1, 2, 0))).toBeGreaterThan(0);
		expect(compareVersions(entry(1, 2, 0), entry(1, 3, 0))).toBeLessThan(0);
	});

	it("compares patch versions correctly when major and minor are equal", () => {
		expect(compareVersions(entry(1, 2, 5), entry(1, 2, 3))).toBeGreaterThan(0);
		expect(compareVersions(entry(1, 2, 3), entry(1, 2, 5))).toBeLessThan(0);
	});

	it("major version takes precedence over minor and patch", () => {
		// v1=(2,0,0) > v2=(1,9,9): major difference wins
		expect(compareVersions(entry(2, 0, 0), entry(1, 9, 9))).toBeGreaterThan(0);
	});

	it("minor version takes precedence over patch when major is equal", () => {
		// v1=(1,2,0) > v2=(1,1,9): minor difference wins
		expect(compareVersions(entry(1, 2, 0), entry(1, 1, 9))).toBeGreaterThan(0);
	});

	it("getNewEntries relies on compareVersions returning positive for newer entries", () => {
		// Regression: if compareVersions is reversed (v2-v1 instead of v1-v2),
		// getNewEntries would incorrectly return old entries as "new".
		const v200 = entry(2, 0, 0);
		const v100 = entry(1, 0, 0);
		// compareVersions(v200, v100) must be > 0 for getNewEntries to work correctly
		expect(compareVersions(v200, v100)).toBeGreaterThan(0);
	});
});

describe("getNewEntries", () => {
	const entries = [
		entry(2, 0, 0, "v2 content"),
		entry(1, 5, 0, "v1.5 content"),
		entry(1, 4, 3, "v1.4.3 content"),
		entry(1, 4, 0, "v1.4 content"),
	];

	it("returns entries newer than the last version", () => {
		const result = getNewEntries(entries, "1.4.3");
		expect(result).toHaveLength(2);
		expect(result.some((e) => e.major === 2 && e.minor === 0 && e.patch === 0)).toBe(true);
		expect(result.some((e) => e.major === 1 && e.minor === 5 && e.patch === 0)).toBe(true);
	});

	it("returns empty array when no entries are newer", () => {
		const result = getNewEntries(entries, "2.0.0");
		expect(result).toHaveLength(0);
	});

	it("returns all entries when last version is very old", () => {
		const result = getNewEntries(entries, "0.0.0");
		expect(result).toHaveLength(4);
	});

	it("excludes the exact version matching lastVersion", () => {
		const result = getNewEntries(entries, "1.5.0");
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({ major: 2, minor: 0, patch: 0 });
	});

	it("returns only entries with greater patch when major and minor match", () => {
		const result = getNewEntries(entries, "1.4.0");
		expect(result).toHaveLength(3);
		expect(result.some((e) => e.major === 1 && e.minor === 4 && e.patch === 3)).toBe(true);
	});
});