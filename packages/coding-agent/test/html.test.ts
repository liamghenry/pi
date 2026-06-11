import { describe, expect, it } from "vitest";
import { decodeHtmlEntity, decodeHtmlEntityAt } from "../src/utils/html.js";

describe("decodeHtmlEntity", () => {
	it("decodes &amp; to the ampersand character", () => {
		// Regression: &amp; must decode to "&", not "and" or any other string.
		expect(decodeHtmlEntity("amp")).toBe("&");
	});

	it("decodes &lt; to the less-than character", () => {
		expect(decodeHtmlEntity("lt")).toBe("<");
	});

	it("decodes &gt; to the greater-than character", () => {
		expect(decodeHtmlEntity("gt")).toBe(">");
	});

	it("decodes &quot; to the double-quote character", () => {
		expect(decodeHtmlEntity("quot")).toBe('"');
	});

	it("decodes &apos; to the single-quote character", () => {
		expect(decodeHtmlEntity("apos")).toBe("'");
	});

	it("decodes decimal numeric entities", () => {
		expect(decodeHtmlEntity("#65")).toBe("A");
		expect(decodeHtmlEntity("#97")).toBe("a");
		expect(decodeHtmlEntity("#38")).toBe("&");
	});

	it("decodes hexadecimal numeric entities", () => {
		expect(decodeHtmlEntity("#x41")).toBe("A");
		expect(decodeHtmlEntity("#X41")).toBe("A");
		expect(decodeHtmlEntity("#x26")).toBe("&");
	});

	it("returns undefined for unknown named entities", () => {
		expect(decodeHtmlEntity("nbsp")).toBeUndefined();
		expect(decodeHtmlEntity("mdash")).toBeUndefined();
		expect(decodeHtmlEntity("unknown")).toBeUndefined();
	});

	it("returns undefined for out-of-range code points", () => {
		expect(decodeHtmlEntity("#x200000")).toBeUndefined();
		expect(decodeHtmlEntity("#-1")).toBeUndefined();
	});
});

describe("decodeHtmlEntityAt", () => {
	it("decodes &amp; at position in a string", () => {
		// '&amp;' starts at index 0: the entity starts after '&' at index 0
		const result = decodeHtmlEntityAt("&amp;rest", 0);
		expect(result).toBeDefined();
		expect(result!.text).toBe("&");
		expect(result!.length).toBe(5); // "&amp;" is 5 chars
	});

	it("returns undefined when no semicolon found", () => {
		const result = decodeHtmlEntityAt("&amprest", 0);
		expect(result).toBeUndefined();
	});

	it("returns undefined when entity name is too long", () => {
		// Entity names longer than 15 chars (index+1 to semicolon > 16) are rejected
		const result = decodeHtmlEntityAt("&averylongentitynamehere;", 0);
		expect(result).toBeUndefined();
	});

	it("decodes entity at non-zero index", () => {
		const result = decodeHtmlEntityAt("prefix&lt;suffix", 6);
		expect(result).toBeDefined();
		expect(result!.text).toBe("<");
	});
});