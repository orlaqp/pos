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
    timezone?: string;
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
            timezone: c.timezone,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }
    }
}

type StoreInfoLike = Pick<
    StoreInfoEntity,
    'address' | 'city' | 'state' | 'zipCode' | 'phone' | 'updatedAt' | 'createdAt'
>;

const STORE_PLACEHOLDERS = {
    address: 'Update in settings',
    city: 'Update in settings',
    state: 'NA',
    zipCode: '00000',
    phone: '000-000-0000',
} as const;

const getTimestamp = (value?: string | null) => {
    if (!value) {
        return 0;
    }

    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
};

export const isStoreInfoIncomplete = (store?: Partial<StoreInfoLike> | null) => {
    if (!store) {
        return true;
    }

    return (
        !store.address ||
        store.address === STORE_PLACEHOLDERS.address ||
        !store.city ||
        store.city === STORE_PLACEHOLDERS.city ||
        !store.state ||
        store.state === STORE_PLACEHOLDERS.state ||
        !store.zipCode ||
        store.zipCode === STORE_PLACEHOLDERS.zipCode ||
        !store.phone ||
        store.phone === STORE_PLACEHOLDERS.phone
    );
};

export const selectPreferredStore = <T extends StoreInfoLike>(stores: T[]) => {
    return stores.reduce<T | undefined>((best, candidate) => {
        if (!best) {
            return candidate;
        }

        const bestComplete = !isStoreInfoIncomplete(best);
        const candidateComplete = !isStoreInfoIncomplete(candidate);

        if (bestComplete !== candidateComplete) {
            return candidateComplete ? candidate : best;
        }

        const bestUpdated = Math.max(getTimestamp(best.updatedAt), getTimestamp(best.createdAt));
        const candidateUpdated = Math.max(
            getTimestamp(candidate.updatedAt),
            getTimestamp(candidate.createdAt)
        );

        return candidateUpdated > bestUpdated ? candidate : best;
    }, undefined);
};
