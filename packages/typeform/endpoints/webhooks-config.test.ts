import { deleteWebhookConfig } from './webhooks-config';
import * as clientModule from '../client';

jest.mock('../client', () => ({
	makeTypeformRequest: jest.fn().mockResolvedValue({}),
}));

describe('typeform webhook config deletion (#1844)', () => {
	it('deletes webhook config by entity_id, not DB internal id', async () => {
		const deleteByEntityId = jest.fn().mockResolvedValue(true);
		const search = jest.fn().mockResolvedValue([
			{
				id: 'db-internal-uuid-1234',
				entity_id: 'webhook-entity-id-5678',
				data: { tag: 'tag-1', form_id: 'form-1' },
			},
		]);

		const dummyCtx = {
			key: 'test_token',
			db: {
				webhookConfigs: {
					search,
					deleteByEntityId,
				},
			},
		} as any;

		await deleteWebhookConfig(dummyCtx, { form_id: 'form-1', tag: 'tag-1' });

		expect(search).toHaveBeenCalledWith({
			data: { tag: 'tag-1', form_id: 'form-1' },
		});
		expect(deleteByEntityId).toHaveBeenCalledWith('webhook-entity-id-5678');
		expect(clientModule.makeTypeformRequest).toHaveBeenCalledWith(
			'/forms/form-1/webhooks/tag-1',
			'test_token',
			{ method: 'DELETE' },
		);
	});
});
