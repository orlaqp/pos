import { Dispatch } from '@reduxjs/toolkit';
import { logSyncDebug } from '@pos/shared/utils';

export const syncModelsWithStore = (dispatch: Dispatch, model: string) => {
    void dispatch;
    logSyncDebug('model-sync', 'hub-triggered-sync', { model });
};

// const updateStore = (dispatch: Dispatch, model: any, action: (models: unknown[]) => AnyAction) => {
//     console.log('Syncing products to the store');
//     DataStore.query(model).then((items) =>
//         dispatch(action(items))
//     );
// };
