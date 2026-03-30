
import { Employee } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { API, DataStore } from '@pos/shared/amplify';
import { EmployeeEntity } from './employee.entity';
import { EmployeeEntityMapper } from './employee.entity';
import { stampTenant } from '@pos/auth/data-access';
import { listEmployees } from '@pos/shared/api';

const normalizePin = (value: string | null | undefined) => String(value ?? '').trim();
const normalizeEmail = (value: string | null | undefined) => String(value ?? '').trim().toLowerCase();
const isDeletedFlag = (value: unknown) => value === true || value === 'true';
const isActiveRemoteEmployee = (employee: Employee | null | undefined): employee is Employee =>
    !!employee && !isDeletedFlag(employee._deleted);

const fetchRemoteEmployees = async (variables: Record<string, unknown>) => {
    const response = await API.graphql<{
        listEmployees?: {
            items?: Array<Employee | null> | null;
            nextToken?: string | null;
        } | null;
    }>({
        query: listEmployees,
        variables,
        authMode: 'userPool',
    });

    return response.data?.listEmployees ?? null;
};

const fetchAllRemoteEmployees = async () => {
    const employees: Employee[] = [];
    let nextToken: string | null | undefined = undefined;
    let page = 0;

    do {
        page += 1;
        const result = await fetchRemoteEmployees({
            limit: 100,
            ...(nextToken ? { nextToken } : {}),
        });

        console.log('[employees] remote list page', {
            page,
            itemCount: result?.items?.length ?? 0,
            nextToken: result?.nextToken ?? null,
        });
        console.log(
            '[employees] remote list sample',
            (result?.items ?? []).slice(0, 5).map((employee) => ({
                id: employee?.id ?? null,
                email: employee?.email ?? null,
                active: employee?.active ?? null,
                deleted: employee?._deleted ?? null,
                lastChangedAt: employee?._lastChangedAt ?? null,
                updatedAt: employee?.updatedAt ?? null,
            }))
        );
        employees.push(...(result?.items?.filter(isActiveRemoteEmployee) ?? []));
        nextToken = result?.nextToken;
    } while (nextToken);

    console.log('[employees] remote list total', {
        itemCount: employees.length,
    });
    return employees;
};

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
        return DataStore.query(Employee).then(async (employees) => {
            console.log('[employees] local query total', {
                itemCount: employees.length,
            });
            if (employees.length > 0) {
                return employees;
            }

            return fetchAllRemoteEmployees();
        });
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

        const result = await fetchRemoteEmployees({
            filter: {
                active: { eq: true },
                pin: { eq: normalizedPin },
            },
            limit: 20,
        });

        const remoteMatch = result?.items?.find(
            (employee): employee is Employee =>
                isActiveRemoteEmployee(employee) &&
                employee.active &&
                normalizePin(employee.pin) === normalizedPin
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

        const result = await fetchRemoteEmployees({
            filter: {
                active: { eq: true },
                email: { eq: normalizedEmail },
            },
            limit: 20,
        });

        const remoteMatch = result?.items?.find(
            (employee): employee is Employee =>
                isActiveRemoteEmployee(employee) &&
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
