import { describe, expect, test } from "vitest";
import type { Args } from "../src/cli/args.js";
import { buildInitialMessage } from "../src/cli/initial-message.js";

function createArgs(messages: string[] = []): Args {
	return {
		messages: [...messages],
		fileArgs: [],
		unknownFlags: new Map(),
		diagnostics: [],
	};
}

describe("buildInitialMessage", () => {
	test("merges piped stdin with the first CLI message into one prompt", () => {
		const parsed = createArgs(["Summarize the text given"]);
		const result = buildInitialMessage({
			parsed,
			stdinContent: "README contents\n",
		});

		expect(result.initialMessage).toBe("README contents\nSummarize the text given");
		expect(parsed.messages).toEqual([]);
	});

	test("uses stdin as the initial prompt when no CLI message is present", () => {
		const parsed = createArgs();
		const result = buildInitialMessage({
			parsed,
			stdinContent: "README contents",
		});

		expect(result.initialMessage).toBe("README contents");
		expect(parsed.messages).toEqual([]);
	});

	test("combines stdin, file text, and first CLI message in one prompt", () => {
		const parsed = createArgs(["Explain it", "Second message"]);
		const result = buildInitialMessage({
			parsed,
			stdinContent: "stdin\n",
			fileText: "file\n",
		});

		expect(result.initialMessage).toBe("stdin\nfile\nExplain it");
		expect(parsed.messages).toEqual(["Second message"]);
	});

	test("concatenates parts without inserting extra blank lines between them", () => {
		// Regression: parts must be joined with no extra separator so that each part's
		// own trailing newline determines the spacing between sections.
		const parsed = createArgs(["message"]);
		const result = buildInitialMessage({
			parsed,
			stdinContent: "stdin",
			fileText: "file",
		});

		// With no separator: "stdin" + "file" + "message" = "stdinfilemessage"
		expect(result.initialMessage).toBe("stdinfilemessage");
	});

	test("uses only stdin when no file text or message is present", () => {
		const parsed = createArgs();
		const result = buildInitialMessage({
			parsed,
			stdinContent: "only stdin",
		});
		expect(result.initialMessage).toBe("only stdin");
	});

	test("uses only fileText when no stdin or message", () => {
		const parsed = createArgs();
		const result = buildInitialMessage({
			parsed,
			fileText: "only file",
		});
		expect(result.initialMessage).toBe("only file");
	});

	test("uses only message when no stdin or file text", () => {
		const parsed = createArgs(["only message"]);
		const result = buildInitialMessage({ parsed });
		expect(result.initialMessage).toBe("only message");
	});

	test("returns undefined initialMessage when no parts are present", () => {
		const parsed = createArgs();
		const result = buildInitialMessage({ parsed });
		expect(result.initialMessage).toBeUndefined();
	});
});
