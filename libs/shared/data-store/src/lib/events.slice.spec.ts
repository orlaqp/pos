import {
  eventsActions,
  eventsAdapter,
  eventsReducer,
  initialEventsState,
} from './events.slice';

describe('events reducer', () => {
  it('returns initial state', () => {
    expect(eventsReducer(undefined, { type: '' })).toEqual(initialEventsState);
  });

  it('adds and removes events', () => {
    let state = eventsReducer(
      undefined,
      eventsActions.add({
        id: 'e1',
        event: 'TEST',
        data: '{}',
        timestamp: '2026-03-13T10:00:00.000Z',
      })
    );
    expect(eventsAdapter.getSelectors().selectById(state, 'e1')).toBeTruthy();

    state = eventsReducer(state, eventsActions.remove('e1'));
    expect(eventsAdapter.getSelectors().selectById(state, 'e1')).toBeUndefined();
  });

  it('tracks and clears sync health entries', () => {
    let state = eventsReducer(
      undefined,
      eventsActions.updateSyncHealth({
        model: 'products',
        changes: {
          status: 'healthy',
          subscriberCount: 2,
          tenantId: 'tenant-1',
          lastSnapshotAt: '2026-04-13T12:00:00.000Z',
        },
      })
    );

    expect(state.syncHealth.products).toEqual({
      model: 'products',
      status: 'healthy',
      subscriberCount: 2,
      tenantId: 'tenant-1',
      lastSnapshotAt: '2026-04-13T12:00:00.000Z',
    });

    state = eventsReducer(
      state,
      eventsActions.updateSyncHealth({
        model: 'products',
        changes: {
          status: 'recovering',
          lastRecoveryAttemptAt: '2026-04-13T12:01:00.000Z',
        },
      })
    );

    expect(state.syncHealth.products).toEqual({
      model: 'products',
      status: 'recovering',
      subscriberCount: 2,
      tenantId: 'tenant-1',
      lastSnapshotAt: '2026-04-13T12:00:00.000Z',
      lastRecoveryAttemptAt: '2026-04-13T12:01:00.000Z',
    });

    state = eventsReducer(
      state,
      eventsActions.clearSyncHealth({ model: 'products' })
    );
    expect(state.syncHealth.products).toBeUndefined();

    state = eventsReducer(
      eventsReducer(
        undefined,
        eventsActions.updateSyncHealth({
          model: 'orders',
          changes: {
            status: 'healthy',
            subscriberCount: 1,
          },
        })
      ),
      eventsActions.clearSyncHealth()
    );

    expect(state.syncHealth).toEqual({});
  });
});
