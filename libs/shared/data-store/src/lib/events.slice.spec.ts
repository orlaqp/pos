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
});
