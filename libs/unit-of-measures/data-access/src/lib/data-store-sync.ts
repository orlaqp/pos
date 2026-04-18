import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { createSharedObserveQueryManager } from '@pos/shared/data-store';
import { UnitOfMeasure } from '@pos/shared/models';
import { sortListBy } from '@pos/shared/utils';
import { UnitOfMeasureEntityMapper } from './unit-of-measure.entity';
import { unitOfMeasuresActions } from './slices/unit-of-measures.slice';

const UNIT_OF_MEASURE_SYNC_MODEL = 'unitOfMeasures';

const updateStore = (dispatch: Dispatch, items: UnitOfMeasure[]) => {
    sortListBy(items, 'name');
    dispatch(
        unitOfMeasuresActions.setAll(
            items.map((unit) => UnitOfMeasureEntityMapper.fromModel(unit))
        )
    );
};

const unitOfMeasureSyncManager = createSharedObserveQueryManager<
    UnitOfMeasure,
    UnitOfMeasure[]
>({
    model: UNIT_OF_MEASURE_SYNC_MODEL,
    trackKey: 'unitOfMeasures.observeQuery',
    observeQuery: () => DataStore.observeQuery(UnitOfMeasure),
    mapSnapshot: ({ items }) => items,
    publishSnapshot: (dispatch, items) => {
        updateStore(dispatch, items);
    },
});

export const syncUnitOfMeasures = async (dispatch: Dispatch) => {
    updateStore(dispatch, await DataStore.query(UnitOfMeasure));
};

export const ensureUnitOfMeasureSyncHealthy = async (
    dispatch: Dispatch,
    options?: {
        staleAfterMs?: number;
        tenantId?: string;
    }
) => unitOfMeasureSyncManager.ensureHealthy(dispatch, options);

export const subscribeToUnitOfMeasureChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => unitOfMeasureSyncManager.subscribe(dispatch, tenantId);
