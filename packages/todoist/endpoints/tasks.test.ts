import { move as moveTask } from './tasks';
import * as clientModule from '../client';

jest.mock('../client', () => ({
	makeTodoistRequest: jest.fn().mockResolvedValue({ id: 'task-123', content: 'test task' }),
}));

describe('todoist tasks.move (#1840)', () => {
	it('routes tasks.move to tasks/{id}/move endpoint', async () => {
		const upsertByEntityId = jest.fn().mockResolvedValue(true);
		const dummyCtx = {
			key: 'test_token',
			db: {
				tasks: {
					upsertByEntityId,
				},
			},
		} as any;

		const input = {
			id: 'task-123',
			project_id: 'proj-456',
			section_id: 'sec-789',
		};

		const result = await moveTask(dummyCtx, input);

		expect(clientModule.makeTodoistRequest).toHaveBeenCalledWith(
			'tasks/task-123/move',
			'test_token',
			{
				method: 'POST',
				body: input,
			},
		);
		expect(upsertByEntityId).toHaveBeenCalledWith('task-123', {
			id: 'task-123',
			content: 'test task',
		});
		expect(result).toEqual({ id: 'task-123', content: 'test task' });
	});
});
