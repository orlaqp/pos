import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Employee } from '@pos/shared/models';
import { employeesActions } from './slices/employees.slice';
import { EmployeeEntityMapper } from './employee.entity';
import { sortListBy } from '@pos/shared/utils';

export const syncEmployees = (dispatch: Dispatch) => {
    console.log('Syncing employees to the store');
    DataStore.query(Employee).then((employees) => updateStore(dispatch, employees));
};

export const subscribeToEmployeeChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(Employee).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            console.log('Employee changes detected');
            updateStore(dispatch, items);
        }
    });
};

const updateStore = (dispatch: Dispatch, items: Employee[]) => {
    sortListBy(items, 'firstName');
    dispatch(
        employeesActions.setAll(items.map((b) => EmployeeEntityMapper.fromModel(b)))
    );
};
