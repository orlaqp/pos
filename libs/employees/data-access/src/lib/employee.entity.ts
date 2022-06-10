import { Employee } from '@pos/shared/models';

export type EmployeeEntity = {
    id?: string;
    
    firstName: string;
    lastName: string | null | undefined;
    middleName: string | null | undefined;
    dob: string | null | undefined;
    phone: string | null | undefined;
    email: string | null | undefined;
    pin: string;
    roles: (string | null)[];
    active: boolean;

    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class EmployeeEntityMapper {
    static fromModel(x: Employee): EmployeeEntity {
        return {
            id: x.id,
            
            firstName: x.firstName,
            lastName: x.lastName,
            middleName: x.middleName,
            dob: x.dob,
            phone: x.phone,
            email: x.email,
            pin: x.pin,
            roles: x.roles,
            active: x.active,

            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
        };
    }
}


