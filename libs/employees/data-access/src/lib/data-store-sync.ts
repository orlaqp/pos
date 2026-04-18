import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { createSharedObserveQueryManager } from '@pos/shared/data-store';
import { Employee } from '@pos/shared/models';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure } from '@pos/shared/utils';
import { EmployeeEntityMapper } from './employee.entity';
import { employeesActions } from './slices/employees.slice';

const EMPLOYEE_SYNC_MODEL = 'employees';

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

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
        employeesActions.setAll(
            items.map((employee) => EmployeeEntityMapper.fromModel(employee))
        )
    );
};

const employeeSyncManager = createSharedObserveQueryManager<Employee, Employee[]>({
    model: EMPLOYEE_SYNC_MODEL,
    trackKey: 'employees.observeQuery',
    observeQuery: () => DataStore.observeQuery(Employee),
    mapSnapshot: ({ isSynced, items }) => {
        const activeItems = items.filter((item) =>
            isNotDeleted(item as { _deleted?: boolean | null })
        );

        logSyncDebug('employees.observeQuery', 'update', {
            isSynced,
            itemCount: activeItems.length,
        });

        return activeItems;
    },
    publishSnapshot: (dispatch, items, context) => {
        updateStore(dispatch, items);
        if (context.isSynced) {
            dispatch(employeesActions.markInitialSyncComplete(true));
        }
    },
});

export const syncEmployees = async (dispatch: Dispatch) => {
    const finish = startSyncMeasure('employees', 'syncEmployees');
    const items = (await DataStore.query(Employee)).filter((item) =>
        isNotDeleted(item as { _deleted?: boolean | null })
    );
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
};

export const ensureEmployeeSyncHealthy = async (
    dispatch: Dispatch,
    options?: {
        staleAfterMs?: number;
        tenantId?: string;
    }
) => employeeSyncManager.ensureHealthy(dispatch, options);

export const subscribeToEmployeeChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => employeeSyncManager.subscribe(dispatch, tenantId);
