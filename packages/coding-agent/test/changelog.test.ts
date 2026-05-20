import { describe, expect, it } from "vitest";
import { compareVersions, getNewEntries } from "../src/utils/changelog.js";
import type { ChangelogEntry } from "../src/utils/changelog.js";

function makeEntry(major: number, minor: number, patch: number, content = ""): ChangelogEntry {
	return { major, minor, patch, content };
}

describe("compareVersions", () => {
	it("returns a positive number when v1 is greater than v2 by patch", () => {
		// Regression: v2-v1 reversal would return negative here
		const result = compareVersions(makeEntry(1, 0, 2), makeEntry(1, 0, 1));
		expect(result).toBeGreaterThan(0);
	});

	it("returns a negative number when v1 is less than v2 by patch", () => {
		// Regression: v2-v1 reversal would return positive here
		const result = compareVersions(makeEntry(1, 0, 1), makeEntry(1, 0, 2));
		expect(result).toBeLessThan(0);
	});

	it("returns zero when v1 equals v2", () => {
		expect(compareVersions(makeEntry(1, 2, 3), makeEntry(1, 2, 3))).toBe(0);
	});

	it("returns a positive number when v1 is greater by minor version", () => {
		const result = compareVersions(makeEntry(1, 2, 0), makeEntry(1, 1, 9));
		expect(result).toBeGreaterThan(0);
	});

	it("returns a negative number when v1 is less by minor version", () => {
		const result = compareVersions(makeEntry(1, 1, 9), makeEntry(1, 2, 0));
		expect(result).toBeLessThan(0);
	});

	it("returns a positive number when v1 is greater by major version", () => {
		const result = compareVersions(makeEntry(2, 0, 0), makeEntry(1, 9, 9));
		expect(result).toBeGreaterThan(0);
	});

	it("returns a negative number when v1 is less by major version", () => {
		const result = compareVersions(makeEntry(1, 9, 9), makeEntry(2, 0, 0));
		expect(result).toBeLessThan(0);
	});

	it("major version difference dominates minor and patch", () => {
		// v1 has larger minor+patch but smaller major – result should still be negative
		const result = compareVersions(makeEntry(1, 9, 9), makeEntry(2, 0, 0));
		expect(result).toBeLessThan(0);
	});

	it("sorts a version array into ascending order using compareVersions", () => {
		// Regression: reversed comparison would produce descending order
		const versions = [
			makeEntry(2, 0, 0),
			makeEntry(1, 0, 0),
			makeEntry(1, 5, 3),
			makeEntry(1, 5, 2),
		];
		const sorted = [...versions].sort(compareVersions);
		expect(sorted.map((v) => `${v.major}.${v.minor}.${v.patch}`)).toEqual([
			"1.0.0",
			"1.5.2",
			"1.5.3",
			"2.0.0",
		]);
	});
});

describe("getNewEntries", () => {
	const entries: ChangelogEntry[] = [
		makeEntry(1, 0, 0, "Initial release"),
		makeEntry(1, 1, 0, "Minor update"),
		makeEntry(2, 0, 0, "Major release"),
	];

	it("returns entries newer than the given version", () => {
		const result = getNewEntries(entries, "1.0.0");
		expect(result.length).toBeGreaterThan(0);
		// All returned entries must be strictly newer than 1.0.0
		for (const entry of result) {
			const cmp = compareVersions(entry, makeEntry(1, 0, 0));
			expect(cmp).toBeGreaterThan(0);
		}
	});

	it("returns no entries when already at the latest version", () => {
		const result = getNewEntries(entries, "2.0.0");
		expect(result).toHaveLength(0);
	});

	it("returns all entries when the given version is lower than all of them", () => {
		const result = getNewEntries(entries, "0.0.0");
		expect(result).toHaveLength(entries.length);
	});

	it("returns an empty array for an empty entry list", () => {
		expect(getNewEntries([], "1.0.0")).toEqual([]);
	});
});