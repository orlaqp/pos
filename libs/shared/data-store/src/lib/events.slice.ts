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

export type SyncHealthStatus =
    | 'idle'
    | 'subscribing'
    | 'healthy'
    | 'stale'
    | 'recovering'
    | 'error';

export interface SyncHealthEntry {
    model: string;
    status: SyncHealthStatus;
    subscriberCount: number;
    tenantId?: string;
    lastSnapshotAt?: string;
    lastRecoveryAttemptAt?: string;
    lastRecoveryError?: string;
    lastError?: string;
}

export interface EventsState extends EntityState<EventEntity, string> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string;
    outboxEmpty: boolean;
    networkActive: boolean;
    lastOutboxMutationFailedAt?: string;
    syncHealth: Record<string, SyncHealthEntry>;
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
    syncHealth: {},
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
        updateSyncHealth: (
            state: EventsState,
            action: PayloadAction<{
                model: string;
                changes: Partial<SyncHealthEntry>;
            }>
        ) => {
            const current = state.syncHealth[action.payload.model] || {
                model: action.payload.model,
                status: 'idle' as SyncHealthStatus,
                subscriberCount: 0,
            };

            state.syncHealth[action.payload.model] = {
                ...current,
                ...action.payload.changes,
                model: action.payload.model,
            };
        },
        clearSyncHealth: (
            state: EventsState,
            action?: PayloadAction<{ model?: string } | undefined>
        ) => {
            const model = action?.payload?.model;
            if (!model) {
                state.syncHealth = {};
                return;
            }

            delete state.syncHealth[model];
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

export const selectAllSyncHealth = createSelector(
    getEventsState,
    (state) => state.syncHealth
);

export const selectSyncHealthByModel = (model: string) =>
    createSelector(getEventsState, (state) => state.syncHealth[model]);
