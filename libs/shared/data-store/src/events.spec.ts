import { Hub } from '@pos/shared/amplify';

import { subscribeEvents } from './events';

jest.mock('@pos/shared/amplify', () => ({
  Hub: {
    listen: jest.fn(),
  },
}));

describe('subscribeEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs outbox mutation failures', async () => {
    const dispatch = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    subscribeEvents(dispatch);

    const listener = (Hub.listen as jest.Mock).mock.calls[0][1];
    await listener({
      source: 'datastore',
      payload: {
        event: 'outboxMutationFailed',
        data: {
          model: { name: 'Category' },
          operation: 'CREATE',
          element: { id: 'category-1', name: 'Carnes' },
        },
      },
    });

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'events/add',
        payload: expect.objectContaining({
          event: 'outboxMutationFailed',
          data: 'model=Category operation=CREATE id=category-1',
        }),
      })
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'DataStore mutation failed: model=Category operation=CREATE id=category-1'
    );

    errorSpy.mockRestore();
  });

  it('records modelSynced events without triggering a second store sync wave', async () => {
    const dispatch = jest.fn();

    subscribeEvents(dispatch);

    const listener = (Hub.listen as jest.Mock).mock.calls[0][1];
    await listener({
      source: 'datastore',
      payload: {
        event: 'modelSynced',
        data: {
          model: { name: 'Product' },
          isFullSync: true,
          isDeltaSync: false,
          counts: { new: 1, updated: 0, deleted: 0 },
        },
      },
    });

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'events/add',
        payload: expect.objectContaining({
          event: 'modelSynced',
          data: 'model=Product full=yes delta=no new=1 updated=0 deleted=0',
        }),
      })
    );
  });

  it('does not record noisy hub events that are not part of diagnostics history', async () => {
    const dispatch = jest.fn();

    subscribeEvents(dispatch);

    const listener = (Hub.listen as jest.Mock).mock.calls[0][1];
    await listener({
      source: 'datastore',
      payload: {
        event: 'ready',
        data: {
          models: ['Product', 'Category'],
        },
      },
    });

    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'events/add',
      })
    );
  });
});
