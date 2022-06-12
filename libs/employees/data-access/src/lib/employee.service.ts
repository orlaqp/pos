
import { Employee } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { employeesActions } from './slices/employees.slice';
import { EmployeeEntity } from './employee.entity';
import { EmployeeEntityMapper } from '..';

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
                updated.firstName = employee.firstName;
                updated.lastName = employee.lastName;
                updated.middleName = employee.middleName;
                updated.dob = employee.dob;
                updated.phone = employee.phone;
                updated.email = employee.email;
                updated.pin = employee.pin;
                updated.roles = employee.roles;
                updated.active = employee.active;
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

    static async getEmployee(pin: string) {
        const emp = await DataStore.query(Employee, e => e.pin('eq', pin).active('eq', true));
        return emp[0] ? EmployeeEntityMapper.fromModel(emp[0]): null;
    }
}
