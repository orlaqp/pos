import moment from 'moment';
import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { InventoryCount, InventoryCountLine, InventoryReceive, InventoryReceiveLine } from '@pos/shared/models';
import { inventoryCountActions } from './count/inventory-count.slice';
import { InventoryCountMapper } from './count/inventory-count.entity';
import { inventoryReceiveActions } from './receive/inventory-receive.slice';
import { InventoryReceiveMapper } from './receive/inventory-receive.entity';
import { InventoryCountLineMapper } from './count/inventory-count-line.entity';
import { InventoryReceiveLineMapper } from './receive/inventory-receive-line.entity';
import { sortDescListBy } from '@pos/shared/utils';

export const syncInventoryCounts = (dispatch: Dispatch) => {
    console.log('Syncing inventory counts to the store');
    DataStore.query(InventoryCount).then((counts) =>
        updateInventoryCountStore(dispatch, counts)
    );
};

export const syncInventoryCountLines = (dispatch: Dispatch) => {
    console.log('Syncing inventory count lines to the store');
    DataStore.query(InventoryCountLine).then((lines) =>
        updateInventoryLineCountStore(dispatch, lines)
    );
};

export const syncInventoryReceives = (dispatch: Dispatch) => {
    console.log('Syncing inventory receives to the store');
    DataStore.query(InventoryReceive).then((receives) =>
        updateInventoryReceiveStore(dispatch, receives)
    );
};

export const syncInventoryReceiveLines = (dispatch: Dispatch) => {
    console.log('Syncing inventory receive lines to the store');
    DataStore.query(InventoryReceiveLine).then((lines) =>
        updateInventoryReceiveLineStore(dispatch, lines)
    );
};

export const subscribeToInventoryCountChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(InventoryCount).subscribe(({ isSynced, items }) => {
        console.log('Inventory count changes detected');
        if (!isSynced) return;
        updateInventoryCountStore(dispatch, items);
    });
}


export const subscribeToInventoryCountLineChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(InventoryCountLine).subscribe(({ isSynced, items }) => {
        console.log('Inventory count line changes detected');
        if (!isSynced) return;
        updateInventoryLineCountStore(dispatch, items);
    });
}

export const subscribeToInventoryReceiveChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(InventoryReceive).subscribe(({ isSynced, items }) => {
        console.log('Inventory receive changes detected');
        if (!isSynced) return;
        updateInventoryReceiveStore(dispatch, items);
    });
}

export const subscribeToInventoryReceiveLineChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(InventoryReceiveLine).subscribe(({ isSynced, items }) => {
        console.log('Inventory receive line changes detected');
        if (!isSynced) return;
        updateInventoryReceiveLineStore(dispatch, items);
    });
}

const updateInventoryCountStore = (dispatch: Dispatch, items: InventoryCount[]) => {
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
