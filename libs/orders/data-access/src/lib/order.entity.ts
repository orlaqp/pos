/* eslint-disable @nx/enforce-module-boundaries */
import { EmployeeEntity } from '@pos/employees/data-access';
import type { CartState } from '@pos/sales/data-access';
import { StationService } from '@pos/settings/data-access';
import { Order, OrderLine, OrderStatus, Payment, PaymentType } from '@pos/shared/models';

export interface PaymentInfoEntity {
    employeeId?: string;
    employeeName?: string;
    payments?: PaymentEntity[];
}

export interface RefundInfoEntity {
    employeeId?: string;
    employeeName?: string;
    comments?: string;
}

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
    payments?: PaymentEntity[] | null;
    paymentInfo?: PaymentInfoEntity | null;
    refundInfo?: RefundInfoEntity | null;
    orderDate?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface PaymentEntity {
    type: PaymentType | keyof typeof PaymentType;
    amount: number;
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
    isEBTEligible?: boolean | null;
    ebtPaidAmount?: number | null;
    nonEbtPaidAmount?: number | null;
}

export class OrderEntityMapper {
    private static getInitialCartState(): CartState {
        return {
            id: undefined,
            header: undefined,
            items: [],
            footer: {
                discount: 0,
                subtotal: 0,
                tax: 0,
                total: 0,
            },
            selected: undefined,
        };
    }

    private static cleanCartProductName(name?: string) {
        if (!name) return '';
        return name.replace(/^(?:NON-EBT|EBT)\s+/i, '');
    }

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
            // payments: p.paymentInfo?.payments?.filter(p => !!p).map(p => OrderEntityMapper.fromPayment(p)),
            paymentInfo: {
                employeeId: p.paymentInfo?.employeeId,
                employeeName: p.paymentInfo?.employeeName,
                payments: p.paymentInfo?.payments
                    ?.filter((payment): payment is Payment => !!payment)
                    .map((payment) => OrderEntityMapper.fromPayment(payment)),
            },
            refundInfo: {
                employeeId: p.refundInfo?.employeeId,
                employeeName: p.refundInfo?.employeeName,
                comments: p.refundInfo?.comments || undefined,
            },
            orderDate: p.orderDate,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
    
    static asCartState(o: OrderEntity): CartState {
        const state: CartState = OrderEntityMapper.getInitialCartState();

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
                name: OrderEntityMapper.cleanCartProductName(i?.productName),
                price: i?.price,
                unitOfMeasure: i?.unitOfMeasure,
                barcode: i.barcode,
                sku: i.sku,
                isEBTEligible: i.isEBTEligible ?? false,
            },
        })) || [];
        state.payments = o.payments?.map(p => ({
            type: p.type,
            amount: p.amount
        }));
        state.selected = undefined;
        
        return state;
    }
    
    static fromLine(l: OrderLine): OrderLineEntity {
        return {
            identifier: l.identifier,
            productId: l.productId,
            barcode: l.barcode,
            sku: l.sku,
            productName: OrderEntityMapper.cleanCartProductName(l.productName),
            quantity: l.quantity,
            tax: 0,
            price: l.price,
            unitOfMeasure: l.unitOfMeasure,
            isEBTEligible: l.isEBTEligible ?? false,
            ebtPaidAmount: l.ebtPaidAmount ?? 0,
            nonEbtPaidAmount: l.nonEbtPaidAmount ?? l.price * l.quantity,
        };
    }

    static async fromRefundedCart(employee: EmployeeEntity, cart: CartState) {
        const state: CartState = OrderEntityMapper.getInitialCartState();

        const header = cart.header || {
            orderDate: new Date().toISOString(),
            orderNumber: cart.id || '',
            status: 'OPEN',
            employeeId: employee.id!,
            employeeName: `${employee.firstName} ${employee.lastName}`,
        };

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
                id: i?.identifier,
                product: {
                    id: i.product.id,
                    name: i?.product.name,
                    price: i?.product.price,
                    unitOfMeasure: i?.product.unitOfMeasure,
                    barcode: i.product.barcode,
                    sku: i.product.sku,
                    isEBTEligible: i.product.isEBTEligible ?? false,
                },
            }));

        const total = state.items.reduce(
            (prev, next) => prev + next.product.price * next.quantity,
            0
        );

        state.footer = {
            discount: 0,
            subtotal: total,
            tax: cart.footer?.tax || 0,
            total: total,
        };

        return state;
    }

    static fromPayment(p: Payment): PaymentEntity {
        return {
            type: p?.type,
            amount: p?.amount
        };
    }
}
