import { describe, expect, it } from "vitest";
import { getPiUserAgent } from "../src/utils/pi-user-agent.js";

describe("getPiUserAgent", () => {
	it("formats the user agent expected by pi.dev", () => {
		const runtime = process.versions.bun ? `bun/${process.versions.bun}` : `node/${process.version}`;
		const userAgent = getPiUserAgent("1.2.3");

		expect(userAgent).toBe(`pi/1.2.3 (${process.platform}; ${runtime}; ${process.arch})`);
		expect(userAgent).toMatch(/^pi\/[^\s()]+ \([^;()]+;\s*[^;()]+;\s*[^()]+\)$/);
	});

	it("includes the provided version in the user agent string", () => {
		// Regression: getPiUserAgent must use the version argument, not hardcode "0.0.0".
		expect(getPiUserAgent("1.2.3")).toContain("pi/1.2.3");
		expect(getPiUserAgent("0.74.0")).toContain("pi/0.74.0");
		expect(getPiUserAgent("2.0.0-beta.1")).toContain("pi/2.0.0-beta.1");
	});

	it("does not hardcode any version in the user agent string", () => {
		// Ensure each call reflects the given version, not a static constant.
		const agentA = getPiUserAgent("1.0.0");
		const agentB = getPiUserAgent("2.0.0");
		expect(agentA).not.toBe(agentB);
		expect(agentA).toContain("pi/1.0.0");
		expect(agentB).toContain("pi/2.0.0");
	});
});
