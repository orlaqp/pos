import moment from 'moment';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { createSharedObserveQueryManager } from '@pos/shared/data-store';
import {
    InventoryCount,
    InventoryCountLine,
    InventoryReceive,
    InventoryReceiveLine,
} from '@pos/shared/models';
import {
    logSyncDebug,
    sortDescListBy,
    startSyncMeasure,
} from '@pos/shared/utils';
import { InventoryCountMapper } from './count/inventory-count.entity';
import { inventoryCountActions } from './count/inventory-count.slice';
import { InventoryCountLineMapper } from './count/inventory-count-line.entity';
import { InventoryReceiveMapper } from './receive/inventory-receive.entity';
import { inventoryReceiveActions } from './receive/inventory-receive.slice';
import { InventoryReceiveLineMapper } from './receive/inventory-receive-line.entity';

const RECENT_WINDOW_DAYS = 30;

const getRecentThreshold = () =>
    moment().subtract(RECENT_WINDOW_DAYS, 'days').toISOString();

const filterRecent = <
    T extends {
        createdAt?: string | null;
    }
>(
    items: T[]
) => {
    const recentThreshold = getRecentThreshold();
    return items.filter((item) => item.createdAt && item.createdAt >= recentThreshold);
};

const updateInventoryCountStore = (dispatch: Dispatch, items: InventoryCount[]) => {
    logSyncDebug('inventory.counts', 'updateStore', {
        itemCount: items.length,
    });
    sortDescListBy(items, 'createdAt');
    dispatch(
        inventoryCountActions.setAll(
            filterRecent(items).map((item) => InventoryCountMapper.fromModel(item, []))
        )
    );
};

const updateInventoryLineCountStore = (
    dispatch: Dispatch,
    items: InventoryCountLine[]
) => {
    logSyncDebug('inventory.countLines', 'updateStore', {
        itemCount: items.length,
    });
    sortDescListBy(items, 'createdAt');
    dispatch(
        inventoryCountActions.setLines(
            filterRecent(items).map((item) => InventoryCountLineMapper.fromModel(item))
        )
    );
};

const updateInventoryReceiveStore = (
    dispatch: Dispatch,
    items: InventoryReceive[]
) => {
    logSyncDebug('inventory.receives', 'updateStore', {
        itemCount: items.length,
    });
    sortDescListBy(items, 'createdAt');
    dispatch(
        inventoryReceiveActions.setAll(
            filterRecent(items).map((item) => InventoryReceiveMapper.fromModel(item, []))
        )
    );
};

const updateInventoryReceiveLineStore = (
    dispatch: Dispatch,
    items: InventoryReceiveLine[]
) => {
    logSyncDebug('inventory.receiveLines', 'updateStore', {
        itemCount: items.length,
    });
    sortDescListBy(items, 'createdAt');
    dispatch(
        inventoryReceiveActions.setLines(
            filterRecent(items).map((item) => InventoryReceiveLineMapper.fromLine(item))
        )
    );
};

const inventoryCountSyncManager = createSharedObserveQueryManager<
    InventoryCount,
    InventoryCount[]
>({
    model: 'inventoryCounts',
    trackKey: 'inventory.counts.observeQuery',
    observeQuery: () => DataStore.observeQuery(InventoryCount),
    mapSnapshot: ({ isSynced, items }) => {
        logSyncDebug('inventory.counts.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        return items;
    },
    publishSnapshot: (dispatch, items) => {
        updateInventoryCountStore(dispatch, items);
    },
});

const inventoryCountLineSyncManager = createSharedObserveQueryManager<
    InventoryCountLine,
    InventoryCountLine[]
>({
    model: 'inventoryCountLines',
    trackKey: 'inventory.countLines.observeQuery',
    observeQuery: () => DataStore.observeQuery(InventoryCountLine),
    mapSnapshot: ({ isSynced, items }) => {
        logSyncDebug('inventory.countLines.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        return items;
    },
    publishSnapshot: (dispatch, items) => {
        updateInventoryLineCountStore(dispatch, items);
    },
});

const inventoryReceiveSyncManager = createSharedObserveQueryManager<
    InventoryReceive,
    InventoryReceive[]
>({
    model: 'inventoryReceives',
    trackKey: 'inventory.receives.observeQuery',
    observeQuery: () => DataStore.observeQuery(InventoryReceive),
    mapSnapshot: ({ isSynced, items }) => {
        logSyncDebug('inventory.receives.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        return items;
    },
    publishSnapshot: (dispatch, items) => {
        updateInventoryReceiveStore(dispatch, items);
    },
});

const inventoryReceiveLineSyncManager = createSharedObserveQueryManager<
    InventoryReceiveLine,
    InventoryReceiveLine[]
>({
    model: 'inventoryReceiveLines',
    trackKey: 'inventory.receiveLines.observeQuery',
    observeQuery: () => DataStore.observeQuery(InventoryReceiveLine),
    mapSnapshot: ({ isSynced, items }) => {
        logSyncDebug('inventory.receiveLines.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        return items;
    },
    publishSnapshot: (dispatch, items) => {
        updateInventoryReceiveLineStore(dispatch, items);
    },
});

export const syncInventoryCounts = async (dispatch: Dispatch) => {
    const finish = startSyncMeasure('inventory.counts', 'sync');
    const items = await DataStore.query(InventoryCount);
    finish({ itemCount: items.length });
    updateInventoryCountStore(dispatch, items);
};

export const syncInventoryCountLines = async (dispatch: Dispatch) => {
    const finish = startSyncMeasure('inventory.countLines', 'sync');
    const items = await DataStore.query(InventoryCountLine);
    finish({ itemCount: items.length });
    updateInventoryLineCountStore(dispatch, items);
};

export const syncInventoryReceives = async (dispatch: Dispatch) => {
    const finish = startSyncMeasure('inventory.receives', 'sync');
    const items = await DataStore.query(InventoryReceive);
    finish({ itemCount: items.length });
    updateInventoryReceiveStore(dispatch, items);
};

export const syncInventoryReceiveLines = async (dispatch: Dispatch) => {
    const finish = startSyncMeasure('inventory.receiveLines', 'sync');
    const items = await DataStore.query(InventoryReceiveLine);
    finish({ itemCount: items.length });
    updateInventoryReceiveLineStore(dispatch, items);
};

export const subscribeToInventoryCountChanges = (dispatch: Dispatch) =>
    inventoryCountSyncManager.subscribe(dispatch);

export const subscribeToInventoryCountLineChanges = (dispatch: Dispatch) =>
    inventoryCountLineSyncManager.subscribe(dispatch);

export const subscribeToInventoryReceiveChanges = (dispatch: Dispatch) =>
    inventoryReceiveSyncManager.subscribe(dispatch);

export const subscribeToInventoryReceiveLineChanges = (dispatch: Dispatch) =>
    inventoryReceiveLineSyncManager.subscribe(dispatch);
