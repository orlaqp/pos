import moment from 'moment';
import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { InventoryCount, InventoryCountLine, InventoryReceive, InventoryReceiveLine } from '@pos/shared/models';
import { inventoryCountActions } from './count/inventory-count.slice';
import { InventoryCountMapper } from './count/inventory-count.entity';
import { inventoryReceiveActions } from './receive/inventory-receive.slice';
import { InventoryReceiveMapper } from './receive/inventory-receive.entity';
import { InventoryCountLineMapper } from './count/inventory-count-line.entity';
import { InventoryReceiveLineMapper } from './receive/inventory-receive-line.entity';
import {
    logSyncDebug,
    sortDescListBy,
    startSyncMeasure,
    trackSyncSubscription,
} from '@pos/shared/utils';

export const syncInventoryCounts = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('inventory.counts', 'sync');
    DataStore.query(InventoryCount).then((counts) => {
        finish({ itemCount: counts.length });
        updateInventoryCountStore(dispatch, counts);
    });
};

export const syncInventoryCountLines = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('inventory.countLines', 'sync');
    DataStore.query(InventoryCountLine).then((lines) => {
        finish({ itemCount: lines.length });
        updateInventoryLineCountStore(dispatch, lines);
    });
};

export const syncInventoryReceives = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('inventory.receives', 'sync');
    DataStore.query(InventoryReceive).then((receives) => {
        finish({ itemCount: receives.length });
        updateInventoryReceiveStore(dispatch, receives);
    });
};

export const syncInventoryReceiveLines = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('inventory.receiveLines', 'sync');
    DataStore.query(InventoryReceiveLine).then((lines) => {
        finish({ itemCount: lines.length });
        updateInventoryReceiveLineStore(dispatch, lines);
    });
};

export const subscribeToInventoryCountChanges = (dispatch: Dispatch) => {
    const release = trackSyncSubscription('inventory.counts.observeQuery');
    const subscription = DataStore.observeQuery(InventoryCount).subscribe(({ isSynced, items }) => {
        logSyncDebug('inventory.counts.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        if (!isSynced) return;
        updateInventoryCountStore(dispatch, items);
    });
    return {
        unsubscribe() {
            subscription.unsubscribe();
            release();
        },
    };
};


export const subscribeToInventoryCountLineChanges = (dispatch: Dispatch) => {
    const release = trackSyncSubscription('inventory.countLines.observeQuery');
    const subscription = DataStore.observeQuery(InventoryCountLine).subscribe(({ isSynced, items }) => {
        logSyncDebug('inventory.countLines.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        if (!isSynced) return;
        updateInventoryLineCountStore(dispatch, items);
    });
    return {
        unsubscribe() {
            subscription.unsubscribe();
            release();
        },
    };
};

export const subscribeToInventoryReceiveChanges = (dispatch: Dispatch) => {
    const release = trackSyncSubscription('inventory.receives.observeQuery');
    const subscription = DataStore.observeQuery(InventoryReceive).subscribe(({ isSynced, items }) => {
        logSyncDebug('inventory.receives.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        if (!isSynced) return;
        updateInventoryReceiveStore(dispatch, items);
    });
    return {
        unsubscribe() {
            subscription.unsubscribe();
            release();
        },
    };
};

export const subscribeToInventoryReceiveLineChanges = (dispatch: Dispatch) => {
    const release = trackSyncSubscription('inventory.receiveLines.observeQuery');
    const subscription = DataStore.observeQuery(InventoryReceiveLine).subscribe(({ isSynced, items }) => {
        logSyncDebug('inventory.receiveLines.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        if (!isSynced) return;
        updateInventoryReceiveLineStore(dispatch, items);
    });
    return {
        unsubscribe() {
            subscription.unsubscribe();
            release();
        },
    };
};

const updateInventoryCountStore = (dispatch: Dispatch, items: InventoryCount[]) => {
    logSyncDebug('inventory.counts', 'updateStore', {
        itemCount: items.length,
    });
    sortDescListBy(items, 'createdAt');
    const thirtyDaysBefore = moment().subtract(30, 'days').toISOString();
    
    dispatch(
        inventoryCountActions.setAll(
            items
                .filter(i => i.createdAt && i.createdAt >= thirtyDaysBefore)
                .map((i) => InventoryCountMapper.fromModel(i, []))
        )
    );
};

const updateInventoryLineCountStore = (dispatch: Dispatch, items: InventoryCountLine[]) => {
    logSyncDebug('inventory.countLines', 'updateStore', {
        itemCount: items.length,
    });
    sortDescListBy(items, 'createdAt');
    const thirtyDaysBefore = moment().subtract(30, 'days').toISOString();

    dispatch(
        inventoryCountActions.setLines(
            items
                .filter(i => i.createdAt && i.createdAt >= thirtyDaysBefore)
                .map((i) => InventoryCountLineMapper.fromModel(i))
        )
    );
};


const updateInventoryReceiveStore = (dispatch: Dispatch, items: InventoryReceive[]) => {
    logSyncDebug('inventory.receives', 'updateStore', {
        itemCount: items.length,
    });
    sortDescListBy(items, 'createdAt');
    const thirtyDaysBefore = moment().subtract(30, 'days').toISOString();

    dispatch(
        inventoryReceiveActions.setAll(
            items
                .filter(i => i.createdAt && i.createdAt >= thirtyDaysBefore)
                .map((i) => InventoryReceiveMapper.fromModel(i, []))
        )
    );
};

const updateInventoryReceiveLineStore = (dispatch: Dispatch, items: InventoryReceiveLine[]) => {
    logSyncDebug('inventory.receiveLines', 'updateStore', {
        itemCount: items.length,
    });
    sortDescListBy(items, 'createdAt');
    const thirtyDaysBefore = moment().subtract(30, 'days').toISOString();

    dispatch(
        inventoryReceiveActions.setLines(
            items
                .filter(i => i.createdAt && i.createdAt >= thirtyDaysBefore)
                .map((i) => InventoryReceiveLineMapper.fromLine(i))
        )
    );
};
