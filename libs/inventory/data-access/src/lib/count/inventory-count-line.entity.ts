import { ProductEntity } from '@pos/products/data-access';
import {
    InventoryCount,
    InventoryCountLine,
    Product,
} from '@pos/shared/models';
import { Selectable, Transform } from '@pos/shared/utils';
import { Dictionary } from '@reduxjs/toolkit';
import { InventoryCountDTO } from './inventory-count.entity';

export type InventoryCountLineDTO = {
    id?: string;
    productId: string;
    productName: string;
    unitOfMeasure: string;
    current: number;
    newCount?: number;
    comments: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    inventoryCountLineInventoryCountId: string | null | undefined;
};

export class InventoryCountLineMapper {
    static fromProduct(x: Product): InventoryCountLineDTO {
        return {
            productId: x.id,
            productName: x.name,
            unitOfMeasure: x.unitOfMeasure,
            comments: '',
            current: x.quantity,
            newCount: undefined,
            inventoryCountLineInventoryCountId: '',
        };
    }

    static fromModel(x: InventoryCountLine): InventoryCountLineDTO {
        return {
            id: x.id,
            productId: x.productId,
            productName: x.productName,
            unitOfMeasure: x.unitOfMeasure,
            current: x.current,
            newCount: x.newCount,
            comments: x.comments,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
            inventoryCountLineInventoryCountId:
                x.inventoryCountLineInventoryCountId,
        };
    }

    static toSelectable(
        products: Dictionary<ProductEntity>,
        count?: InventoryCountDTO
    ): Dictionary<Selectable<InventoryCountLineDTO>> {
        if (!products) return {};

        const linesObj = Transform.toObject<InventoryCountLineDTO>(count?.lines, 'productId');
        const output: Dictionary<Selectable<InventoryCountLineDTO>> = {};

        Object.entries(products).reduce((obj, [id, p]) => {
            const line = linesObj[id];

            if (count?.status === 'COMPLETED' && !line) return obj;

            obj[id!] = {
                selected: !!line,
                payload: !line
                    ? InventoryCountLineMapper.fromProduct(p!)
                    : line,
            };

            return obj;
        }, output);

        return output;
    }
}
