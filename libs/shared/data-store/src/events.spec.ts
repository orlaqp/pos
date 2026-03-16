jest.mock('@pos/shared/amplify', () => ({
  Hub: {
    listen: jest.fn(),
  },
}));

jest.mock('./sync', () => ({
  syncModelsWithStore: jest.fn(),
}));

jest.mock('react-native-uuid', () => ({
  v4: jest.fn(() => 'event-id'),
}));

import { Hub } from '@pos/shared/amplify';

import { subscribeEvents } from './events';

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
});
