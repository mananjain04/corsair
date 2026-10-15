import { createHash } from 'node:crypto';

import type { AgentQLQueryDataInput, AgentQLQueryDocumentInput } from './types';

export async function hashFileContent(file: Blob): Promise<string> {
	const buffer = Buffer.from(await file.arrayBuffer());
	return createHash('sha256').update(buffer).digest('hex');
}

function sortObjectKeys<T>(obj: T): T {
	if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
		return obj;
	}
	const sorted: Record<string, unknown> = {};
	for (const key of Object.keys(obj).sort()) {
		sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
	}
	return sorted as T;
}

export function buildQueryDataCacheKey(input: AgentQLQueryDataInput): string {
	const normalized = {
		query: input.query,
		prompt: input.prompt,
		url: input.url,
		htmlHash: input.html
			? createHash('sha256').update(input.html).digest('hex')
			: undefined,
		params: input.params ? sortObjectKeys(input.params) : undefined,
	};

	return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

export function buildQueryDocumentCacheKey(
	input: AgentQLQueryDocumentInput,
	fileHash: string,
): string {
	const normalized = {
		fileHash,
		fileName: input.fileName,
		query: input.query,
		prompt: input.prompt,
		params: input.params ? sortObjectKeys(input.params) : undefined,
	};

	return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}
