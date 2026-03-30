import { Hub } from '@pos/shared/amplify';

import { subscribeEvents } from './events';

jest.mock('@pos/shared/amplify', () => ({
  Hub: {
    listen: jest.fn(),
  },
}));

jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => 'event-id'),
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

    expect(errorSpy).toHaveBeenCalledWith(
      'DataStore mutation failed: {"model":{"name":"Category"},"operation":"CREATE","element":{"id":"category-1","name":"Carnes"}}'
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
        }),
      })
    );
  });
});
