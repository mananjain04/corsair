import { getComments } from './posts';
import * as clientModule from '../client';

jest.mock('../client', () => ({
	makeRedditRequest: jest.fn(),
}));

describe('reddit posts.getComments (#1839)', () => {
	it('handles listing when t3 post child is missing (e.g. deleted post)', async () => {
		(clientModule.makeRedditRequest as jest.Mock).mockResolvedValue([
			{
				kind: 'Listing',
				data: {
					children: [], // No t3 post child
					after: null,
					before: null,
				},
			},
			{
				kind: 'Listing',
				data: {
					children: [],
					after: null,
					before: null,
				},
			},
		]);

		const dummyCtx = {
			key: 'test_token',
			db: {},
		} as any;

		const result = await getComments(dummyCtx, { post_id: 'deleted_post_123' });

		expect(result.post).toBeNull();
		expect(result.comments).toEqual([]);
	});

	it('parses post when t3 post child is present', async () => {
		const mockPostData = {
			id: 'post_123',
			name: 't3_post_123',
			title: 'Sample Post Title',
			selftext: 'Sample body text',
			url: 'https://reddit.com/r/test/post_123',
			author: 'test_user',
			subreddit: 'test',
			subreddit_name_prefixed: 'r/test',
			score: 10,
			ups: 10,
			downs: 0,
			upvote_ratio: 0.95,
			num_comments: 0,
			over_18: false,
			spoiler: false,
			stickied: false,
			created_utc: 1600000000,
			permalink: '/r/test/comments/post_123',
			thumbnail: 'default',
		};

		(clientModule.makeRedditRequest as jest.Mock).mockResolvedValue([
			{
				kind: 'Listing',
				data: {
					children: [
						{
							kind: 't3',
							data: mockPostData,
						},
					],
					after: null,
					before: null,
				},
			},
			{
				kind: 'Listing',
				data: {
					children: [],
					after: null,
					before: null,
				},
			},
		]);

		const dummyCtx = {
			key: 'test_token',
			db: {},
		} as any;

		const result = await getComments(dummyCtx, { post_id: 'post_123' });

		expect(result.post).not.toBeNull();
		expect(result.post?.id).toBe('post_123');
	});
});
