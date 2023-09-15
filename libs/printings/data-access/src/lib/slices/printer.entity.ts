import { Printer } from '@pos/shared/models';

// Printer entity
// another comment
export type PrinterEntity = {
    id?: string;
    deviceId: string;
    identifier: string;
    interfaceType: string;
    ip: string;
    model: string | null | undefined;
    alias?: string | null;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class PrinterEntityMapper {
    static fromModel(c: Printer): PrinterEntity {
        return {
            id: c.id,
            deviceId: c.deviceId,
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
