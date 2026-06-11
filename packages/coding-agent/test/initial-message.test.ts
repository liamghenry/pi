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

		expect(result.initialMessage).toBe("README contents\n\n\nSummarize the text given");
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

		expect(result.initialMessage).toBe("stdin\n\n\nfile\n\n\nExplain it");
		expect(parsed.messages).toEqual(["Second message"]);
	});

	test("joins multiple parts with double newlines as separator", () => {
		const parsed = createArgs(["The question"]);
		const result = buildInitialMessage({
			parsed,
			stdinContent: "stdin content",
			fileText: "file content",
		});

		expect(result.initialMessage).toBe("stdin content\n\nfile content\n\nThe question");
		expect(parsed.messages).toEqual([]);
	});

	test("returns single part without separator when only one part", () => {
		const parsed = createArgs(["Only message"]);
		const result = buildInitialMessage({ parsed });

		expect(result.initialMessage).toBe("Only message");
	});
});
