import { deleteComment } from './comments';
import * as clientModule from '../client';

jest.mock('../client', () => ({
	makeFigmaRequest: jest.fn().mockResolvedValue({}),
}));

describe('figma comments.delete (#1870)', () => {
	it('removes the local comment row from database on delete', async () => {
		const deleteByEntityId = jest.fn().mockResolvedValue(true);
		const dummyCtx = {
			key: 'test_token',
			db: {
				comments: {
					deleteByEntityId,
				},
			},
		} as any;

		await deleteComment(dummyCtx, {
			file_key: 'file123',
			comment_id: 'comment456',
		});

		expect(clientModule.makeFigmaRequest).toHaveBeenCalledWith(
			'v1/files/file123/comments/comment456',
			'test_token',
			{ method: 'DELETE' },
		);
		expect(deleteByEntityId).toHaveBeenCalledWith('comment456');
	});
});
