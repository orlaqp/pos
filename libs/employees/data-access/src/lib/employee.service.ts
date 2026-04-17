
import { Employee } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { API, DataStore } from '@pos/shared/amplify';
import { EmployeeEntity } from './employee.entity';
import { EmployeeEntityMapper } from './employee.entity';
import { getCurrentTenantId, stampTenant } from '@pos/auth/data-access';
import { listEmployees } from '@pos/shared/api';
import { logSyncDebug } from '@pos/shared/utils';

const normalizePin = (value: string | null | undefined) => String(value ?? '').trim();
const normalizeEmail = (value: string | null | undefined) => String(value ?? '').trim().toLowerCase();
const isDeletedFlag = (value: unknown) => value === true || value === 'true';
const isActiveRemoteEmployee = (employee: Employee | null | undefined): employee is Employee =>
    !!employee && !isDeletedFlag(employee._deleted);

const matchesCurrentTenant = (employee: Pick<Employee, 'tenantId'> | null | undefined) => {
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
        return true;
    }

    if (!employee?.tenantId) {
        return true;
    }

    return employee?.tenantId === tenantId;
};

const fetchRemoteEmployees = async (variables: Record<string, unknown>) => {
    const tenantId = getCurrentTenantId();
    const tenantScopedFilter = tenantId
        ? {
              ...(variables.filter as Record<string, unknown> | undefined),
              tenantId: { eq: tenantId },
          }
        : (variables.filter as Record<string, unknown> | undefined);
    const response = await API.graphql<{
        listEmployees?: {
            items?: Array<Employee | null> | null;
            nextToken?: string | null;
        } | null;
    }>({
        query: listEmployees,
        variables: {
            ...variables,
            ...(tenantScopedFilter ? { filter: tenantScopedFilter } : {}),
        },
        authMode: 'userPool',
    });

    return response.data?.listEmployees ?? null;
};

const fetchAllRemoteEmployees = async () => {
    const employees: Employee[] = [];
    let nextToken: string | null | undefined = undefined;

    do {
        const result = await fetchRemoteEmployees({
            limit: 100,
            ...(nextToken ? { nextToken } : {}),
        });
        employees.push(...(result?.items?.filter(isActiveRemoteEmployee) ?? []));
        nextToken = result?.nextToken;
    } while (nextToken);
    return employees;
};

export class EmployeeService {
    static async getLocalEmployees() {
        return DataStore.query(Employee);
    }

    static async getSyncedLocalEmployees(timeoutMs = 15000) {
        return new Promise<{ employees: Employee[]; initialSyncComplete: boolean }>(
            (resolve, reject) => {
            const timeout = setTimeout(() => {
                void DataStore.query(Employee)
                    .then((employees) => {
                        logSyncDebug('employees', 'observeQuery:timeout-local-snapshot', {
                            itemCount: employees.length,
                            tenantId: getCurrentTenantId() ?? null,
                            sample: employees.slice(0, 5).map((employee) => ({
                                id: employee.id,
                                tenantId: employee.tenantId,
                                email: employee.email,
                                active: employee.active,
                            })),
                        });
                    })
                    .catch((error) => {
                        logSyncDebug('employees', 'observeQuery:timeout-local-snapshot-error', {
                            message:
                                error instanceof Error ? error.message : String(error),
                        });
                    });
                subscription.unsubscribe();
                reject(new Error(`Employee DataStore sync timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            logSyncDebug('employees', 'observeQuery:wait-for-sync', {
                tenantId: getCurrentTenantId() ?? null,
                timeoutMs,
            });
            const subscription = DataStore.observeQuery(Employee).subscribe({
                next: ({ isSynced, items }) => {
                    logSyncDebug('employees', 'observeQuery:next', {
                        tenantId: getCurrentTenantId() ?? null,
                        isSynced,
                        itemCount: items.length,
                        sample: items.slice(0, 5).map((employee) => ({
                            id: employee.id,
                            tenantId: employee.tenantId,
                            email: employee.email,
                            active: employee.active,
                        })),
                    });

                    if (!isSynced && items.length === 0) {
                        return;
                    }

                    clearTimeout(timeout);
                    subscription.unsubscribe();
                    resolve({
                        employees: items,
                        initialSyncComplete: isSynced || items.length > 0,
                    });
                },
                error: (error) => {
                    clearTimeout(timeout);
                    subscription.unsubscribe();
                    reject(error);
                },
            });
        });
    }

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
            return;
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
        return EmployeeService.getLocalEmployees().then(async (employees) => {
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
            (employee) =>
                employee.active &&
                !isDeletedFlag(employee._deleted) &&
                matchesCurrentTenant(employee) &&
                normalizePin(employee.pin) === normalizedPin
        );

        if (fallbackMatch) {
            return EmployeeEntityMapper.fromModel(fallbackMatch);
        }

        return null;
    }

    static async getEmployeeByEmail(email: string) {
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return null;
        }

        const localMatch = (await DataStore.query(Employee)).find(
            (employee) =>
                employee.active &&
                !isDeletedFlag(employee._deleted) &&
                matchesCurrentTenant(employee) &&
                normalizeEmail(employee.email) === normalizedEmail
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
