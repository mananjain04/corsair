import { search as searchTracks } from './tracks';
import { search as searchPlaylists } from './playlists';
import { search as searchArtists } from './artists';
import * as clientModule from '../client';

jest.mock('../client', () => ({
	makeAuthenticatedSpotifyRequest: jest.fn().mockResolvedValue({}),
}));

describe('spotify search endpoints default type (#1838)', () => {
	const dummyCtx = {
		key: 'test_token',
	} as any;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('tracks.search defaults type to track when omitted', async () => {
		await searchTracks(dummyCtx, { q: 'Bohemian Rhapsody' });

		expect(clientModule.makeAuthenticatedSpotifyRequest).toHaveBeenCalledWith(
			'search',
			dummyCtx,
			{
				method: 'GET',
				query: {
					q: 'Bohemian Rhapsody',
					type: 'track',
				},
			},
		);
	});

	it('playlists.search defaults type to playlist when omitted', async () => {
		await searchPlaylists(dummyCtx, { q: 'Chill Vibes' });

		expect(clientModule.makeAuthenticatedSpotifyRequest).toHaveBeenCalledWith(
			'search',
			dummyCtx,
			{
				method: 'GET',
				query: {
					q: 'Chill Vibes',
					type: 'playlist',
				},
			},
		);
	});

	it('artists.search defaults type to artist when omitted', async () => {
		await searchArtists(dummyCtx, { q: 'Queen' });

		expect(clientModule.makeAuthenticatedSpotifyRequest).toHaveBeenCalledWith(
			'search',
			dummyCtx,
			{
				method: 'GET',
				query: {
					q: 'Queen',
					type: 'artist',
				},
			},
		);
	});
});
