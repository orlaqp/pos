
import { Employee } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { employeesActions } from './slices/employees.slice';
import { EmployeeEntity } from './employee.entity';

export class EmployeeService {
    static async save(dispatch: Dispatch<any>, employee: EmployeeEntity) {
        if (!employee.id) {
            const entity = new Employee(employee);
            const res = await DataStore.save(entity);

            employee.id = res.id;

            return dispatch(employeesActions.add(employee));
        }
        
        const existing = await DataStore.query(Employee, employee.id);

        if (!existing) {
            return console.log(`It seems that employee: ${employee.id} has been removed`);
        }

        await DataStore.save(
            Employee.copyOf(existing, updated => {
                updated.firstName = existing.firstName;
                updated.lastName = existing.lastName;
                updated.middleName = existing.middleName;
                updated.dob = existing.dob;
                updated.phone = existing.phone;
                updated.email = existing.email;
                updated.pin = existing.pin;
                updated.roles = existing.roles;
                updated.active = existing.active;
            })
        );
        
        return dispatch(employeesActions.update({ id: employee.id, changes: employee }));
    }

    static getAll() {
        return DataStore.query(Employee);
    }

    static async delete(id: string) {
        const item = await DataStore.query(Employee, id);
        if (!item)
            return console.error(`Employee Id: ${id} not found`);
        
        return DataStore.delete(item);
    }
}
