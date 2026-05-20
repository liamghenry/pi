import { describe, expect, it } from "vitest";
import { decodeHtmlEntity, decodeHtmlEntityAt } from "../src/utils/html.js";

describe("decodeHtmlEntity", () => {
	describe("named entities", () => {
		it("decodes &amp; to an ampersand character", () => {
			// Regression: must return "&", not "and"
			expect(decodeHtmlEntity("amp")).toBe("&");
		});

		it("decodes &lt; to a less-than sign", () => {
			expect(decodeHtmlEntity("lt")).toBe("<");
		});

		it("decodes &gt; to a greater-than sign", () => {
			expect(decodeHtmlEntity("gt")).toBe(">");
		});

		it("decodes &quot; to a double-quote character", () => {
			expect(decodeHtmlEntity("quot")).toBe('"');
		});

		it("decodes &apos; to a single-quote character", () => {
			expect(decodeHtmlEntity("apos")).toBe("'");
		});

		it("returns undefined for unknown named entities", () => {
			expect(decodeHtmlEntity("nbsp")).toBeUndefined();
			expect(decodeHtmlEntity("copy")).toBeUndefined();
			expect(decodeHtmlEntity("unknown")).toBeUndefined();
		});
	});

	describe("numeric decimal entities", () => {
		it("decodes &#65; to 'A'", () => {
			expect(decodeHtmlEntity("#65")).toBe("A");
		});

		it("decodes &#38; to '&'", () => {
			expect(decodeHtmlEntity("#38")).toBe("&");
		});

		it("decodes &#128512; to emoji", () => {
			expect(decodeHtmlEntity("#128512")).toBe("😀");
		});

		it("returns undefined for out-of-range code points", () => {
			expect(decodeHtmlEntity("#-1")).toBeUndefined();
			expect(decodeHtmlEntity("#1114112")).toBeUndefined(); // 0x110000 - just above max
		});
	});

	describe("numeric hexadecimal entities", () => {
		it("decodes &#x41; to 'A'", () => {
			expect(decodeHtmlEntity("#x41")).toBe("A");
		});

		it("decodes &#x26; to '&'", () => {
			expect(decodeHtmlEntity("#x26")).toBe("&");
		});

		it("decodes uppercase &#X41; to 'A'", () => {
			expect(decodeHtmlEntity("#X41")).toBe("A");
		});

		it("returns undefined for malformed hex entity", () => {
			expect(decodeHtmlEntity("#xGGGG")).toBeUndefined();
		});
	});
});

describe("decodeHtmlEntityAt", () => {
	it("decodes &amp; at position 0 in '&amp;'", () => {
		// The string passed is without the leading '&'; index 0 points at '&'
		const html = "&amp;";
		const result = decodeHtmlEntityAt(html, 0);
		expect(result).toBeDefined();
		expect(result?.text).toBe("&");
		expect(result?.length).toBe(5); // "&amp;" is 5 chars
	});

	it("decodes &lt; embedded in a longer string", () => {
		const html = "a&lt;b";
		const result = decodeHtmlEntityAt(html, 1);
		expect(result?.text).toBe("<");
	});

	it("returns undefined when there is no semicolon", () => {
		const html = "&amp no semicolon";
		const result = decodeHtmlEntityAt(html, 0);
		expect(result).toBeUndefined();
	});

	it("returns undefined when the entity span exceeds 16 characters", () => {
		const html = "&averylongentityname;";
		const result = decodeHtmlEntityAt(html, 0);
		expect(result).toBeUndefined();
	});

	it("decodes &#65; correctly via decodeHtmlEntityAt", () => {
		const html = "&#65;";
		const result = decodeHtmlEntityAt(html, 0);
		expect(result?.text).toBe("A");
	});
});