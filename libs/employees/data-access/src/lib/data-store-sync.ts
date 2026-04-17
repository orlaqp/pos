import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Employee } from '@pos/shared/models';
import { employeesActions } from './slices/employees.slice';
import { EmployeeEntityMapper } from './employee.entity';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure, trackSyncSubscription } from '@pos/shared/utils';

const EMPLOYEE_SYNC_MODEL = 'employees';
const employeeDispatchRefs = new Map<Dispatch, number>();
let sharedEmployeeSubscription:
    | {
          unsubscribe: () => void;
      }
    | undefined;
let employeeSnapshot: Employee[] = [];

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

const getSubscriberCount = () => {
    let count = 0;
    employeeDispatchRefs.forEach((dispatchCount) => {
        count += dispatchCount;
    });
    return count;
};

type SyncHealthChanges = {
    status?: 'idle' | 'subscribing' | 'healthy' | 'stale' | 'recovering' | 'error';
    subscriberCount?: number;
};

const updateSyncHealthAction = (model: string, changes: SyncHealthChanges) => ({
    type: 'events/updateSyncHealth',
    payload: {
        model,
        changes,
    },
});

const clearSyncHealthAction = (model?: string) => ({
    type: 'events/clearSyncHealth',
    payload: model ? { model } : undefined,
});

const updateSyncHealth = (dispatch: Dispatch) => {
    dispatch(
        updateSyncHealthAction(EMPLOYEE_SYNC_MODEL, {
            status: sharedEmployeeSubscription ? 'healthy' : 'subscribing',
            subscriberCount: getSubscriberCount(),
        })
    );
};

export const syncEmployees = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('employees', 'syncEmployees');
    let subscription:
        | {
              unsubscribe: () => void;
          }
        | undefined;
    let shouldUnsubscribeAfterSubscribe = false;
    subscription = DataStore.observeQuery(Employee).subscribe(({ items }) => {
        const activeItems = items.filter((item) =>
            isNotDeleted(item as { _deleted?: boolean | null })
        );
        finish({
            itemCount: activeItems.length,
            sample: activeItems.slice(0, 5).map((employee) => ({
                id: employee.id,
                tenantId: employee.tenantId,
                email: employee.email,
                active: employee.active,
            })),
        });
        updateStore(dispatch, activeItems);
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
    const currentCount = employeeDispatchRefs.get(dispatch) || 0;
    employeeDispatchRefs.set(dispatch, currentCount + 1);

    if (!sharedEmployeeSubscription) {
        const release = trackSyncSubscription('employees.observeQuery');
        const subscription = DataStore.observeQuery(Employee).subscribe(({ isSynced, items }) => {
            const activeItems = items.filter((item) =>
                isNotDeleted(item as { _deleted?: boolean | null })
            );
            logSyncDebug('employees.observeQuery', 'update', {
                isSynced,
                itemCount: activeItems.length,
            });
            employeeSnapshot = activeItems;
            employeeDispatchRefs.forEach((_, activeDispatch) => {
                updateStore(activeDispatch, activeItems);
                if (isSynced) {
                    activeDispatch(employeesActions.markInitialSyncComplete(true));
                }
            });
        });

        sharedEmployeeSubscription = {
            unsubscribe() {
                subscription.unsubscribe();
                release();
                employeeSnapshot = [];
                sharedEmployeeSubscription = undefined;
            },
        };
    } else if (employeeSnapshot.length > 0) {
        updateStore(dispatch, employeeSnapshot);
    }

    updateSyncHealth(dispatch);

    return {
        unsubscribe() {
            const nextCount = (employeeDispatchRefs.get(dispatch) || 1) - 1;

            if (nextCount <= 0) {
                employeeDispatchRefs.delete(dispatch);
            } else {
                employeeDispatchRefs.set(dispatch, nextCount);
            }

            if (employeeDispatchRefs.size === 0) {
                sharedEmployeeSubscription?.unsubscribe();
                dispatch(clearSyncHealthAction(EMPLOYEE_SYNC_MODEL));
                return;
            }

            updateSyncHealth(dispatch);
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
