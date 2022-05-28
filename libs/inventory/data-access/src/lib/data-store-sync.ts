import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { InventoryCount, InventoryCountLine, InventoryReceive, InventoryReceiveLine } from '@pos/shared/models';
import { inventoryCountActions } from './count/inventory-count.slice';
import { InventoryCountMapper } from './count/inventory-count.entity';
import { inventoryReceiveActions } from './receive/inventory-receive.slice';
import { InventoryReceiveMapper } from './receive/inventory-receive.entity';

export const syncInventoryCounts = (dispatch: Dispatch) => {
    console.log('Syncing inventory counts to the store');
    DataStore.query(InventoryCount).then((counts) =>
        dispatch(
            inventoryCountActions.setAll(
                counts.map((c) => InventoryCountMapper.fromModel(c, []))
            )
        )
    );
};

export const syncInventoryCountLines = (dispatch: Dispatch) => {
    console.log('Syncing inventory count lines to the store');
    DataStore.query(InventoryCountLine).then((lines) =>
        dispatch(
            inventoryCountActions.setLines(
                lines.map((l) => InventoryCountMapper.fromLine(l))
            )
        )
    );
};

export const syncInventoryReceives = (dispatch: Dispatch) => {
    console.log('Syncing inventory receives to the store');
    DataStore.query(InventoryReceive).then((receives) =>
        dispatch(
            inventoryReceiveActions.setAll(
                receives.map((r) => InventoryReceiveMapper.fromModel(r, []))
            )
        )
    );
};

export const syncInventoryReceiveLines = (dispatch: Dispatch) => {
    console.log('Syncing inventory receive lines to the store');
    DataStore.query(InventoryReceiveLine).then((lines) =>
        dispatch(
            inventoryReceiveActions.setLines(
                lines.map((l) => InventoryReceiveMapper.fromLine(l))
            )
        )
    );
};
