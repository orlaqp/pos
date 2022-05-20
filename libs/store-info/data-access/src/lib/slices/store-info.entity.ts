import { Store } from '@pos/shared/models';

export interface StoreInfoEntity {
    id?: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    fax: string | null | undefined;
    email: string;
    disclaimer: string | null | undefined;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export class StoreInfoEntityMapper {
    static fromModel(c: Store): StoreInfoEntity {
        return {
            id: c.id,
            name: c.name,
            address: c.address,
            city: c.city,
            state: c.state,
            zipCode: c.zipCode,
            country: c.country,
            email: c.email,
            phone: c.phone,
            fax: c.fax,
            disclaimer: c.disclaimer,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }
    }
}