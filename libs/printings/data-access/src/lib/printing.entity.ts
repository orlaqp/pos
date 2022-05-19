import { Printer } from '@pos/shared/models';

export type PrintingEntity = {
    id?: string;
    identifier: string;
    interfaceType: string;
    ip: string;
    model?: string;
    alias?: string | null;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class PrintingEntityMapper {
    static fromModel(c: Printer): PrintingEntity {
        return {
            id: c.id,
            identifier: c.identifier,
            interfaceType: c.interfaceType,
            ip: c.ip,
            model: c.model,
            alias: c.alias,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        };
    }
}
