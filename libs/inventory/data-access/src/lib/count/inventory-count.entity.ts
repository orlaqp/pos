import { EmployeeEntity } from '@pos/employees/data-access';
import { InventoryCount, InventoryCountLine, InventoryCountStatus } from '@pos/shared/models';
import { InventoryCountLineDTO } from './inventory-count-line.entity';

export type InventoryCountDTO = {
    id?: string;
    comments: string | null | undefined;
    status: InventoryCountStatus | keyof typeof InventoryCountStatus;
    lines: InventoryCountLineDTO[];
    createdBy: {
        id?: string;
        name?: string;
    }
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};

export class InventoryCountMapper {
    static newCount(employee: EmployeeEntity): InventoryCountDTO {
        return {
            status: 'IN_PROGRESS',
            comments: 'n/a',
            lines: [],
            createdBy: {
                id: employee.id,
                name: `${employee.firstName} ${employee.lastName}`
            }
        }
    }

    static fromModel(x: InventoryCount, lines: InventoryCountLineDTO[]): InventoryCountDTO {
        return {
            id: x.id,
            comments: x.comments,
            status: x.status,
            lines,
            createdBy: {
                id: x.createdBy.id,
                name: x.createdBy.name
            },
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
        };
    }

    static fromLine(x: InventoryCountLine): InventoryCountLineDTO {
        return {
            id: x.id,
            inventoryCountLineInventoryCountId: x.inventoryCountLineInventoryCountId,
            productId: x.productId,
            productName: x.productName,
            unitOfMeasure: x.unitOfMeasure,
            current: x.current,
            newCount: x.newCount,
            comments: x.comments,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
        };
    }

    static composeInventoryItems(
        counts: InventoryCountDTO[],
        lines: InventoryCountLineDTO[]
    ): InventoryCountDTO[] {
        return counts.map((c) => ({
            ...c,
            lines: lines?.filter((l) => l.inventoryCountLineInventoryCountId === c.id),
        }));
    }
}


