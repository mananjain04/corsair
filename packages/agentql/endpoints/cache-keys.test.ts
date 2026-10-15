import { buildQueryDataCacheKey, buildQueryDocumentCacheKey } from './cache-keys';

describe('AgentQL cache keys (#1873)', () => {
	it('generates identical cache key regardless of param key order for queryData', () => {
		const key1 = buildQueryDataCacheKey({
			query: '{ title }',
			url: 'https://example.com',
			params: { mode: 'fast', wait_for: 1, nested: { b: 2, a: 1 } },
		});

		const key2 = buildQueryDataCacheKey({
			query: '{ title }',
			url: 'https://example.com',
			params: { wait_for: 1, mode: 'fast', nested: { a: 1, b: 2 } },
		});

		expect(key1).toBe(key2);
	});

	it('generates identical cache key regardless of param key order for queryDocument', () => {
		const key1 = buildQueryDocumentCacheKey(
			{
				file: new Blob(['test']),
				query: '{ text }',
				params: { fast: true, timeout: 5000 },
			},
			'file-hash-123',
		);

		const key2 = buildQueryDocumentCacheKey(
			{
				file: new Blob(['test']),
				query: '{ text }',
				params: { timeout: 5000, fast: true },
			},
			'file-hash-123',
		);

		expect(key1).toBe(key2);
	});
});
