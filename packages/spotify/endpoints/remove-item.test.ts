import { removeItem } from './playlists';
import * as clientModule from '../client';

jest.mock('../client', () => ({
	makeAuthenticatedSpotifyRequest: jest.fn().mockResolvedValue({ snapshot_id: 'snapshot-abc' }),
}));

describe('spotify playlists.removeItem (#1837)', () => {
	it('sends explicit body without playlist_id on DELETE request', async () => {
		const dummyCtx = {
			key: 'test_token',
		} as any;

		const input = {
			playlist_id: 'playlist-123',
			tracks: [{ uri: 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh' }],
			snapshot_id: 'prev-snapshot',
		};

		const result = await removeItem(dummyCtx, input);

		expect(clientModule.makeAuthenticatedSpotifyRequest).toHaveBeenCalledWith(
			'playlists/playlist-123/tracks',
			dummyCtx,
			{
				method: 'DELETE',
				body: {
					tracks: [{ uri: 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh' }],
					snapshot_id: 'prev-snapshot',
				},
			},
		);
		expect(result).toEqual({ snapshot_id: 'snapshot-abc' });
	});
});
