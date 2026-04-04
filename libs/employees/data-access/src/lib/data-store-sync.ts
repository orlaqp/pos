import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Employee } from '@pos/shared/models';
import { employeesActions } from './slices/employees.slice';
import { EmployeeEntityMapper } from './employee.entity';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure, trackSyncSubscription } from '@pos/shared/utils';

export const syncEmployees = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('employees', 'syncEmployees');
    let subscription: { unsubscribe: () => void } | undefined;
    let shouldUnsubscribeAfterSubscribe = false;
    subscription = DataStore.observeQuery(Employee).subscribe(({ items }) => {
        finish({
            itemCount: items.length,
            sample: items.slice(0, 5).map((employee) => ({
                id: employee.id,
                tenantId: employee.tenantId,
                email: employee.email,
                active: employee.active,
            })),
        });
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

export const subscribeToEmployeeChanges = (dispatch: Dispatch) => {
    const release = trackSyncSubscription('employees.observeQuery');
    const subscription = DataStore.observeQuery(Employee).subscribe(({ isSynced, items }) => {
        logSyncDebug('employees.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        updateStore(dispatch, items);
    });

    return {
        unsubscribe() {
            subscription.unsubscribe();
            release();
        },
    };
};

const updateStore = (dispatch: Dispatch, items: Employee[]) => {
    logSyncDebug('employees', 'updateStore', {
        itemCount: items.length,
        sample: items.slice(0, 5).map((employee) => ({
            id: employee.id,
            tenantId: employee.tenantId,
            email: employee.email,
            active: employee.active,
        })),
    });
    sortListBy(items, 'firstName');
    dispatch(
        employeesActions.setAll(items.map((b) => EmployeeEntityMapper.fromModel(b)))
    );
};
