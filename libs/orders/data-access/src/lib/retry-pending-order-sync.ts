import { DataStore } from '@pos/shared/amplify';
import { Order, OrderStatus } from '@pos/shared/models';
import { OrderService } from './order.service';
import { PendingOrderJournalEntry } from './pending-order-journal';

export interface PendingOrderRetryEmployee {
    id: string;
    firstName: string;
    lastName: string;
}

const getEmployeeName = (employee: PendingOrderRetryEmployee) =>
    `${employee.firstName} ${employee.lastName}`.trim();

const isPaidTarget = (
    statusTarget: PendingOrderJournalEntry['statusTarget']
) => statusTarget === 'PAID' || statusTarget === OrderStatus.PAID;

const isOpenTarget = (
    statusTarget: PendingOrderJournalEntry['statusTarget']
) => statusTarget === 'OPEN' || statusTarget === OrderStatus.OPEN;

export const retryPendingOrderJournalEntrySync = async (
    entry: PendingOrderJournalEntry,
    employee: PendingOrderRetryEmployee
) => {
    await DataStore.start();

    const existingOrder = await DataStore.query(Order, entry.orderId);

    if (existingOrder) {
        if (isPaidTarget(entry.statusTarget) && existingOrder.status !== 'PAID') {
            return OrderService.closeOrder({
                id: existingOrder.id,
                by: employee,
                order: {
                    ...entry.cart,
                    id: existingOrder.id,
                    orderNo: existingOrder.orderNo || entry.cart.orderNo,
                } as typeof entry.cart,
                payments: entry.payments ?? [],
            } as any);
        }

        return DataStore.save(
            Order.copyOf(existingOrder, (draft) => {
                draft.updatedBy = {
                    id: employee.id,
                    name: getEmployeeName(employee),
                };
            })
        );
    }

    if (isOpenTarget(entry.statusTarget)) {
        return OrderService.create({
            by: employee,
            order: entry.cart,
        });
    }

    if (isPaidTarget(entry.statusTarget)) {
        const createdOrder = await OrderService.create({
            by: employee,
            order: entry.cart,
        });

        if (!createdOrder) {
            return null;
        }

        return OrderService.closeOrder({
            id: createdOrder.id,
            by: employee,
            order: {
                ...entry.cart,
                id: createdOrder.id,
                orderNo: createdOrder.orderNo || entry.cart.orderNo,
            } as typeof entry.cart,
            payments: entry.payments ?? [],
        } as any);
    }

    throw new Error(`Unsupported retry status target: ${String(entry.statusTarget)}`);
};
