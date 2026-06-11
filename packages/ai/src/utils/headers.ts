export function headersToRecord(headers: Headers): Record<string, string> {
	const result: Record<string, string> = {};
	const entries = headers.entries();
	for (const [key, value] of entries) {
		result[key] = value;
	}
	return result;
}
