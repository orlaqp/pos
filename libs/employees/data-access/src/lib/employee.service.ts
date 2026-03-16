
import { Employee } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { API, DataStore } from '@pos/shared/amplify';
import { EmployeeEntity } from './employee.entity';
import { EmployeeEntityMapper } from './employee.entity';
import { stampTenant } from '@pos/auth/data-access';
import { listEmployees } from '@pos/shared/api';

const normalizePin = (value: string | null | undefined) => String(value ?? '').trim();
const normalizeEmail = (value: string | null | undefined) => String(value ?? '').trim().toLowerCase();

export class EmployeeService {
    static async save(dispatch: Dispatch<any>, employee: EmployeeEntity) {
        const { employeesActions } = require('./slices/employees.slice');

        if (!employee.id) {
            const entity = new Employee(stampTenant(employee) as never);
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
                updated.code = employee.code;
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
        const normalizedPin = normalizePin(pin);

        if (!normalizedPin) {
            return null;
        }

        const emp = await DataStore.query(Employee, (e) =>
            e.and((employee) => [employee.pin.eq(normalizedPin), employee.active.eq(true)])
        );

        if (emp[0]) {
            return EmployeeEntityMapper.fromModel(emp[0]);
        }

        const allEmployees = await DataStore.query(Employee);
        const fallbackMatch = allEmployees.find(
            (employee) => employee.active && normalizePin(employee.pin) === normalizedPin
        );

        if (fallbackMatch) {
            return EmployeeEntityMapper.fromModel(fallbackMatch);
        }

        const response = await API.graphql<{
            listEmployees?: {
                items?: Array<Employee | null> | null;
            } | null;
        }>({
            query: listEmployees,
            variables: {
                limit: 100,
            },
            authMode: 'userPool',
        });

        const remoteMatch = response.data?.listEmployees?.items?.find(
            (employee): employee is Employee =>
                !!employee && employee.active && normalizePin(employee.pin) === normalizedPin
        );

        return remoteMatch ? EmployeeEntityMapper.fromModel(remoteMatch) : null;
    }

    static async getEmployeeByEmail(email: string) {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return null;
        }

        const localMatch = (await DataStore.query(Employee)).find(
            (employee) =>
                employee.active && normalizeEmail(employee.email) === normalizedEmail
        );

        if (localMatch) {
            return EmployeeEntityMapper.fromModel(localMatch);
        }

        const response = await API.graphql<{
            listEmployees?: {
                items?: Array<Employee | null> | null;
            } | null;
        }>({
            query: listEmployees,
            variables: {
                limit: 100,
            },
            authMode: 'userPool',
        });

        const remoteMatch = response.data?.listEmployees?.items?.find(
            (employee): employee is Employee =>
                !!employee &&
                employee.active &&
                normalizeEmail(employee.email) === normalizedEmail
        );

        return remoteMatch ? EmployeeEntityMapper.fromModel(remoteMatch) : null;
    }

    static async getById(employeeId: string): Promise<(Omit<EmployeeEntity, "id"> & { id: string; }) | null> {
        const emp = await DataStore.query(Employee, e => e.id.eq(employeeId));
        return emp[0]
            ? (EmployeeEntityMapper.fromModel(emp[0]) as Omit<EmployeeEntity, 'id'> & { id: string })
            : null;
    }
}
