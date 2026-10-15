import { getUserPlaylists } from './playlists';
import * as clientModule from '../client';

jest.mock('../client', () => ({
	makeAuthenticatedSpotifyRequest: jest.fn().mockResolvedValue({ items: [] }),
}));

describe('spotify playlists.getUserPlaylists (#1836)', () => {
	const dummyCtx = {
		key: 'test_token',
	} as any;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('calls me/playlists when user_id is omitted', async () => {
		await getUserPlaylists(dummyCtx, { limit: 10 });

		expect(clientModule.makeAuthenticatedSpotifyRequest).toHaveBeenCalledWith(
			'me/playlists',
			dummyCtx,
			{
				method: 'GET',
				query: { limit: 10 },
			},
		);
	});

	it('calls me/playlists when user_id is "me"', async () => {
		await getUserPlaylists(dummyCtx, { user_id: 'me', limit: 20 });

		expect(clientModule.makeAuthenticatedSpotifyRequest).toHaveBeenCalledWith(
			'me/playlists',
			dummyCtx,
			{
				method: 'GET',
				query: { limit: 20 },
			},
		);
	});

	it('calls users/{user_id}/playlists when a specific user_id is given', async () => {
		await getUserPlaylists(dummyCtx, { user_id: 'spotify_user_42', limit: 5 });

		expect(clientModule.makeAuthenticatedSpotifyRequest).toHaveBeenCalledWith(
			'users/spotify_user_42/playlists',
			dummyCtx,
			{
				method: 'GET',
				query: { limit: 5 },
			},
		);
	});
});
