/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { EmployeeEntity } from '@pos/employees/data-access';
import { CartState, initialCartState } from '@pos/sales/data-access';
import { StationService } from '@pos/settings/data-access';
import { Order, OrderLine, OrderStatus } from '@pos/shared/models';
import { Alert } from 'react-native';

export interface OrderEntity {
    id: string;
    orderNo: string;
    subtotal: number;
    tax: number;
    total: number;
    status: OrderStatus | keyof typeof OrderStatus;
    employeeId: string;
    employeeName: string;
    lines?: OrderLineEntity[] | null;
    orderDate?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface OrderLineEntity {
    identifier: string;
    productId: string;
    barcode: string | null | undefined;
    sku: string | null | undefined;
    productName: string;
    unitOfMeasure: string;
    quantity: number;
    tax: number;
    price: number;
    discountType?: string | null;
    discountValue?: number | null;
}

export class OrderEntityMapper {
    static fromModel(p: Order): OrderEntity {
        return {
            id: p.id,
            orderNo: p.orderNo,
            subtotal: p.subtotal,
            tax: p.tax,
            total: p.total,
            status: p.status,
            employeeId: p.employeeId,
            employeeName: p.employeeName,
            lines: p.lines?.filter((i) => i !== null).map((i) =>
                OrderEntityMapper.fromLine(i!)
            ),
            orderDate: p.orderDate,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }

    static asCartState(o: OrderEntity): CartState {
        const state: CartState = { ...initialCartState };

        state.id = o.id;
        state.orderNo = o.orderNo;
        state.footer = {
            discount: 0,
            subtotal: o.subtotal,
            tax: o.tax,
            total: o.total,
        };
        state.header = {
            orderDate: o.orderDate || new Date().toISOString(),
            orderNumber: o.id,
            status: o.status,
            employeeId: o.employeeId,
            employeeName: o.employeeName,
        };
        state.items = o.lines?.map((i) => ({
            quantity: i?.quantity,
            identifier: i?.identifier,
            product: {
                id: i.productId,
                name: i?.productName,
                price: i?.price,
                unitOfMeasure: i?.unitOfMeasure,
                barcode: i.barcode,
                sku: i.sku,
            },
        }));
        state.selected = initialCartState.selected;
        
        return state;
    }
    
    static fromLine(l: OrderLine): OrderLineEntity {
        return {
            identifier: l.identifier,
            productId: l.productId,
            barcode: l.barcode,
            sku: l.sku,
            productName: l.productName,
            quantity: l.quantity,
            tax: 0,
            price: l.price,
            unitOfMeasure: l.unitOfMeasure,
        };
    }

    static async fromRefundedCart(employee: EmployeeEntity, cart: CartState) {
        const state: CartState = { ...initialCartState };

        if (!cart.header) {
            Alert.alert('Cart header is missing, cannot recreate the order');
        }
        const header = cart.header!;

        state.header = {
            orderDate: header.orderDate,
            orderNumber: header.orderNumber,
            status: header.status,
            employeeId: employee.id!,
            employeeName: `${employee.firstName} ${employee.lastName}`,
        };

        state.orderNo = await StationService.getNextOrderNumber(employee);
        state.items = cart.items
            .filter((i) => i.quantity > 0)
            ?.map((i) => ({
                quantity: i?.quantity,
                id: i?.id,
                product: {
                    id: i.product.id,
                    name: i?.product.name,
                    price: i?.product.price,
                    unitOfMeasure: i?.product.unitOfMeasure,
                    barcode: i.product.barcode,
                    sku: i.product.sku,
                },
            }));

        const total = state.items.reduce(
            (prev, next) => prev + next.product.price * next.quantity,
            0
        );

        state.footer = {
            discount: 0,
            subtotal: total,
            tax: cart.footer.tax,
            total: total,
        };

        return state;
    }
}
