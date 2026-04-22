import { MutableModel } from '@aws-amplify/datastore';
/* eslint-disable @nx/enforce-module-boundaries */
import {
    DiscountDefinition,
    GlobalSettings,
    Order,
    OrderDiscountDefinitionSnapshot,
    OrderLine,
    OrderMetaData,
    OrderRefund,
    OrderRefundLine,
    OrderStatus,
    Payment,
    PaymentInfo,
    Product,
    RefundInfo,
} from '@pos/shared/models';
import { API, DataStore } from '@pos/shared/amplify';
import { OrderEntity, OrderEntityMapper, OrderLineEntity } from './order.entity';
import { CartPayment, CartState } from '@pos/sales/data-access';
import { Alert } from 'react-native';
import moment from 'moment';
import uuid from 'react-native-uuid';
import { EmployeeEntity } from '@pos/employees/data-access';
import { StationService } from '@pos/settings/data-access';
import { isOrderNumber, sortDescListBy, sortListBy } from '@pos/shared/utils';
import {
    buildEbtAllocations,
    getLineTotal,
    validateEbtPayment,
    EbtLineAllocation,
} from './ebt-allocation';
import { requireCurrentTenantId, stampTenant } from '@pos/auth/data-access';
import type {
    AppliedDiscountDetail,
    AppliedDiscountSummary,
    PricingApprovalEvent,
    PricingPreviewResult,
} from '@pos/discounts/domain';
import { PricingEngine } from '@pos/discounts/domain';
import {
    getOrder,
    updateOrder,
} from '@pos/shared/api';

export interface FilterRequest {
    status: OrderStatus;
    filter?: string;
}

export interface CreateOrderRequest {
    by: Omit<EmployeeEntity, 'id'> & { id: string };
    order: CartState;
}

export interface UpdateOrderRequest extends CreateOrderRequest {
    id: string;
    order: Omit<CartState, 'id'>;
}

export interface CloseOrderRequest extends UpdateOrderRequest {
    payments: CartPayment[];
}

export interface RefundOrderRequest extends UpdateOrderRequest {
    refundedLines: { identifier: string; quantity: number }[]
    refundPayments?: CartPayment[];
    comments?: string;
}

export interface UpsertOrderRequest extends CreateOrderRequest {
    status?: OrderStatus | keyof typeof OrderStatus;
    paymentInfo: PaymentInfo;
    refundInfo: RefundInfo;
}

export interface CreatePaidOrderRequest extends CreateOrderRequest {
    payments: CartPayment[];
}

interface RefundLineComputation {
    identifier: string;
    productId: string;
    productName: string;
    unitOfMeasure: string;
    categoryId?: string | null;
    quantityRefunded: number;
    unitRefundAmount: number;
    lineRefundAmount: number;
}

interface RefundPricingComputation {
    refundAmount: number;
    refundLines: RefundLineComputation[];
    currentSubtotal: number;
    currentDiscountTotal: number;
    currentTax: number;
    currentTotal: number;
    newTotal: number;
}

export type OrderTicketCopyType = 'CUSTOMER' | 'MERCHANT';

export interface OrderTicketPrintDetailRow {
    label: string;
    amount: number;
}

export interface OrderTicketPrintRow {
    identifier: string;
    quantity: number;
    name: string;
    amount: number;
    detailRows?: OrderTicketPrintDetailRow[];
}

export interface OrderTicketPrintSection {
    title: string;
    emptyLabel: string;
    rows: OrderTicketPrintRow[];
}

export interface OrderTicketPrintTotals {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
}

export interface OrderTicketPrintPaymentRow {
    kind: 'heading' | 'payment';
    label: string;
    amount?: number;
}

export interface OrderTicketPrintModel {
    isReceipt: boolean;
    orderId?: string;
    orderNo?: string;
    copyType?: OrderTicketCopyType;
    sections: OrderTicketPrintSection[];
    totals: OrderTicketPrintTotals;
    paymentRows: OrderTicketPrintPaymentRow[];
    promoCodes?: string[];
}

interface OrderPricingSnapshotContext {
    pricingGeneratedAt: string;
    pricingTimezone: string;
    pricingStoreId?: string | null;
    pricingStationId?: string | null;
}

type EbtPricingLineInput = {
    identifier?: string;
    quantity: number;
    price: number;
    isEBTEligible?: boolean;
    lineTotal?: number;
};

const logOrderTiming = (step: string, details?: Record<string, unknown>) => {
    void step;
    void details;
};

const buildOrderInventoryOperationId = (
    orderId: string,
    status: 'PAID' | 'REFUNDED'
) => `ORDER:${orderId}:${status}`;

const buildRefundInventoryOperationId = (
    orderId: string,
    refundId: string
) => `ORDER_REFUND:${orderId}:${refundId}`;

const REFUND_QUANTITY_EPSILON = 0.0001;
const PAYMENT_TYPES = new Set(['CASH', 'CHECK', 'CC', 'EBT']);

const normalizeRefundRequests = (
    refundedLines: Array<{ identifier: string; quantity: number }>
) =>
    refundedLines.reduce<Map<string, number>>((acc, line) => {
        const identifier = String(line.identifier || '');
        const quantity = Number(line.quantity || 0);

        if (!identifier || quantity <= 0) {
            return acc;
        }

        acc.set(identifier, roundMoney((acc.get(identifier) || 0) + quantity));
        return acc;
    }, new Map<string, number>());

const normalizePaymentType = (type: string | null | undefined) => {
    const normalized = String(type || '').trim().toUpperCase();
    return PAYMENT_TYPES.has(normalized) ? normalized : null;
};

const sumPayments = (
    payments: Array<{ amount?: number | null }> | null | undefined
) =>
    roundMoney(
        (payments || []).reduce(
            (sum, payment) => sum + Number(payment?.amount || 0),
            0
        )
    );

const allocatePaymentsToTotal = (
    payments: Array<{ type?: string | null; amount?: number | null }> | null | undefined,
    total: number
) => {
    const normalizedTotal = roundMoney(Math.max(0, Number(total || 0)));
    if (normalizedTotal <= 0) {
        return [] as CartPayment[];
    }

    const normalizedPayments = (payments || [])
        .map((payment) => ({
            type: normalizePaymentType(payment?.type),
            amount: roundMoney(Math.max(0, Number(payment?.amount || 0))),
        }))
        .filter(
            (payment): payment is { type: string; amount: number } =>
                !!payment.type && payment.amount > 0
        );

    if (!normalizedPayments.length) {
        return [];
    }

    const totalAvailable = sumPayments(normalizedPayments);
    if (totalAvailable <= 0) {
        return [];
    }

    let remaining = Math.min(normalizedTotal, totalAvailable);

    return normalizedPayments
        .map((payment, index) => {
            if (remaining <= 0) {
                return {
                    type: payment.type,
                    amount: 0,
                };
            }

            const allocated =
                index === normalizedPayments.length - 1
                    ? remaining
                    : roundMoney((payment.amount / totalAvailable) * normalizedTotal);
            const capped = Math.min(payment.amount, allocated, remaining);
            remaining = roundMoney(remaining - capped);

            return {
                type: payment.type,
                amount: capped,
            };
        })
        .filter((payment) => payment.amount > 0);
};

const normalizeRefundPayments = (
    payments: Array<{ type?: string | null; amount?: number | null }> | null | undefined
) => {
    const byType = new Map<string, number>();

    (payments || []).forEach((payment) => {
        const type = normalizePaymentType(payment?.type);
        const amount = roundMoney(Math.max(0, Number(payment?.amount || 0)));
        if (!type || amount <= 0) {
            return;
        }

        byType.set(type, roundMoney((byType.get(type) || 0) + amount));
    });

    return Array.from(byType.entries()).map(([type, amount]) => ({
        type,
        amount,
    }));
};

const getLineOriginalAmount = (line: {
    lineTotalBeforeTax?: number | null;
    lineDiscountTotal?: number | null;
    allocatedOrderDiscountTotal?: number | null;
}) =>
    roundMoney(
        Number(line.lineTotalBeforeTax || 0) +
            Number(line.lineDiscountTotal || 0) +
            Number(line.allocatedOrderDiscountTotal || 0)
    );

const getLineDiscountAmount = (line: {
    lineDiscountTotal?: number | null;
    allocatedOrderDiscountTotal?: number | null;
}) =>
    roundMoney(
        Number(line.lineDiscountTotal || 0) +
            Number(line.allocatedOrderDiscountTotal || 0)
    );

const getGraphqlErrorMessage = (result: unknown) => {
    if (!result || typeof result !== 'object') return undefined;
    if (!('errors' in result)) return undefined;
    const errors = (result as { errors?: Array<{ message?: string }> }).errors || [];
    return errors.map((error) => error?.message).filter(Boolean).join(' | ') || undefined;
};

const isFullyRefundedQuantity = (original: number, refunded: number) =>
    Math.abs(original - refunded) <= REFUND_QUANTITY_EPSILON;

const buildEbtPricingLines = (order: Omit<CartState, 'id'>): EbtPricingLineInput[] =>
    order.items.map((item, index) => {
        const identifier = item.identifier || getLineKey(item.identifier, index);
        const lineSummary = order.appliedDiscountSummary?.lineSummaries?.find(
            (summary) => summary.lineId === identifier
        );

        return {
            identifier,
            quantity: item.quantity,
            price: item.product.price,
            isEBTEligible: item.product.isEBTEligible ?? false,
            lineTotal: roundMoney(
                lineSummary?.lineTotalBeforeTax ??
                    getLineTotal(item.quantity, item.product.price)
            ),
        };
    });

const toAppliedDiscountDetailSnapshot = (
    discount: AppliedDiscountDetail
): AppliedDiscountDetail => ({
    discountApplicationId: discount.discountApplicationId,
    discountDefinitionId: discount.discountDefinitionId ?? null,
    orderDiscountSnapshotId: discount.orderDiscountSnapshotId ?? null,
    applicationType: discount.applicationType,
    scope: discount.scope,
    method: discount.method,
    name: discount.name,
    code: discount.code ?? null,
    stackMode: discount.stackMode,
    source: discount.source,
    value: discount.value,
    originalAmount: discount.originalAmount,
    discountAmount: discount.discountAmount,
    finalAmount: discount.finalAmount,
    quantityBasis: discount.quantityBasis ?? null,
    reasonCode: discount.reasonCode ?? null,
    reasonNote: discount.reasonNote ?? null,
    appliedByEmployeeId: discount.appliedByEmployeeId ?? null,
    appliedByEmployeeName: discount.appliedByEmployeeName ?? null,
    approvedByEmployeeId: discount.approvedByEmployeeId ?? null,
    approvedByEmployeeName: discount.approvedByEmployeeName ?? null,
    approvalRequired: discount.approvalRequired ?? false,
    approvalStatus: discount.approvalStatus ?? 'NOT_REQUIRED',
    approvalReference: discount.approvalReference ?? null,
    sourceSnapshot: discount.sourceSnapshot ?? null,
    appliedAt: discount.appliedAt,
});

const toPricingApprovalEventSnapshot = (
    event: PricingApprovalEvent
): PricingApprovalEvent => ({
    id: event.id,
    approvalType: event.approvalType,
    requestingEmployeeId: event.requestingEmployeeId,
    approvingEmployeeId: event.approvingEmployeeId,
    requestedAction: event.requestedAction,
    reasonCode: event.reasonCode ?? null,
    reasonNote: event.reasonNote ?? null,
    policySnapshot: event.policySnapshot ?? null,
    status: event.status,
    createdAt: event.createdAt,
});

const toAppliedDiscountSummarySnapshot = (
    summary?: AppliedDiscountSummary | null
): AppliedDiscountSummary | null =>
    summary
        ? {
              applications: summary.applications.map(toAppliedDiscountDetailSnapshot),
              approvalEvents: summary.approvalEvents.map(
                  toPricingApprovalEventSnapshot
              ),
              lineSummaries: summary.lineSummaries.map((lineSummary) => ({
                  lineId: lineSummary.lineId,
                  discounts: lineSummary.discounts.map(
                      toAppliedDiscountDetailSnapshot
                  ),
                  lineDiscountTotal: lineSummary.lineDiscountTotal,
                  allocatedOrderDiscountTotal:
                      lineSummary.allocatedOrderDiscountTotal,
                  lineTotalBeforeTax: lineSummary.lineTotalBeforeTax,
              })),
              orderLevelAdjustments: summary.orderLevelAdjustments.map(
                  toAppliedDiscountDetailSnapshot
              ),
              warnings: [...summary.warnings],
              pricingGeneratedAt: summary.pricingGeneratedAt,
          }
        : null;

const isSnapshotEligibleApplication = (discount: AppliedDiscountDetail) =>
    (discount.applicationType === 'AUTOMATIC_DISCOUNT' ||
        discount.applicationType === 'PROMO_CODE') &&
    !!discount.discountDefinitionId;

const buildOrderDiscountSnapshotId = (
    orderId: string,
    discountDefinitionId: string
) => `${orderId}:${discountDefinitionId}`;

const buildSnapshotIdMapForAppliedSummary = (
    orderId: string,
    summary?: AppliedDiscountSummary | null
) => {
    const snapshotIdByDefinitionId = new Map<string, string>();

    (summary?.applications || [])
        .filter(isSnapshotEligibleApplication)
        .forEach((discount) => {
            const discountDefinitionId = String(discount.discountDefinitionId);
            if (!snapshotIdByDefinitionId.has(discountDefinitionId)) {
                snapshotIdByDefinitionId.set(
                    discountDefinitionId,
                    buildOrderDiscountSnapshotId(orderId, discountDefinitionId)
                );
            }
        });

    return snapshotIdByDefinitionId;
};

export class OrderService {
    private static async fetchRemoteOrder(
        id: string
    ): Promise<(Order & { _version?: number | null }) | null> {
        const response = await API.graphql<{
            getOrder?: (Order & { _version?: number | null }) | null;
        }>({
            query: getOrder,
            variables: { id },
            authMode: 'userPool',
        });

        const message = getGraphqlErrorMessage(response);
        if (message) {
            throw new Error(message);
        }

        return response.data?.getOrder || null;
    }

    private static async saveRefundedOrderStatus(
        existing: Order,
        request: RefundOrderRequest,
        isFullRefund: boolean,
        currentTotals: Pick<
            RefundPricingComputation,
            'currentSubtotal' | 'currentDiscountTotal' | 'currentTax' | 'currentTotal'
        >
    ) {
        const tenantId = existing.tenantId || requireCurrentTenantId();
        const nextStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
        const refundInfo = {
            employeeId: request.by.id,
            employeeName: `${request.by.firstName} ${request.by.lastName}`,
            comments: request.comments || existing.refundInfo?.comments || null,
        };

        try {
            const remoteOrder = await OrderService.fetchRemoteOrder(existing.id);
            if (remoteOrder?.id && remoteOrder._version != null) {
                const response = await API.graphql<{
                    updateOrder?: Order | null;
                }>({
                    query: updateOrder,
                    variables: {
                        input: {
                            id: remoteOrder.id,
                            tenantId: remoteOrder.tenantId || tenantId,
                            status: nextStatus,
                            refundInfo,
                            currentSubtotal: currentTotals.currentSubtotal,
                            currentDiscountTotal: currentTotals.currentDiscountTotal,
                            currentTax: currentTotals.currentTax,
                            currentTotal: currentTotals.currentTotal,
                            _version: remoteOrder._version,
                        },
                    },
                    authMode: 'userPool',
                });

                const message = getGraphqlErrorMessage(response);
                if (message) {
                    throw new Error(message);
                }

                if (response.data?.updateOrder) {
                    return response.data.updateOrder;
                }
            }
        } catch (error) {
            console.warn(
                '[OrderService.refund] remote status update fallback to DataStore.save',
                error
            );
        }

        const updatedOrder = Order.copyOf(existing, (o) => {
            o.tenantId = tenantId;
            o.status = nextStatus;
            o.refundInfo = refundInfo;
            o.currentSubtotal = currentTotals.currentSubtotal;
            o.currentDiscountTotal = currentTotals.currentDiscountTotal;
            o.currentTax = currentTotals.currentTax;
            o.currentTotal = currentTotals.currentTotal;
        });

        return await DataStore.save(updatedOrder);
    }

    /**
     * Create a new order
     *
     * @static
     * @param {CreateOrderRequest} request
     * @return {Order} 
     * @memberof OrderService
     */
    static async create(request: CreateOrderRequest) {
        const orderId = request.order.id || String(uuid.v4());
        const order = new Order(stampTenant({
            id: orderId,
            orderNo:
                request.order.orderNo ??
                (await StationService.getNextOrderNumber(request.by)),
            status: 'OPEN',
            baseSubtotal: request.order.footer.baseSubtotal,
            subtotal: request.order.footer.subtotal,
            tax: 0,
            total: request.order.footer.total,
            currentSubtotal: request.order.footer.baseSubtotal,
            currentDiscountTotal: request.order.footer.discount,
            currentTax: 0,
            currentTotal: request.order.footer.total,
            lineDiscountTotal: request.order.footer.lineDiscountTotal,
            orderDiscountTotal: request.order.footer.orderDiscountTotal,
            discountTotal: request.order.footer.discount,
            savingsTotal: request.order.footer.savingsTotal,
            promoCodes: request.order.promoCodes.map((promo) => promo.code),
            pricingVersion: 'discounts-v1',
            pricingSnapshotHash: buildPricingSnapshotHash(request.order),
            pricingSource: request.order.footer.pricingSource,
            reconciliationStatus: request.order.footer.reconciliationStatus,
            appliedDiscountSummary: toAppliedDiscountSummarySnapshot(
                request.order.appliedDiscountSummary
            ),
            employeeId: request.by.id!,
            employeeName: `${request.by.firstName} ${request.by.lastName}`,
            lines: buildOrderLines(request.order),
            createdBy: {
                id: request.by.id,
                name: `${request.by.firstName} ${request.by.lastName}`
            },
            orderDate: moment().toISOString(),
        }) as never);

        return await DataStore.save(order);
    }

    /**
     * Allow you to update order products
     *
     * @static
     * @param {UpdateOrderRequest} request
     * @return {*}  {(Promise<Order | null>)}
     * @memberof OrderService
     */
    static async update(request: UpdateOrderRequest): Promise<Order | null> {
        const updatedOrder = await OrderService.getUpdatedOrder(request);
        
        if (!updatedOrder) return null;

        return await DataStore.save(updatedOrder);
    }

    static async closeOrder(request: CloseOrderRequest) {
        const startedAt = Date.now();
        logOrderTiming('close-order-start', {
            orderId: request.id,
            paymentCount: request.payments?.length || 0,
        });
        const existing = await DataStore.query(Order, request.id);

        if (!existing) {
            Alert.alert(`It seems that order: ${request.id} does not exist`);
            return null;
        }

        const result = await OrderService.closeExistingOrder(existing, request);
        logOrderTiming('close-order-end', {
            orderId: request.id,
            durationMs: Date.now() - startedAt,
            saved: !!result,
        });
        return result;
    }

    static async createPaidOrder(request: CreatePaidOrderRequest) {
        const startedAt = Date.now();
        logOrderTiming('create-paid-order-start', {
            orderId: request.order.id,
            paymentCount: request.payments?.length || 0,
        });
        const validation = validateEbtPayment(
            buildEbtPricingLines(request.order),
            request.payments
        );

        if (!validation.valid) {
            Alert.alert(
                'EBT validation failed',
                `EBT amount ($${validation.ebtPaymentTotal.toFixed(2)}) cannot exceed EBT-eligible amount ($${validation.ebtEligibleTotal.toFixed(2)}).`
            );
            return null;
        }

        const allocations = buildEbtAllocations(
            buildEbtPricingLines(request.order),
            request.payments
        );

        const orderId = request.order.id || String(uuid.v4());
        const snapshotIdByDefinitionId = buildSnapshotIdMapForAppliedSummary(
            orderId,
            request.order.appliedDiscountSummary
        );
        const orderSummaryWithSnapshots = request.order.appliedDiscountSummary
            ? OrderService.withSnapshotIdsOnSummary(
                  request.order.appliedDiscountSummary,
                  snapshotIdByDefinitionId
              )
            : null;
        const orderForPersistence = orderSummaryWithSnapshots
            ? {
                  ...request.order,
                  appliedDiscountSummary: orderSummaryWithSnapshots,
              }
            : request.order;
        const order = new Order(stampTenant({
            id: orderId,
            orderNo:
                orderForPersistence.orderNo ??
                (await StationService.getNextOrderNumber(request.by)),
            status: 'PAID',
            baseSubtotal: orderForPersistence.footer.baseSubtotal,
            subtotal: orderForPersistence.footer.subtotal,
            tax: 0,
            total: orderForPersistence.footer.total,
            currentSubtotal: orderForPersistence.footer.baseSubtotal,
            currentDiscountTotal: orderForPersistence.footer.discount,
            currentTax: 0,
            currentTotal: orderForPersistence.footer.total,
            lineDiscountTotal: orderForPersistence.footer.lineDiscountTotal,
            orderDiscountTotal: orderForPersistence.footer.orderDiscountTotal,
            discountTotal: orderForPersistence.footer.discount,
            savingsTotal: orderForPersistence.footer.savingsTotal,
            promoCodes: orderForPersistence.promoCodes.map((promo) => promo.code),
            pricingVersion: 'discounts-v1',
            pricingSnapshotHash: buildPricingSnapshotHash(request.order),
            pricingSource: orderForPersistence.footer.pricingSource,
            reconciliationStatus: orderForPersistence.footer.reconciliationStatus,
            appliedDiscountSummary: toAppliedDiscountSummarySnapshot(
                orderForPersistence.appliedDiscountSummary
            ),
            employeeId: request.by.id!,
            employeeName: `${request.by.firstName} ${request.by.lastName}`,
            lines: buildOrderLines(orderForPersistence, allocations),
            createdBy: {
                id: request.by.id,
                name: `${request.by.firstName} ${request.by.lastName}`
            },
            updatedBy: {
                id: request.by.id,
                name: `${request.by.firstName} ${request.by.lastName}`
            },
            paymentInfo: {
                employeeId: request.by.id,
                employeeName: `${request.by.firstName} ${request.by.lastName}`,
                payments: request.payments?.map((payment) =>
                    new Payment({
                        type: payment.type.toUpperCase() as any,
                        amount: +payment.amount,
                    })
                ),
            },
            inventoryApplyState: 'PENDING',
            inventoryAppliedAt: null,
            inventoryApplyOperationId: buildOrderInventoryOperationId(
                request.order.id || 'pending',
                'PAID'
            ),
            inventoryApplyError: null,
            orderDate: moment().toISOString(),
        }) as never);

        const savedOrder = await DataStore.save(order);
        await OrderService.persistAppliedDiscountSnapshotsForPaidOrder(
            savedOrder,
            request.order,
            snapshotIdByDefinitionId
        );
        logOrderTiming('create-paid-order-save-complete', {
            orderId: savedOrder.id,
            durationMs: Date.now() - startedAt,
        });
        logOrderTiming('create-paid-order-end', {
            orderId: savedOrder.id,
            durationMs: Date.now() - startedAt,
        });

        return savedOrder;
    }

    static async closeExistingOrder(order: Order, request: Omit<CloseOrderRequest, 'id'>) {
        const validation = validateEbtPayment(
            buildEbtPricingLines(request.order),
            request.payments
        );

        if (!validation.valid) {
            Alert.alert(
                'EBT validation failed',
                `EBT amount ($${validation.ebtPaymentTotal.toFixed(2)}) cannot exceed EBT-eligible amount ($${validation.ebtEligibleTotal.toFixed(2)}).`
            );
            return null;
        }

        const allocations = buildEbtAllocations(
            buildEbtPricingLines(request.order),
            request.payments
        );

        const snapshotIdByDefinitionId = buildSnapshotIdMapForAppliedSummary(
            order.id,
            request.order.appliedDiscountSummary
        );
        const orderSummaryWithSnapshots = request.order.appliedDiscountSummary
            ? OrderService.withSnapshotIdsOnSummary(
                  request.order.appliedDiscountSummary,
                  snapshotIdByDefinitionId
              )
            : null;
        const orderForPersistence = orderSummaryWithSnapshots
            ? {
                  ...request.order,
                  appliedDiscountSummary: orderSummaryWithSnapshots,
              }
            : request.order;

        const updatedOrder = Order.copyOf(order, (o) => {
            o.tenantId = order.tenantId || requireCurrentTenantId();
            o.baseSubtotal = orderForPersistence.footer.baseSubtotal;
            o.subtotal = orderForPersistence.footer.subtotal;
            o.tax = 0;
            o.total = orderForPersistence.footer.total;
            o.currentSubtotal = orderForPersistence.footer.baseSubtotal;
            o.currentDiscountTotal = orderForPersistence.footer.discount;
            o.currentTax = 0;
            o.currentTotal = orderForPersistence.footer.total;
            o.lineDiscountTotal = orderForPersistence.footer.lineDiscountTotal;
            o.orderDiscountTotal = orderForPersistence.footer.orderDiscountTotal;
            o.discountTotal = orderForPersistence.footer.discount;
            o.savingsTotal = orderForPersistence.footer.savingsTotal;
            o.promoCodes = orderForPersistence.promoCodes.map((promo) => promo.code);
            o.pricingVersion = 'discounts-v1';
            o.pricingSnapshotHash = buildPricingSnapshotHash(request.order);
            o.pricingSource = orderForPersistence.footer.pricingSource;
            o.reconciliationStatus = orderForPersistence.footer.reconciliationStatus;
            o.appliedDiscountSummary = toAppliedDiscountSummarySnapshot(
                orderForPersistence.appliedDiscountSummary
            );
            o.status = 'PAID';
            o.lines = buildOrderLines(orderForPersistence, allocations);
            o.updatedBy = {
                id: request.by.id,
                name: `${request.by.firstName} ${request.by.lastName}`
            };
            o.paymentInfo = {
                employeeId: request.by.id,
                employeeName: `${request.by.firstName} ${request.by.lastName}`,
                payments: request.payments?.map(p => new Payment({
                    type: p.type.toUpperCase() as any,
                    amount: +p.amount
                    }))
            };
            o.inventoryApplyState = 'PENDING';
            o.inventoryAppliedAt = null;
            o.inventoryApplyOperationId = buildOrderInventoryOperationId(
                order.id,
                'PAID'
            );
            o.inventoryApplyError = null;
        });

        const closedOrder = await DataStore.save(updatedOrder);
        await OrderService.persistAppliedDiscountSnapshotsForPaidOrder(
            closedOrder,
            request.order,
            snapshotIdByDefinitionId
        );
        logOrderTiming('close-existing-order-save-complete', {
            orderId: closedOrder.id,
            status: closedOrder.status,
        });

        return closedOrder;
    }

    static async refund(request: RefundOrderRequest) {
        const existing = await DataStore.query(Order, request.id);
        
        if (!existing) {
            Alert.alert(`Order ${request.id} no found`);
            return null;
        }

        const sourceOrder = OrderService.toOrderEntitySnapshot(existing, request.order);
        const requestedRefunds = normalizeRefundRequests(request.refundedLines);
        const previouslyRefunded = await OrderService.getRefundedQuantitiesForOrder(
            existing.id
        );
        const refundPricing = await OrderService.buildRefundPricingComputations(
            sourceOrder,
            requestedRefunds,
            previouslyRefunded
        );
        const refundLines = refundPricing.refundLines;

        if (!refundLines.length) {
            throw new Error('No refundable items were selected');
        }

        const isFullRefund = OrderService.isFullRefund(
            sourceOrder,
            requestedRefunds,
            previouslyRefunded
        );
        const requestedRefundId = String(uuid.v4());
        const refundDate = moment().toISOString();
        const refundAmount = refundPricing.refundAmount;
        const hasExplicitRefundPayments = !!request.refundPayments?.length;
        const refundPayments = normalizeRefundPayments(
            hasExplicitRefundPayments
                ? request.refundPayments
                : allocatePaymentsToTotal(
                      sourceOrder.paymentInfo?.payments ||
                          request.order?.paymentInfo?.payments,
                      refundAmount
                  )
        );
        const normalizedRefundPaymentTotal = sumPayments(refundPayments);

        if (
            hasExplicitRefundPayments &&
            refundAmount > 0 &&
            roundMoney(normalizedRefundPaymentTotal) !== roundMoney(refundAmount)
        ) {
            throw new Error(
                `Refund payment methods must add up to ${refundAmount.toFixed(2)}`
            );
        }
        const savedOrder = await OrderService.saveRefundedOrderStatus(
            existing,
            request,
            isFullRefund,
            refundPricing
        );

        const refundInventoryOperationId = buildRefundInventoryOperationId(
            existing.id,
            requestedRefundId
        );

        for (const line of refundLines) {
            await DataStore.save(
                new OrderRefundLine(
                    stampTenant({
                        id: String(uuid.v4()),
                        refundId: requestedRefundId,
                        orderId: existing.id,
                        refundDate,
                        orderLineIdentifier: line.identifier,
                        productId: line.productId,
                        productName: line.productName,
                        unitOfMeasure: line.unitOfMeasure,
                        categoryId: line.categoryId ?? null,
                        quantityRefunded: line.quantityRefunded,
                        unitRefundAmount: line.unitRefundAmount,
                        lineRefundAmount: line.lineRefundAmount,
                    }) as never
                )
            );
        }

        const refundRecord = new OrderRefund(
            stampTenant({
                id: requestedRefundId,
                orderId: existing.id,
                orderNo: existing.orderNo,
                refundDate,
                refundType: isFullRefund ? 'FULL' : 'PARTIAL',
                status: 'COMPLETED',
                refundAmount,
                refundReason: request.comments || null,
                refundPayments: refundPayments.map((payment) => ({
                    type: payment.type as Payment['type'],
                    amount: payment.amount,
                })),
                createdByEmployeeId: request.by.id,
                createdByEmployeeName: `${request.by.firstName} ${request.by.lastName}`,
                inventoryApplyState: 'PENDING',
                inventoryAppliedAt: null,
                inventoryApplyOperationId: refundInventoryOperationId,
                inventoryApplyError: null,
            }) as never
        );

        await DataStore.save(refundRecord);

        return savedOrder;
    }

    static async previewRefund(request: Pick<RefundOrderRequest, 'id' | 'order' | 'refundedLines'>) {
        const existing = await DataStore.query(Order, request.id);

        if (!existing) {
            return {
                refundTotal: 0,
                newTotal: 0,
            };
        }

        const sourceOrder = OrderService.toOrderEntitySnapshot(existing, request.order);
        const requestedRefunds = normalizeRefundRequests(request.refundedLines);

        if (!requestedRefunds.size) {
            const refunds = await OrderService.getRefundRecordsForOrder(existing.id);
            const existingRefundAmount = roundMoney(
                refunds.reduce((sum, refund) => sum + Number(refund.refundAmount || 0), 0)
            );
            const currentTotal =
                sourceOrder.currentTotal != null
                    ? roundMoney(Math.max(0, Number(sourceOrder.currentTotal || 0)))
                    : roundMoney(
                          Math.max(
                              0,
                              Number(sourceOrder.total || 0) - existingRefundAmount
                          )
                      );

            return {
                refundTotal: 0,
                newTotal: currentTotal,
            };
        }

        const previouslyRefunded = await OrderService.getRefundedQuantitiesForOrder(
            existing.id
        );
        const pricing = await OrderService.buildRefundPricingComputations(
            sourceOrder,
            requestedRefunds,
            previouslyRefunded
        );

        return {
            refundTotal: pricing.refundAmount,
            newTotal: pricing.newTotal,
        };
    }

    static buildPrintTicketPreview(
        cart: CartState,
        copyType: OrderTicketCopyType = 'CUSTOMER'
    ): OrderTicketPrintModel {
        const rows = (cart.items || []).map((item, index) => {
            const identifier = String(item.identifier || `line-${index}`);
            const lineSummary = cart.appliedDiscountSummary?.lineSummaries?.find(
                (summary) => summary.lineId === identifier
            );
            const originalAmount = roundMoney(
                Number(item.product.price || 0) * Number(item.quantity || 0)
            );
            const finalAmount = roundMoney(
                Number(lineSummary?.lineTotalBeforeTax || originalAmount)
            );
            const discountAmount = roundMoney(Math.max(0, originalAmount - finalAmount));

            return {
                identifier,
                quantity: Number(item.quantity || 0),
                name: item.product.name,
                amount: discountAmount > 0 ? originalAmount : finalAmount,
                detailRows:
                    discountAmount > 0
                        ? [{ label: 'Discount', amount: -discountAmount }]
                        : [],
            };
        });

        return {
            isReceipt: false,
            copyType,
            sections: [
                {
                    title: 'Items',
                    emptyLabel: 'No items',
                    rows,
                },
            ],
            totals: {
                subtotal: roundMoney(
                    Number(
                        cart.footer.baseSubtotal ??
                            cart.footer.subtotal ??
                            cart.footer.total ??
                            0
                    )
                ),
                discount: roundMoney(
                    Number(cart.footer.discount ?? cart.footer.savingsTotal ?? 0)
                ),
                tax: roundMoney(Number(cart.footer.tax || 0)),
                total: roundMoney(Number(cart.footer.total || 0)),
            },
            paymentRows: [],
            promoCodes: (cart.promoCodes || []).map((promo) => promo.code),
        };
    }

    static async buildPrintTicketForOrder(
        orderOrId: string | OrderEntity,
        options: {
            copyType?: OrderTicketCopyType;
            refundedQuantities?: Record<string, number>;
            refundedLineAmounts?: Record<string, number>;
            refundPayments?: Array<{ type: string; amount: number }>;
        } = {}
    ): Promise<OrderTicketPrintModel> {
        const order =
            typeof orderOrId === 'string'
                ? await DataStore.query(Order, orderOrId).then((result) =>
                      result ? OrderEntityMapper.fromModel(result) : null
                  )
                : orderOrId;

        if (!order) {
            throw new Error('Order was not found');
        }

        const refundedQuantities =
            options.refundedQuantities ??
            (order.status === 'PARTIALLY_REFUNDED' || order.status === 'REFUNDED'
                ? Object.fromEntries(
                      (await OrderService.getRefundedQuantitiesForOrder(order.id)).entries()
                  )
                : undefined);
        const refundedLineAmounts =
            options.refundedLineAmounts ??
            (order.status === 'PARTIALLY_REFUNDED' || order.status === 'REFUNDED'
                ? Object.fromEntries(
                      (await OrderService.getRefundedLineAmountsForOrder(order.id)).entries()
                  )
                : undefined);
        const refundPayments =
            options.refundPayments ??
            (order.status === 'PARTIALLY_REFUNDED' || order.status === 'REFUNDED'
                ? await OrderService.getRefundPaymentTotalsForOrder(order.id)
                : undefined);

        const currentBasket =
            refundedQuantities &&
            Object.values(refundedQuantities).some((quantity) => Number(quantity || 0) > 0)
                ? await OrderService.buildCurrentBasketForTicket(
                      order,
                      refundedQuantities
                  )
                : null;

        return OrderService.buildPrintTicketForOrderEntitySnapshot(order, {
            copyType: options.copyType,
            refundedQuantities,
            refundedLineAmounts,
            refundPayments,
            currentBasket,
        });
    }

    static buildPrintTicketForOrderEntitySnapshot(
        order: OrderEntity,
        options: {
            copyType?: OrderTicketCopyType;
            refundedQuantities?: Record<string, number>;
            refundedLineAmounts?: Record<string, number>;
            refundPayments?: Array<{ type: string; amount: number }>;
            currentBasket?: PricingPreviewResult | null;
        } = {}
    ): OrderTicketPrintModel {
        const copyType = options.copyType ?? 'MERCHANT';
        const refundedQuantities = options.refundedQuantities || {};
        const refundedLineAmounts = options.refundedLineAmounts || {};
        const hasRefundHistory = Object.values(refundedQuantities).some(
            (quantity) => Number(quantity || 0) > 0
        );

        if (!hasRefundHistory) {
            return OrderService.buildStandardOrderTicket(order, copyType);
        }

        return OrderService.buildRefundOrderTicket(order, copyType, {
            refundedQuantities,
            refundedLineAmounts,
            refundPayments: options.refundPayments || [],
            currentBasket: options.currentBasket || null,
        });
    }

    private static buildStandardOrderTicket(
        order: OrderEntity,
        copyType: OrderTicketCopyType
    ): OrderTicketPrintModel {
        const rows = (order.lines || []).map((line) =>
            OrderService.buildTicketRowFromOrderLine(line)
        );

        return {
            isReceipt: true,
            orderId: order.id,
            orderNo: order.orderNo,
            copyType,
            sections: [
                {
                    title: 'Items',
                    emptyLabel: 'No items',
                    rows,
                },
            ],
            totals: {
                subtotal: roundMoney(Number(order.baseSubtotal ?? order.subtotal ?? order.total)),
                discount: roundMoney(Number(order.discountTotal || 0)),
                tax: roundMoney(Number(order.tax || 0)),
                total: roundMoney(Number(order.total || 0)),
            },
            paymentRows: OrderService.buildTicketPaymentRows(
                order.paymentInfo?.payments,
                []
            ),
            promoCodes: order.promoCodes || [],
        };
    }

    private static buildRefundOrderTicket(
        order: OrderEntity,
        copyType: OrderTicketCopyType,
        options: {
            refundedQuantities: Record<string, number>;
            refundedLineAmounts: Record<string, number>;
            refundPayments: Array<{ type: string; amount: number }>;
            currentBasket: PricingPreviewResult | null;
        }
    ): OrderTicketPrintModel {
        const currentBasket = options.currentBasket;
        const activeRows = currentBasket
            ? currentBasket.order.lines.map((line) =>
                  OrderService.buildTicketRowFromPricingLine(line)
              )
            : OrderService.buildHistoricalActiveTicketRows(
                  order,
                  options.refundedQuantities,
                  options.refundedLineAmounts
              );
        const refundedRows = OrderService.buildRefundedTicketRows(
            order,
            options.refundedQuantities,
            options.refundedLineAmounts
        );

        return {
            isReceipt: true,
            orderId: order.id,
            orderNo: order.orderNo,
            copyType,
            sections: [
                {
                    title: 'Active Items',
                    emptyLabel: 'No active items',
                    rows: activeRows,
                },
                {
                    title: 'Refunded Items',
                    emptyLabel: 'No refunded items',
                    rows: refundedRows,
                },
            ],
            totals: {
                subtotal: roundMoney(
                    Number(
                        order.currentSubtotal ??
                            currentBasket?.order.baseSubtotal ??
                            activeRows.reduce((sum, row) => sum + row.amount, 0)
                    )
                ),
                discount: roundMoney(
                    Number(
                        order.currentDiscountTotal ??
                            currentBasket?.order.discountTotal ??
                            0
                    )
                ),
                tax: roundMoney(
                    Number(order.currentTax ?? currentBasket?.order.tax ?? 0)
                ),
                total: roundMoney(
                    Number(
                        order.currentTotal ?? currentBasket?.order.total ?? 0
                    )
                ),
            },
            paymentRows: OrderService.buildTicketPaymentRows(
                order.paymentInfo?.payments,
                options.refundPayments
            ),
            promoCodes: order.promoCodes || [],
        };
    }

    private static buildTicketRowFromOrderLine(
        line: OrderLineEntity
    ): OrderTicketPrintRow {
        const discountAmount = getLineDiscountAmount(line);
        const originalAmount = getLineOriginalAmount(line);
        const finalAmount = roundMoney(Number(line.lineTotalBeforeTax || 0));

        return {
            identifier: String(line.identifier || ''),
            quantity: Number(line.quantity || 0),
            name: line.productName,
            amount: discountAmount > 0 ? originalAmount : finalAmount,
            detailRows:
                discountAmount > 0
                    ? [{ label: 'Discount', amount: -discountAmount }]
                    : [],
        };
    }

    private static buildTicketRowFromPricingLine(
        line: PricingPreviewResult['order']['lines'][number]
    ): OrderTicketPrintRow {
        const discountAmount = getLineDiscountAmount(line);
        const originalAmount = getLineOriginalAmount(line);
        const finalAmount = roundMoney(Number(line.lineTotalBeforeTax || 0));

        return {
            identifier: String(line.lineId || ''),
            quantity: Number(line.quantity || 0),
            name: line.productName,
            amount: discountAmount > 0 ? originalAmount : finalAmount,
            detailRows:
                discountAmount > 0
                    ? [{ label: 'Discount', amount: -discountAmount }]
                    : [],
        };
    }

    private static buildHistoricalActiveTicketRows(
        order: OrderEntity,
        refundedQuantities: Record<string, number>,
        refundedLineAmounts: Record<string, number>
    ): OrderTicketPrintRow[] {
        return (order.lines || [])
            .map((line) => {
                const originalQuantity = Number(line.quantity || 0);
                const refundedQuantity = Math.max(
                    0,
                    Math.min(
                        originalQuantity,
                        Number(refundedQuantities[String(line.identifier || '')] || 0)
                    )
                );
                const activeQuantity = roundMoney(originalQuantity - refundedQuantity);
                if (activeQuantity <= 0) {
                    return null;
                }

                const originalAmount = getLineOriginalAmount(line);
                const finalAmount = roundMoney(Number(line.lineTotalBeforeTax || 0));
                const refundedAmount = roundMoney(
                    Number(refundedLineAmounts[String(line.identifier || '')] || 0)
                );
                const activeOriginalAmount =
                    originalQuantity > 0
                        ? roundMoney(
                              originalAmount -
                                  (originalAmount * refundedQuantity) / originalQuantity
                          )
                        : 0;
                const activeFinalAmount = roundMoney(
                    Math.max(0, finalAmount - refundedAmount)
                );
                const activeDiscountAmount = roundMoney(
                    Math.max(0, activeOriginalAmount - activeFinalAmount)
                );

                return {
                    identifier: String(line.identifier || ''),
                    quantity: activeQuantity,
                    name: line.productName,
                    amount:
                        activeDiscountAmount > 0
                            ? activeOriginalAmount
                            : activeFinalAmount,
                    detailRows:
                        activeDiscountAmount > 0
                            ? [{ label: 'Discount', amount: -activeDiscountAmount }]
                            : [],
                } as OrderTicketPrintRow;
            })
            .filter(Boolean) as OrderTicketPrintRow[];
    }

    private static buildRefundedTicketRows(
        order: OrderEntity,
        refundedQuantities: Record<string, number>,
        refundedLineAmounts: Record<string, number>
    ): OrderTicketPrintRow[] {
        return (order.lines || [])
            .map((line) => {
                const originalQuantity = Number(line.quantity || 0);
                const refundedQuantity = Math.max(
                    0,
                    Math.min(
                        originalQuantity,
                        Number(refundedQuantities[String(line.identifier || '')] || 0)
                    )
                );
                if (refundedQuantity <= 0) {
                    return null;
                }

                const refundedAmount =
                    Number(refundedLineAmounts[String(line.identifier || '')] || 0) > 0
                        ? roundMoney(
                              Number(
                                  refundedLineAmounts[String(line.identifier || '')] || 0
                              )
                          )
                        : originalQuantity > 0
                        ? roundMoney(
                              (Number(line.lineTotalBeforeTax || 0) * refundedQuantity) /
                                  originalQuantity
                          )
                        : 0;

                return {
                    identifier: String(line.identifier || ''),
                    quantity: refundedQuantity,
                    name: line.productName,
                    amount: refundedAmount,
                    detailRows: [],
                } as OrderTicketPrintRow;
            })
            .filter(Boolean) as OrderTicketPrintRow[];
    }

    private static buildTicketPaymentRows(
        originalPayments:
            | Array<{ type?: string | null; amount?: number | null }>
            | null
            | undefined,
        refundPayments:
            | Array<{ type?: string | null; amount?: number | null }>
            | null
            | undefined
    ): OrderTicketPrintPaymentRow[] {
        const originalRows = (originalPayments || [])
            .map((payment) => ({
                kind: 'payment' as const,
                label: String(payment?.type || '').trim(),
                amount: roundMoney(Number(payment?.amount || 0)),
            }))
            .filter((payment) => payment.label && payment.amount > 0);
        const refundRows = (refundPayments || [])
            .map((payment) => ({
                kind: 'payment' as const,
                label: String(payment?.type || '').trim(),
                amount: roundMoney(-Math.abs(Number(payment?.amount || 0))),
            }))
            .filter((payment) => payment.label && payment.amount < 0);

        if (!refundRows.length) {
            return originalRows;
        }

        const rows: OrderTicketPrintPaymentRow[] = [];

        if (originalRows.length) {
            rows.push({ kind: 'heading', label: 'Original Payments' });
            rows.push(...originalRows);
        }

        rows.push({ kind: 'heading', label: 'Refund Payments' });
        rows.push(...refundRows);

        return rows;
    }

    private static buildCurrentBasketForTicket(
        order: OrderEntity,
        refundedQuantitiesRecord: Record<string, number>
    ): Promise<PricingPreviewResult | null> {
        const refundedQuantities = new Map<string, number>(
            Object.entries(refundedQuantitiesRecord || {}).map(([identifier, quantity]) => [
                identifier,
                roundMoney(Number(quantity || 0)),
            ])
        );

        if (!refundedQuantities.size) {
            return Promise.resolve(null);
        }

        const appliedDiscountApplications =
            (order.appliedDiscountSummary?.applications || []).filter(
                isSnapshotEligibleApplication
            );
        if (!appliedDiscountApplications.length) {
            return Promise.resolve(null);
        }

        return DataStore.query(
            OrderDiscountDefinitionSnapshot,
            (snapshot) => snapshot.orderId.eq(order.id)
        ).then((pricingSnapshots) => {
            const pricingDefinitions = OrderService.resolveRefundPricingDefinitions(
                appliedDiscountApplications,
                pricingSnapshots
            );

            if (
                !pricingDefinitions.length ||
                pricingDefinitions.length !== appliedDiscountApplications.length
            ) {
                return null;
            }

            const snapshotPricingContext = OrderService.resolveRefundPricingContext(
                order,
                pricingSnapshots
            );

            return OrderService.buildRepricedCartPreview(
                order,
                refundedQuantities,
                pricingDefinitions,
                snapshotPricingContext.pricingGeneratedAt,
                snapshotPricingContext.pricingTimezone,
                snapshotPricingContext.pricingStationId
            );
        });
    }

    private static async persistAppliedDiscountSnapshotsForPaidOrder(
        order: Order,
        cart: Omit<CartState, 'id'>,
        precomputedSnapshotIdByDefinitionId?: Map<string, string>
    ) {
        const summary = cart.appliedDiscountSummary;
        if (!summary?.applications?.length) {
            return;
        }

        const pricingContext = await OrderService.resolvePricingSnapshotContext(
            order,
            cart
        );
        const snapshotIdByDefinitionId =
            precomputedSnapshotIdByDefinitionId ||
            buildSnapshotIdMapForAppliedSummary(order.id, summary);

        if (!snapshotIdByDefinitionId.size) {
            return;
        }

        for (const [discountDefinitionId, snapshotId] of snapshotIdByDefinitionId) {

            const existingSnapshot = await DataStore.query(
                OrderDiscountDefinitionSnapshot,
                snapshotId
            );
            if (existingSnapshot) {
                continue;
            }

            const sourceDefinition = await OrderService.resolveAppliedDiscountDefinition(
                discountDefinitionId,
                cart
            );
            if (!sourceDefinition) {
                continue;
            }

            await DataStore.save(
                new OrderDiscountDefinitionSnapshot(
                    stampTenant({
                        id: snapshotId,
                        orderId: order.id,
                        discountDefinitionId,
                        name: sourceDefinition.name,
                        code: sourceDefinition.code ?? null,
                        description: sourceDefinition.description ?? null,
                        status: sourceDefinition.status,
                        type: sourceDefinition.type,
                        method: sourceDefinition.method,
                        scope: sourceDefinition.scope,
                        value: sourceDefinition.value,
                        priority: sourceDefinition.priority ?? null,
                        stackMode: sourceDefinition.stackMode,
                        approvalRequired: sourceDefinition.approvalRequired ?? false,
                        reasonRequired: sourceDefinition.reasonRequired ?? false,
                        startDate: sourceDefinition.startDate ?? null,
                        endDate: sourceDefinition.endDate ?? null,
                        daysOfWeek: sourceDefinition.daysOfWeek ?? undefined,
                        startTime: sourceDefinition.startTime ?? null,
                        endTime: sourceDefinition.endTime ?? null,
                        minSubtotal: sourceDefinition.minSubtotal ?? null,
                        minQuantity: sourceDefinition.minQuantity ?? null,
                        usageLimitTotal: sourceDefinition.usageLimitTotal ?? null,
                        usageCountTotal: sourceDefinition.usageCountTotal ?? null,
                        applicableProductIds:
                            sourceDefinition.applicableProductIds ?? undefined,
                        applicableCategoryIds:
                            sourceDefinition.applicableCategoryIds ?? undefined,
                        excludedProductIds:
                            sourceDefinition.excludedProductIds ?? undefined,
                        excludedCategoryIds:
                            sourceDefinition.excludedCategoryIds ?? undefined,
                        excludeAlreadyDiscountedItems:
                            sourceDefinition.excludeAlreadyDiscountedItems ?? false,
                        appliesToAllProducts:
                            sourceDefinition.appliesToAllProducts ?? false,
                        stationIds: sourceDefinition.stationIds ?? undefined,
                        active: sourceDefinition.active ?? sourceDefinition.status === 'ACTIVE',
                        pricingGeneratedAt: pricingContext.pricingGeneratedAt,
                        pricingTimezone: pricingContext.pricingTimezone,
                        pricingStoreId: pricingContext.pricingStoreId ?? null,
                        pricingStationId: pricingContext.pricingStationId ?? null,
                    }) as never
                )
            );
        }
    }

    private static async resolveAppliedDiscountDefinition(
        discountDefinitionId: string,
        cart: Omit<CartState, 'id'>
    ) {
        const fromCart = (cart.definitions || []).find(
            (definition) => definition.id === discountDefinitionId
        );
        if (fromCart) {
            return fromCart as unknown as DiscountDefinition;
        }

        return await DataStore.query(DiscountDefinition, discountDefinitionId);
    }

    private static async resolvePricingSnapshotContext(
        order: Order,
        cart: Omit<CartState, 'id'>
    ): Promise<OrderPricingSnapshotContext> {
        let timezone = cart.pricingContext?.timezone || null;
        if (!timezone) {
            const settings = await DataStore.query(GlobalSettings);
            timezone = settings?.[0]?.timezone || null;
        }

        return {
            pricingGeneratedAt:
                cart.appliedDiscountSummary?.pricingGeneratedAt ||
                order.orderDate ||
                moment().toISOString(),
            pricingTimezone: timezone || 'America/New_York',
            pricingStoreId: cart.pricingContext?.storeId ?? null,
            pricingStationId:
                cart.pricingContext?.stationId ??
                OrderService.extractStationId(order.orderNo),
        };
    }

    private static withSnapshotIdsOnSummary(
        summary: AppliedDiscountSummary,
        snapshotIdByDefinitionId: Map<string, string>
    ): AppliedDiscountSummary {
        return {
            ...summary,
            applications: OrderService.withSnapshotIdsOnDiscounts(
                summary.applications,
                snapshotIdByDefinitionId
            ),
            lineSummaries: summary.lineSummaries.map((lineSummary) => ({
                ...lineSummary,
                discounts: OrderService.withSnapshotIdsOnDiscounts(
                    lineSummary.discounts,
                    snapshotIdByDefinitionId
                ),
            })),
            orderLevelAdjustments: OrderService.withSnapshotIdsOnDiscounts(
                summary.orderLevelAdjustments,
                snapshotIdByDefinitionId
            ),
        };
    }

    private static withSnapshotIdsOnDiscounts(
        discounts: AppliedDiscountDetail[] | null | undefined,
        snapshotIdByDefinitionId: Map<string, string>
    ) {
        return (discounts || []).map((discount) => {
            if (!isSnapshotEligibleApplication(discount)) {
                return discount;
            }

            const discountDefinitionId = String(discount.discountDefinitionId);
            return {
                ...discount,
                orderDiscountSnapshotId:
                    snapshotIdByDefinitionId.get(discountDefinitionId) || null,
            };
        });
    }

    static async getRefundRecordsForOrder(orderId: string) {
        const refunds = await DataStore.query(OrderRefund, (refund) =>
            refund.orderId.eq(orderId)
        );

        const normalizedRefunds = Array.isArray(refunds) ? refunds : [];

        return [...normalizedRefunds].sort((left, right) =>
            (left.refundDate || '').localeCompare(right.refundDate || '')
        );
    }

    static async getRefundedQuantitiesForOrder(orderId: string) {
        const refundLines = await DataStore.query(OrderRefundLine, (line) =>
            line.orderId.eq(orderId)
        );

        const normalizedRefundLines = Array.isArray(refundLines) ? refundLines : [];

        return normalizedRefundLines.reduce<Map<string, number>>((acc, line) => {
            const identifier = String(line.orderLineIdentifier || '');
            const nextQuantity = roundMoney(
                (acc.get(identifier) || 0) + Number(line.quantityRefunded || 0)
            );
            acc.set(identifier, nextQuantity);
            return acc;
        }, new Map<string, number>());
    }

    static async getRefundedLineAmountsForOrder(orderId: string) {
        const refundLines = await DataStore.query(OrderRefundLine, (line) =>
            line.orderId.eq(orderId)
        );

        const normalizedRefundLines = Array.isArray(refundLines) ? refundLines : [];

        return normalizedRefundLines.reduce<Map<string, number>>((acc, line) => {
            const identifier = String(line.orderLineIdentifier || '');
            const nextAmount = roundMoney(
                (acc.get(identifier) || 0) + Number(line.lineRefundAmount || 0)
            );
            acc.set(identifier, nextAmount);
            return acc;
        }, new Map<string, number>());
    }

    static async getRefundRecordsForRange(
        fromIso: string,
        toIso: string
    ) {
        const refunds = await DataStore.query(OrderRefund, (refund) =>
            refund.refundDate.between(fromIso, toIso)
        );

        return [...refunds].sort((left, right) =>
            (right.refundDate || '').localeCompare(left.refundDate || '')
        );
    }

    private static toOrderEntitySnapshot(
        existing: Order,
        requestOrder: RefundOrderRequest['order']
    ): OrderEntity {
        return {
            id: existing.id,
            orderNo:
                (requestOrder as unknown as Partial<OrderEntity>).orderNo ||
                existing.orderNo,
            baseSubtotal:
                (requestOrder as unknown as Partial<OrderEntity>).baseSubtotal ??
                existing.baseSubtotal,
            subtotal:
                (requestOrder as unknown as Partial<OrderEntity>).subtotal ??
                existing.subtotal,
            lineDiscountTotal:
                (requestOrder as unknown as Partial<OrderEntity>).lineDiscountTotal ??
                existing.lineDiscountTotal,
            orderDiscountTotal:
                (requestOrder as unknown as Partial<OrderEntity>).orderDiscountTotal ??
                existing.orderDiscountTotal,
            discountTotal:
                (requestOrder as unknown as Partial<OrderEntity>).discountTotal ??
                existing.discountTotal,
            savingsTotal:
                (requestOrder as unknown as Partial<OrderEntity>).savingsTotal ??
                existing.savingsTotal,
            tax:
                (requestOrder as unknown as Partial<OrderEntity>).tax ??
                existing.tax,
            total:
                (requestOrder as unknown as Partial<OrderEntity>).total ??
                existing.total,
            currentSubtotal:
                (requestOrder as unknown as Partial<OrderEntity>).currentSubtotal ??
                (existing as unknown as Partial<OrderEntity>).currentSubtotal ??
                null,
            currentDiscountTotal:
                (requestOrder as unknown as Partial<OrderEntity>).currentDiscountTotal ??
                (existing as unknown as Partial<OrderEntity>).currentDiscountTotal ??
                null,
            currentTax:
                (requestOrder as unknown as Partial<OrderEntity>).currentTax ??
                (existing as unknown as Partial<OrderEntity>).currentTax ??
                null,
            currentTotal:
                (requestOrder as unknown as Partial<OrderEntity>).currentTotal ??
                (existing as unknown as Partial<OrderEntity>).currentTotal ??
                null,
            status:
                ((requestOrder as unknown as Partial<OrderEntity>).status as
                    | OrderStatus
                    | keyof typeof OrderStatus
                    | undefined) || existing.status,
            employeeId:
                (requestOrder as unknown as Partial<OrderEntity>).employeeId ||
                existing.employeeId,
            employeeName:
                (requestOrder as unknown as Partial<OrderEntity>).employeeName ||
                existing.employeeName,
            promoCodes:
                (requestOrder as unknown as Partial<OrderEntity>).promoCodes ||
                OrderEntityMapper.fromModel(existing).promoCodes ||
                null,
            pricingVersion:
                (requestOrder as unknown as Partial<OrderEntity>).pricingVersion ||
                existing.pricingVersion,
            pricingSnapshotHash:
                (requestOrder as unknown as Partial<OrderEntity>)
                    .pricingSnapshotHash || existing.pricingSnapshotHash,
            pricingSource:
                (requestOrder as unknown as Partial<OrderEntity>).pricingSource ||
                existing.pricingSource,
            reconciliationStatus:
                (requestOrder as unknown as Partial<OrderEntity>)
                    .reconciliationStatus || existing.reconciliationStatus,
            appliedDiscountSummary:
                (requestOrder as unknown as Partial<OrderEntity>)
                    .appliedDiscountSummary ||
                OrderEntityMapper.fromModel(existing).appliedDiscountSummary ||
                null,
            lines:
                (requestOrder as unknown as Partial<OrderEntity>).lines ||
                OrderEntityMapper.fromModel(existing).lines,
            payments:
                (requestOrder as unknown as Partial<OrderEntity>).payments || null,
            paymentInfo:
                (requestOrder as unknown as Partial<OrderEntity>).paymentInfo ||
                null,
            refundInfo:
                (requestOrder as unknown as Partial<OrderEntity>).refundInfo ||
                null,
            orderDate:
                (requestOrder as unknown as Partial<OrderEntity>).orderDate ||
                existing.orderDate,
            createdAt:
                (requestOrder as unknown as Partial<OrderEntity>).createdAt ||
                existing.createdAt,
            updatedAt:
                (requestOrder as unknown as Partial<OrderEntity>).updatedAt ||
                existing.updatedAt,
        } as OrderEntity;
    }

    private static buildHistoricalRefundLineComputations(
        order: OrderEntity,
        requestedRefunds: Map<string, number>,
        previouslyRefunded: Map<string, number>
    ): RefundLineComputation[] {
        return Array.from(requestedRefunds.entries()).map(([identifier, quantityRefunded]) => {
            const sourceLine = order.lines?.find((line) => line.identifier === identifier);
            if (!sourceLine) {
                throw new Error(`Order line ${identifier} was not found`);
            }

            const originalQuantity = Number(sourceLine.quantity || 0);
            const priorRefundedQuantity = Number(previouslyRefunded.get(identifier) || 0);
            const remainingRefundableQuantity = roundMoney(
                originalQuantity - priorRefundedQuantity
            );

            if (
                quantityRefunded - remainingRefundableQuantity >
                REFUND_QUANTITY_EPSILON
            ) {
                throw new Error(
                    `Line ${sourceLine.productName} only has ${remainingRefundableQuantity} refundable units remaining`
                );
            }

            const unitRefundAmount =
                originalQuantity > 0
                    ? roundMoney(
                          Number(
                              sourceLine.lineTotalBeforeTax ??
                                  sourceLine.lineTotalAfterTax ??
                                  sourceLine.price * sourceLine.quantity
                          ) / originalQuantity
                      )
                    : 0;

            return {
                identifier,
                productId: sourceLine.productId,
                productName: sourceLine.productName,
                unitOfMeasure: sourceLine.unitOfMeasure,
                categoryId: sourceLine.categoryId ?? null,
                quantityRefunded: roundMoney(quantityRefunded),
                unitRefundAmount,
                lineRefundAmount: roundMoney(unitRefundAmount * quantityRefunded),
            };
        });
    }

    private static async buildRefundPricingComputations(
        order: OrderEntity,
        requestedRefunds: Map<string, number>,
        previouslyRefunded: Map<string, number>
    ): Promise<RefundPricingComputation> {
        const historicalRefundLines = OrderService.buildHistoricalRefundLineComputations(
            order,
            requestedRefunds,
            previouslyRefunded
        );
        const historicalRefundAmount = roundMoney(
            historicalRefundLines.reduce((sum, line) => sum + line.lineRefundAmount, 0)
        );
        const refundRecords = await OrderService.getRefundRecordsForOrder(order.id);
        const existingRefundAmount = roundMoney(
            refundRecords.reduce((sum, refund) => sum + Number(refund.refundAmount || 0), 0)
        );
        const currentOpenBalance =
            order.currentTotal != null
                ? roundMoney(Math.max(0, Number(order.currentTotal || 0)))
                : roundMoney(
                      Math.max(0, Number(order.total || 0) - existingRefundAmount)
                  );
        const totalRefundedAfter = OrderService.mergeRefundQuantities(
            previouslyRefunded,
            requestedRefunds
        );
        const historicalTotals = OrderService.buildHistoricalCurrentTotals(
            order,
            totalRefundedAfter,
            roundMoney(Math.max(0, currentOpenBalance - historicalRefundAmount))
        );

        const appliedDiscountApplications = (order.appliedDiscountSummary?.applications || []).filter(
            isSnapshotEligibleApplication
        );

        if (!appliedDiscountApplications.length) {
            return {
                refundAmount: historicalRefundAmount,
                refundLines: historicalRefundLines,
                currentSubtotal: historicalTotals.currentSubtotal,
                currentDiscountTotal: historicalTotals.currentDiscountTotal,
                currentTax: historicalTotals.currentTax,
                currentTotal: historicalTotals.currentTotal,
                newTotal: roundMoney(Math.max(0, currentOpenBalance - historicalRefundAmount)),
            };
        }

        const pricingSnapshots = await DataStore.query(
            OrderDiscountDefinitionSnapshot,
            (snapshot) => snapshot.orderId.eq(order.id)
        );
        const pricingDefinitions = OrderService.resolveRefundPricingDefinitions(
            appliedDiscountApplications,
            pricingSnapshots
        );

        if (
            !pricingDefinitions.length ||
            pricingDefinitions.length !== appliedDiscountApplications.length
        ) {
            return {
                refundAmount: historicalRefundAmount,
                refundLines: historicalRefundLines,
                currentSubtotal: historicalTotals.currentSubtotal,
                currentDiscountTotal: historicalTotals.currentDiscountTotal,
                currentTax: historicalTotals.currentTax,
                currentTotal: historicalTotals.currentTotal,
                newTotal: roundMoney(Math.max(0, currentOpenBalance - historicalRefundAmount)),
            };
        }
        const snapshotPricingContext = OrderService.resolveRefundPricingContext(
            order,
            pricingSnapshots
        );
        const repricedAfter = OrderService.buildRepricedCartPreview(
            order,
            totalRefundedAfter,
            pricingDefinitions,
            snapshotPricingContext.pricingGeneratedAt,
            snapshotPricingContext.pricingTimezone,
            snapshotPricingContext.pricingStationId
        );
        const refundAmount = roundMoney(
            Math.max(0, currentOpenBalance - repricedAfter.order.total)
        );
        const refundLines = OrderService.allocateRefundLines(
            order,
            requestedRefunds,
            previouslyRefunded,
            refundAmount,
            historicalRefundLines
        );

        return {
            refundAmount,
            refundLines,
            currentSubtotal: roundMoney(repricedAfter.order.baseSubtotal || 0),
            currentDiscountTotal: roundMoney(repricedAfter.order.discountTotal || 0),
            currentTax: roundMoney(repricedAfter.order.tax || 0),
            currentTotal: roundMoney(repricedAfter.order.total || 0),
            newTotal: roundMoney(Math.max(0, currentOpenBalance - refundAmount)),
        };
    }

    private static buildHistoricalCurrentTotals(
        order: OrderEntity,
        refundedQuantities: Map<string, number>,
        currentTotal: number
    ) {
        const currentSubtotal = roundMoney(
            (order.lines || []).reduce((sum, line) => {
                const refundedQuantity = Number(
                    refundedQuantities.get(String(line.identifier || '')) || 0
                );
                const remainingQuantity = roundMoney(
                    Math.max(0, Number(line.quantity || 0) - refundedQuantity)
                );
                const unitBasePrice = Number(line.basePrice ?? line.price ?? 0);
                return sum + roundMoney(unitBasePrice * remainingQuantity);
            }, 0)
        );

        const currentTax = roundMoney(
            (order.lines || []).reduce((sum, line) => {
                const originalQuantity = Number(line.quantity || 0);
                if (originalQuantity <= 0) {
                    return sum;
                }

                const refundedQuantity = Number(
                    refundedQuantities.get(String(line.identifier || '')) || 0
                );
                const remainingQuantity = roundMoney(
                    Math.max(0, originalQuantity - refundedQuantity)
                );
                const totalLineTax = roundMoney(
                    Math.max(
                        0,
                        Number(line.lineTotalAfterTax || 0) -
                            Number(line.lineTotalBeforeTax || 0)
                    )
                );

                return (
                    sum +
                    roundMoney((totalLineTax * remainingQuantity) / originalQuantity)
                );
            }, 0)
        );

        return {
            currentSubtotal,
            currentDiscountTotal: roundMoney(
                Math.max(0, currentSubtotal + currentTax - currentTotal)
            ),
            currentTax,
            currentTotal: roundMoney(Math.max(0, currentTotal)),
        };
    }

    static async getRefundPaymentTotalsForOrder(orderId: string) {
        const refunds = await OrderService.getRefundRecordsForOrder(orderId);
        const totalsByType = refunds.reduce<Map<string, number>>((acc, refund) => {
            (refund.refundPayments || []).forEach((payment) => {
                const type = String(payment?.type || '').trim();
                if (!type) {
                    return;
                }

                acc.set(
                    type,
                    roundMoney((acc.get(type) || 0) + Number(payment?.amount || 0))
                );
            });
            return acc;
        }, new Map<string, number>());

        return Array.from(totalsByType.entries())
            .map(([type, amount]) => ({ type, amount }))
            .filter((payment) => payment.amount > 0);
    }

    private static resolveRefundPricingDefinitions(
        applications: AppliedDiscountDetail[],
        snapshots: OrderDiscountDefinitionSnapshot[]
    ) {
        const snapshotsById = new Map(
            snapshots.map((snapshot) => [String(snapshot.id), snapshot] as const)
        );
        const snapshotsByDefinitionId = new Map(
            snapshots.map((snapshot) => [
                String(snapshot.discountDefinitionId),
                snapshot,
            ] as const)
        );

        return applications
            .map((application) => {
                const snapshot =
                    (application.orderDiscountSnapshotId
                        ? snapshotsById.get(String(application.orderDiscountSnapshotId))
                        : undefined) ||
                    snapshotsByDefinitionId.get(String(application.discountDefinitionId));

                return snapshot
                    ? OrderService.mapSnapshotToDiscountDefinition(snapshot)
                    : null;
            })
            .filter(Boolean) as DiscountDefinition[];
    }

    private static resolveRefundPricingContext(
        order: OrderEntity,
        snapshots: OrderDiscountDefinitionSnapshot[]
    ): OrderPricingSnapshotContext {
        const firstSnapshot = snapshots[0];

        return {
            pricingGeneratedAt:
                firstSnapshot?.pricingGeneratedAt ||
                order.appliedDiscountSummary?.pricingGeneratedAt ||
                order.orderDate ||
                order.createdAt ||
                order.updatedAt ||
                moment().toISOString(),
            pricingTimezone:
                firstSnapshot?.pricingTimezone || 'America/New_York',
            pricingStoreId: firstSnapshot?.pricingStoreId ?? null,
            pricingStationId:
                firstSnapshot?.pricingStationId ??
                OrderService.extractStationId(order.orderNo),
        };
    }

    private static mapSnapshotToDiscountDefinition(
        snapshot: OrderDiscountDefinitionSnapshot
    ): DiscountDefinition {
        return {
            id: snapshot.discountDefinitionId,
            tenantId: snapshot.tenantId,
            name: snapshot.name,
            code: snapshot.code ?? null,
            description: snapshot.description ?? null,
            status: snapshot.status as DiscountDefinition['status'],
            type: snapshot.type as DiscountDefinition['type'],
            method: snapshot.method as DiscountDefinition['method'],
            scope: snapshot.scope as DiscountDefinition['scope'],
            value: Number(snapshot.value || 0),
            priority: snapshot.priority ?? undefined,
            stackMode: snapshot.stackMode as DiscountDefinition['stackMode'],
            approvalRequired: snapshot.approvalRequired ?? false,
            reasonRequired: snapshot.reasonRequired ?? false,
            startDate: snapshot.startDate ?? null,
            endDate: snapshot.endDate ?? null,
            daysOfWeek: snapshot.daysOfWeek ?? null,
            startTime: snapshot.startTime ?? null,
            endTime: snapshot.endTime ?? null,
            minSubtotal: snapshot.minSubtotal ?? null,
            minQuantity: snapshot.minQuantity ?? null,
            usageLimitTotal: snapshot.usageLimitTotal ?? null,
            usageCountTotal: snapshot.usageCountTotal ?? null,
            applicableProductIds: snapshot.applicableProductIds ?? null,
            applicableCategoryIds: snapshot.applicableCategoryIds ?? null,
            excludedProductIds: snapshot.excludedProductIds ?? null,
            excludedCategoryIds: snapshot.excludedCategoryIds ?? null,
            excludeAlreadyDiscountedItems:
                snapshot.excludeAlreadyDiscountedItems ?? false,
            appliesToAllProducts: snapshot.appliesToAllProducts ?? false,
            stationIds: snapshot.stationIds ?? null,
            active: snapshot.active ?? snapshot.status === 'ACTIVE',
        };
    }

    private static mergeRefundQuantities(
        base: Map<string, number>,
        next: Map<string, number>
    ) {
        const merged = new Map(base);

        next.forEach((quantity, identifier) => {
            merged.set(identifier, roundMoney((merged.get(identifier) || 0) + quantity));
        });

        return merged;
    }

    private static buildRepricedCartPreview(
        order: OrderEntity,
        refundedQuantities: Map<string, number>,
        definitions: DiscountDefinition[],
        pricingTimestamp: string,
        timezone: string,
        stationId?: string | null
    ) {
        const cart = OrderEntityMapper.asCartState(order);
        cart.items = cart.items
            .map((item) => {
                const identifier = String(item.identifier || '');
                const refundedQuantity = Number(refundedQuantities.get(identifier) || 0);
                return {
                    ...item,
                    quantity: roundMoney(Number(item.quantity || 0) - refundedQuantity),
                };
            })
            .filter((item) => item.quantity > REFUND_QUANTITY_EPSILON);
        cart.definitions = definitions as never;
        cart.pricingContext = {
            timezone,
            stationId: stationId || null,
        };

        return PricingEngine.preview({
            now: pricingTimestamp,
            timezone,
            stationId: stationId || null,
            employee: {
                employeeId: order.employeeId || 'system',
                employeeName: order.employeeName || 'System',
            },
            policy: cart.policy,
            definitions: cart.definitions,
            lines: cart.items.map((item, index) => ({
                lineId: item.identifier || `line-${index}`,
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                baseUnitPrice: item.product.price,
                unitOfMeasure: item.product.unitOfMeasure,
                categoryId: item.product.categoryId,
                discountable: item.product.discountable ?? true,
                minAllowedPrice: item.product.minAllowedPrice,
                maxManualDiscountPercent: item.product.maxManualDiscountPercent,
                maxManualDiscountAmount: item.product.maxManualDiscountAmount,
            })),
            manualDiscounts: cart.manualDiscounts,
            priceOverrides: cart.priceOverrides,
            promoCodes: cart.promoCodes,
            approvalEvents: cart.approvalEvents,
            pricingSource: order.pricingSource,
        });
    }

    private static allocateRefundLines(
        order: OrderEntity,
        requestedRefunds: Map<string, number>,
        previouslyRefunded: Map<string, number>,
        refundAmount: number,
        fallbackLines: RefundLineComputation[]
    ) {
        if (refundAmount <= 0 || !fallbackLines.length) {
            return fallbackLines.map((line) => ({
                ...line,
                unitRefundAmount: 0,
                lineRefundAmount: 0,
            }));
        }

        const weightedLines = fallbackLines.map((line) => {
            const sourceLine = order.lines?.find((candidate) => candidate.identifier === line.identifier);
            const originalQuantity = Number(sourceLine?.quantity || 0);
            const priorRefundedQuantity = Number(previouslyRefunded.get(line.identifier) || 0);
            const remainingBeforeRefund = roundMoney(originalQuantity - priorRefundedQuantity);
            const baseRemainingTotal = roundMoney(
                Number(sourceLine?.lineTotalBeforeTax ?? sourceLine?.lineTotalAfterTax ?? (sourceLine?.price || 0) * originalQuantity)
            );
            const effectiveUnitAmount =
                remainingBeforeRefund > 0
                    ? roundMoney(baseRemainingTotal / originalQuantity)
                    : line.unitRefundAmount;
            const weight = roundMoney(effectiveUnitAmount * Number(requestedRefunds.get(line.identifier) || 0));

            return {
                line,
                weight: weight > 0 ? weight : line.lineRefundAmount,
            };
        });

        const totalWeight = roundMoney(
            weightedLines.reduce((sum, entry) => sum + Number(entry.weight || 0), 0)
        );

        if (totalWeight <= 0) {
            return fallbackLines;
        }

        let allocated = 0;

        return weightedLines.map((entry, index) => {
            const remaining = roundMoney(refundAmount - allocated);
            const lineRefundAmount =
                index === weightedLines.length - 1
                    ? remaining
                    : roundMoney((refundAmount * entry.weight) / totalWeight);
            allocated = roundMoney(allocated + lineRefundAmount);
            const quantityRefunded = Number(entry.line.quantityRefunded || 0);

            return {
                ...entry.line,
                lineRefundAmount,
                unitRefundAmount:
                    quantityRefunded > 0
                        ? roundMoney(lineRefundAmount / quantityRefunded)
                        : 0,
            };
        });
    }

    private static extractStationId(orderNo?: string | null) {
        if (!orderNo) return null;
        const [stationId] = String(orderNo).split('-');
        return stationId?.trim() || null;
    }

    private static isFullRefund(
        order: OrderEntity,
        requestedRefunds: Map<string, number>,
        previouslyRefunded: Map<string, number>
    ) {
        return (order.lines || []).every((item) => {
            const totalRefunded = roundMoney(
                Number(previouslyRefunded.get(item.identifier || '') || 0) +
                    Number(requestedRefunds.get(item.identifier || '') || 0)
            );
            return isFullyRefundedQuantity(Number(item.quantity || 0), totalRefunded);
        });
    }


    private static async getUpdatedOrder(
        req: UpdateOrderRequest,
        cb?: (order: MutableModel<Order, OrderMetaData>
    ) => void) {
        const existing = await DataStore.query(Order, req.id);

        if (!existing) {
            Alert.alert(`It seems that order: ${req.id} does not exist`);
            return null;
        }

        return Order.copyOf(existing, (o) => {
            o.baseSubtotal = req.order.footer.baseSubtotal;
            o.subtotal = req.order.footer.subtotal;
            o.tax = 0;
            o.total = req.order.footer.total;
            o.currentSubtotal = req.order.footer.baseSubtotal;
            o.currentDiscountTotal = req.order.footer.discount;
            o.currentTax = 0;
            o.currentTotal = req.order.footer.total;
            o.lineDiscountTotal = req.order.footer.lineDiscountTotal;
            o.orderDiscountTotal = req.order.footer.orderDiscountTotal;
            o.discountTotal = req.order.footer.discount;
            o.savingsTotal = req.order.footer.savingsTotal;
            o.promoCodes = req.order.promoCodes.map((promo) => promo.code);
            o.pricingVersion = 'discounts-v1';
            o.pricingSnapshotHash = buildPricingSnapshotHash(req.order);
            o.pricingSource = req.order.footer.pricingSource;
            o.reconciliationStatus = req.order.footer.reconciliationStatus;
            o.appliedDiscountSummary = toAppliedDiscountSummarySnapshot(
                req.order.appliedDiscountSummary
            );
            o.lines = buildOrderLines(req.order);

                o.updatedBy = {
                    id: req.by.id,
                    name: `${req.by.firstName} ${req.by.lastName}`
                }

            if (cb) {
                cb(o);
            }
        });
    }


    // static async payOrder(employee: EmployeeEntity, cart: CartState, payments: CartPayment[]) {
    //     // if (!cart.header?.orderNumber) return;
    //     // const employee = (thunkAPI.getState() as RootState).employees.loginEmployee!;
    //     if (!cart.header?.employeeId) {
    //         Alert.alert('Employee is information is missing');
    //         return;
    //     }

    //     const createdBy = await EmployeeService.getById(cart.header.employeeId);

    //     if (!employee) {
    //         Alert.alert(`Employee id: ${cart.header.employeeId} could not be found`);
    //         return;
    //     }

    //     const o = await OrderService.upsertOrder(employee, cart, 'PAID', payments);

    //     if (!o) {
    //         Alert.alert(`Order ${cart.header.orderNumber} not found`);
    //         return;
    //     }

    //     const updatedOrder = Order.copyOf(o, (updated) => {
    //         updated.status = 'PAID';
    //     });

    //     const paidOrder = await DataStore.save(updatedOrder);
    //     await OrderService.updateInventory(updatedOrder);

    //     return paidOrder;
    // }

    // static async upsertOrder(request: UpsertOrderRequest) {
    //     if (!request.order.id) {
    //         const order = new Order({
    //             orderNo: await StationService.getNextOrderNumber(request.createdBy),
    //             status: request.status || 'OPEN',
    //             subtotal: request.order.footer.subtotal,
    //             tax: 0,
    //             total: request.order.footer.total,
    //             employeeId: request.createdBy.id!,
    //             employeeName: `${request.createdBy.firstName} ${request.createdBy.lastName}`,
    //             lines: request.order.items.map(
    //                 (i) =>
    //                     new OrderLine({
    //                         identifier: i.identifier || uuid.v4().toString(),
    //                         quantity: i.quantity,
    //                         tax: 0,
    //                         price: i.product.price,
    //                         productId: i.product.id!,
    //                         barcode: i.product.barcode,
    //                         sku: i.product.sku,
    //                         productName: i.product.name,
    //                         unitOfMeasure: i.product.unitOfMeasure,
    //                     })
    //             ),
    //             paymentInfo: {
    //                 employeeId: string;
    //                 employeeName: string;
    //                 payments: request.paymentInfo.payments?.map(p => new Payment({
    //                     type: p.type.toUpperCase() as any,
    //                     amount: p.amount
    //                 }))
    //             },
    //             orderDate: moment().toISOString(),
    //         });

    //         console.log('Order status: ' + status, order);

    //         return await DataStore.save(order);
    //     }

    //     const existing = await DataStore.query(Order, request.order.id);

    //     if (!existing) {
    //         return console.log(
    //             `It seems that order: ${createdBy.id} has been removed`
    //         );
    //     }

    //     const updatedOrder = Order.copyOf(existing, (o) => {
    //         o.status = status || 'OPEN';
    //         o.subtotal = request.order.footer.subtotal;
    //         o.tax = 0;
    //         o.total = request.order.footer.total;
    //         o.employeeId = createdBy.id!;
    //         o.employeeName = `${createdBy.firstName} ${createdBy.lastName}`;
    //         o.lines = request.order.items.map(
    //             (i) =>
    //                 new OrderLine({
    //                     identifier: i.identifier!,
    //                     quantity: i.quantity,
    //                     tax: 0,
    //                     price: i.product.price,
    //                     productId: i.product.id!,
    //                     barcode: i.product.barcode,
    //                     sku: i.product.sku,
    //                     productName: i.product.name,
    //                     unitOfMeasure: i.product.unitOfMeasure,
    //                 })
    //         );
    //         o.orderDate = moment().toISOString();
    //         o.payments = payments?.map(p => new Payment({
    //             type: p.type.toUpperCase() as any,
    //             amount: p.amount
    //         }));
    //     });

    //     console.log('Updated order', updatedOrder);
        
    //     return await DataStore.save(updatedOrder);
    // }

    static async delete(id: string) {
        const item = await DataStore.query(Order, id);
        if (!item) return console.error(`Order Id: ${id} not found`);
        return DataStore.delete(item);
    }

    static search(items: OrderEntity[], options: FilterRequest) {
        // const lowerQuery = options.filter?.toLowerCase() || '';
        let searchResult: OrderEntity[];
        const fullOrderNumber = options.filter && isOrderNumber(options.filter);
        const matchesStatus = (status: OrderEntity['status']) =>
            status === options.status ||
            (options.status === 'PAID' && status === 'PARTIALLY_REFUNDED');

        if (fullOrderNumber) {
            searchResult = items.filter(
                (i) => matchesStatus(i.status) && i.orderNo === options.filter
            );
        } else {
            searchResult = items.filter((i) => {
                return (
                    matchesStatus(i.status) &&
                    (!options.filter || i.orderNo?.indexOf(options.filter) !== -1)
                );
            });
        }

        if (options.status === 'OPEN') {
            sortListBy(searchResult, 'createdAt');
        } else {
            sortDescListBy(searchResult, 'createdAt');
        }

        return searchResult;
    }

    static updateReorderPoint(id: string, value: number) {
        DataStore.query(Product, (p) => p.id.eq(id)).then((p) => {
            if (!p?.length) return;

            DataStore.save(
                Product.copyOf(p[0], (updated) => {
                    updated.reorderPoint = value;
                })
            );
        });
    }

    static updateReorderQuantity(id: string, value: number): void {
        DataStore.query(Product, (p) => p.id.eq(id)).then((p) => {
            if (!p?.length) return;

            DataStore.save(
                Product.copyOf(p[0], (updated) => {
                    updated.reorderQuantity = value;
                })
            );
        });
    }

    // static async refund(
    //     employee: EmployeeEntity,
    //     originalOrder: OrderEntity,
    //     refundedLines: { identifier: string; price: number; quantity: number }[]
    // ) {
    //     // First refund the entire original order
    //     const orders = await DataStore.query(Order, (o) =>
    //         o.id('eq', originalOrder.id)
    //     );
    //     const order = orders[0];
    //     if (!order) return;

    //     const refundedOrder = Order.copyOf(order, (o) => {
    //         o.status = OrderStatus.REFUNDED;
    //     });

    //     await DataStore.save(refundedOrder);
    //     await OrderService.updateInventory(refundedOrder);

    //     // then create a new one if necessary
    //     const cartOrder = OrderEntityMapper.asCartState(originalOrder);

    //     refundedLines.forEach((l) => {
    //         const line = cartOrder.items?.find(
    //             (li) => li.identifier === l.identifier && li.quantity > 0
    //         );

    //         if (line) {
    //             console.log(`Found product ${line.product.name}, removing 1`);
    //             line.quantity -= l.quantity;
    //         }
    //     });

    //     const newCart = await OrderEntityMapper.fromRefundedCart(
    //         employee,
    //         cartOrder
    //     );

    //     if (!newCart.items?.length) return;

    //     await OrderService.upsertOrder(employee, newCart, OrderStatus.PAID);
    // }
}

export function getInventoryQuantityDelta(
    status: OrderStatus | keyof typeof OrderStatus,
    quantityDelta: number
) {
    switch (status) {
        case 'PAID':
            return -1 * quantityDelta;
        case 'REFUNDED':
            return quantityDelta;
        default:
            return 0;
    }
}

function buildOrderLines(
    order: Omit<CartState, 'id'>,
    allocations?: Record<string, EbtLineAllocation>
) {
    return order.items.map((i, index) => {
        const identifier = i.identifier || getLineKey(i.identifier, index);
        const lineSummary = order.appliedDiscountSummary?.lineSummaries.find(
            (summary) => summary.lineId === identifier
        );
        const lineDiscounts = lineSummary?.discounts || [];
        const basePrice = i.product.price;
        const overrideApplication = lineDiscounts.find(
            (discount) => discount.applicationType === 'PRICE_OVERRIDE'
        );
        const lineTotal = lineSummary?.lineTotalBeforeTax ?? getLineTotal(i.quantity, i.product.price);
        const allocation = allocations?.[identifier];
        const lineInit: ConstructorParameters<typeof OrderLine>[0] = {
            identifier,
            quantity: i.quantity,
            tax: 0,
            price: basePrice,
            basePrice,
            overridePrice: overrideApplication?.value ?? null,
            netUnitPrice: i.quantity ? lineTotal / i.quantity : basePrice,
            lineSubtotalBeforeOrderDiscount:
                roundMoney(lineTotal + (lineSummary?.allocatedOrderDiscountTotal ?? 0)),
            lineDiscountTotal: lineSummary?.lineDiscountTotal ?? 0,
            allocatedOrderDiscountTotal: lineSummary?.allocatedOrderDiscountTotal ?? 0,
            lineTotalBeforeTax: lineTotal,
            lineTotalAfterTax: lineTotal,
            appliedDiscounts: lineDiscounts.length
                ? lineDiscounts.map(toAppliedDiscountDetailSnapshot)
                : undefined,
            productId: i.product.id!,
            categoryId: i.product.categoryId,
            barcode: i.product.barcode,
            sku: i.product.sku,
            productName: i.product.name,
            unitOfMeasure: i.product.unitOfMeasure,
            discountable: i.product.discountable ?? true,
            minAllowedPrice: i.product.minAllowedPrice ?? null,
            maxManualDiscountPercent: i.product.maxManualDiscountPercent ?? null,
            maxManualDiscountAmount: i.product.maxManualDiscountAmount ?? null,
            isEBTEligible: allocation?.isEBTEligible ?? !!i.product.isEBTEligible,
            ebtPaidAmount: allocation?.ebtPaidAmount ?? 0,
            nonEbtPaidAmount: allocation?.nonEbtPaidAmount ?? lineTotal,
        };

        return new OrderLine(lineInit);
    });
}

function getLineKey(identifier: string | undefined, index: number) {
    return identifier || `line-${index}`;
}

function buildPricingSnapshotHash(order: Omit<CartState, 'id'>) {
    const payload = JSON.stringify({
        items: order.items,
        footer: order.footer,
        manualDiscounts: order.manualDiscounts,
        priceOverrides: order.priceOverrides,
        summary: order.appliedDiscountSummary,
        promoCodes: order.promoCodes,
    });

    let hash = 0;
    for (let index = 0; index < payload.length; index += 1) {
        hash = (hash << 5) - hash + payload.charCodeAt(index);
        hash |= 0;
    }

    return `pricing-${Math.abs(hash)}`;
}

function roundMoney(value: number | null | undefined) {
    return Math.round(((value ?? 0) + Number.EPSILON) * 100) / 100;
}
