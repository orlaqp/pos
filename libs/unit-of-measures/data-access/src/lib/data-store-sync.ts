import { sortListBy } from '@pos/shared/utils';
import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { UnitOfMeasure } from '@pos/shared/models';
import { unitOfMeasuresActions } from './slices/unit-of-measures.slice';
import { UnitOfMeasureEntityMapper } from './unit-of-measure.entity';

export const syncUnitOfMeasures = (dispatch: Dispatch) => {
    let subscription: { unsubscribe: () => void } | undefined;
    let shouldUnsubscribeAfterSubscribe = false;
    subscription = DataStore.observeQuery(UnitOfMeasure).subscribe(({ items }) => {
        updateStore(dispatch, items);
        if (subscription) {
            subscription.unsubscribe();
            return;
        }

        shouldUnsubscribeAfterSubscribe = true;
    });

    if (shouldUnsubscribeAfterSubscribe) {
        subscription.unsubscribe();
    }
};

export const subscribeToUnitOfMeasureChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(UnitOfMeasure).subscribe(
        ({ isSynced, items }) => {
            void isSynced;
            updateStore(dispatch, items);
        }
    );
};

const updateStore = (dispatch: Dispatch, items: UnitOfMeasure[]) => {
    sortListBy(items, 'name');
    dispatch(
        unitOfMeasuresActions.setAll(
            items.map((u) => UnitOfMeasureEntityMapper.fromModel(u))
        )
    );
};
