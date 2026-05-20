import { describe, expect, it } from "vitest";
import { getPiUserAgent } from "../src/utils/pi-user-agent.js";

describe("getPiUserAgent", () => {
	it("formats the user agent expected by pi.dev", () => {
		const runtime = process.versions.bun ? `bun/${process.versions.bun}` : `node/${process.version}`;
		const userAgent = getPiUserAgent("1.2.3");

		expect(userAgent).toBe(`pi/1.2.3 (${process.platform}; ${runtime}; ${process.arch})`);
		expect(userAgent).toMatch(/^pi\/[^\s()]+ \([^;()]+;\s*[^;()]+;\s*[^()]+\)$/);
	});

	it("reflects the version argument in the user agent string", () => {
		// Regression: the version parameter must appear in the output, not a hardcoded value
		const agentA = getPiUserAgent("0.50.0");
		const agentB = getPiUserAgent("1.99.5");

		expect(agentA).toContain("pi/0.50.0");
		expect(agentB).toContain("pi/1.99.5");
	});

	it("does not hardcode a fixed version in the user agent", () => {
		// Regression: hardcoding "0.0.0" would cause all version strings to be identical
		const agentOld = getPiUserAgent("0.1.0");
		const agentNew = getPiUserAgent("2.0.0");

		expect(agentOld).not.toBe(agentNew);
		expect(agentOld).toMatch(/^pi\/0\.1\.0 /);
		expect(agentNew).toMatch(/^pi\/2\.0\.0 /);
	});

	it("includes platform, runtime, and arch in the user agent", () => {
		const userAgent = getPiUserAgent("0.74.0");
		expect(userAgent).toContain(process.platform);
		expect(userAgent).toContain(process.arch);
		expect(userAgent).toMatch(/node\/|bun\//);
	});
});
