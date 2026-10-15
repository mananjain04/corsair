import { del as deleteCard } from './cards';
import { del as deleteBoard } from './boards';
import * as clientModule from '../client';

jest.mock('../client', () => ({
	makeTrelloRequest: jest.fn().mockResolvedValue({}),
}));

describe('trello deletion (#1869)', () => {
	it('cards.delete removes local card row from database', async () => {
		const deleteByEntityId = jest.fn().mockResolvedValue(true);
		const dummyCtx = {
			key: 'test_token',
			options: { trelloApiKey: 'test_api_key' },
			db: {
				cards: {
					deleteByEntityId,
				},
			},
		} as any;

		await deleteCard(dummyCtx, { cardId: 'card123' });

		expect(clientModule.makeTrelloRequest).toHaveBeenCalledWith(
			'cards/card123',
			'test_token',
			{ method: 'DELETE' },
			'test_api_key',
		);
		expect(deleteByEntityId).toHaveBeenCalledWith('card123');
	});

	it('boards.delete removes local board row from database', async () => {
		const deleteByEntityId = jest.fn().mockResolvedValue(true);
		const dummyCtx = {
			key: 'test_token',
			options: { trelloApiKey: 'test_api_key' },
			db: {
				boards: {
					deleteByEntityId,
				},
			},
		} as any;

		await deleteBoard(dummyCtx, { boardId: 'board123' });

		expect(clientModule.makeTrelloRequest).toHaveBeenCalledWith(
			'boards/board123',
			'test_token',
			{ method: 'DELETE' },
			'test_api_key',
		);
		expect(deleteByEntityId).toHaveBeenCalledWith('board123');
	});
});
