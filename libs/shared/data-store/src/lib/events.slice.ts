import { sortDescListBy } from '@pos/shared/utils';
import {
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';

export const EVENTS_FEATURE_KEY = 'events';

/*
 * Update these interfaces according to your requirements.
 */
export interface EventEntity {
    id: string;
    event: string;
    data: string;
    timestamp: string;
}

export interface EventsState extends EntityState<EventEntity, string> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string;
    outboxEmpty: boolean;
    networkActive: boolean;
    lastOutboxMutationFailedAt?: string;
}

export const eventsAdapter = createEntityAdapter<EventEntity, string>({
    selectId: (event) => event.id,
});


export const initialEventsState: EventsState = eventsAdapter.getInitialState({
    loadingStatus: 'not loaded',
    error: undefined,
    outboxEmpty: true,
    networkActive: true,
    lastOutboxMutationFailedAt: undefined,
});

export const eventsSlice = createSlice({
    name: EVENTS_FEATURE_KEY,
    initialState: initialEventsState,
    reducers: {
        add: (state: EventsState, action: PayloadAction<EventEntity>) => {
            const diff = state.ids.length - 500;
            
            if (diff > 0) {
                const keysToRemove = state.ids.slice(500, state.ids.length);
                eventsAdapter.removeMany(state, keysToRemove);
            }

            eventsAdapter.addOne(state, action.payload);
        },
        remove: eventsAdapter.removeOne,
        setOutboxStatus: (state: EventsState, action: PayloadAction<boolean>) => {
            state.outboxEmpty = action.payload;
        },
        setNetworkStatus: (state: EventsState, action: PayloadAction<boolean>) => {
            state.networkActive = action.payload;
        },
        recordOutboxMutationFailed: (
            state: EventsState,
            action: PayloadAction<string>
        ) => {
            state.lastOutboxMutationFailedAt = action.payload;
        },
    }
});

/*
 * Export reducer for store configuration.
 */
export const eventsReducer = eventsSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(eventsActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const eventsActions = eventsSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllEvents);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
export const getEventsState = (
    rootState: Record<string, EventsState>
): EventsState =>
    rootState[EVENTS_FEATURE_KEY];

const eventSelectors = eventsAdapter.getSelectors<Record<string, EventsState>>(getEventsState);

export const selectAllEvents = createSelector(
    getEventsState,
    (state: EventsState) => {
        const events = eventSelectors.selectAll({ [EVENTS_FEATURE_KEY]: state });
        sortDescListBy(events, 'timestamp');
        return events;
    }
);

export const selectEventsEntities = createSelector(
    getEventsState,
    (state) => eventSelectors.selectEntities({ [EVENTS_FEATURE_KEY]: state })
);

export const selectOutboxEmpty = createSelector(
    getEventsState,
    (state) => state.outboxEmpty
);

export const selectNetworkActive = createSelector(
    getEventsState,
    (state) => state.networkActive
);

export const selectLastOutboxMutationFailedAt = createSelector(
    getEventsState,
    (state) => state.lastOutboxMutationFailedAt
);
