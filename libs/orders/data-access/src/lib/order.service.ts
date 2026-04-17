import { MutableModel } from '@aws-amplify/datastore';
/* eslint-disable @nx/enforce-module-boundaries */
import { Order, OrderLine, OrderMetaData, OrderStatus, Payment, PaymentInfo, Product, RefundInfo } from '@pos/shared/models';
import { DataStore } from '@pos/shared/amplify';
import { OrderEntity, OrderEntityMapper } from './order.entity';
import { CartPayment, CartState } from '@pos/sales/data-access';
import { Alert } from 'react-native';
import moment from 'moment';
import uuid from 'react-native-uuid';
import { EmployeeEntity, EmployeeService } from '@pos/employees/data-access';
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
} from '@pos/discounts/domain';

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
}

export interface UpsertOrderRequest extends CreateOrderRequest {
    status?: OrderStatus | keyof typeof OrderStatus;
    paymentInfo: PaymentInfo;
    refundInfo: RefundInfo;
}

export interface CreatePaidOrderRequest extends CreateOrderRequest {
    payments: CartPayment[];
}

const logOrderTiming = (step: string, details?: Record<string, unknown>) => {
    void step;
    void details;
};

const buildOrderInventoryOperationId = (
    orderId: string,
    status: 'PAID' | 'REFUNDED'
) => `ORDER:${orderId}:${status}`;

const toAppliedDiscountDetailSnapshot = (
    discount: AppliedDiscountDetail
): AppliedDiscountDetail => ({
    discountApplicationId: discount.discountApplicationId,
    discountDefinitionId: discount.discountDefinitionId ?? null,
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

export class OrderService {

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
            request.order.items.map((item) => ({
                identifier: item.identifier,
                quantity: item.quantity,
                price: item.product.price,
                isEBTEligible: item.product.isEBTEligible ?? false,
            })),
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
            request.order.items.map((item) => ({
                identifier: item.identifier,
                quantity: item.quantity,
                price: item.product.price,
                isEBTEligible: item.product.isEBTEligible ?? false,
            })),
            request.payments
        );

        const orderId = request.order.id || String(uuid.v4());
        const order = new Order(stampTenant({
            id: orderId,
            orderNo:
                request.order.orderNo ??
                (await StationService.getNextOrderNumber(request.by)),
            status: 'PAID',
            baseSubtotal: request.order.footer.baseSubtotal,
            subtotal: request.order.footer.subtotal,
            tax: 0,
            total: request.order.footer.total,
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
            lines: buildOrderLines(request.order, allocations),
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
            request.order.items.map((item) => ({
                identifier: item.identifier,
                quantity: item.quantity,
                price: item.product.price,
                isEBTEligible: item.product.isEBTEligible ?? false,
            })),
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
            request.order.items.map((item) => ({
                identifier: item.identifier,
                quantity: item.quantity,
                price: item.product.price,
                isEBTEligible: item.product.isEBTEligible ?? false,
            })),
            request.payments
        );

        const updatedOrder = Order.copyOf(order, (o) => {
            o.tenantId = order.tenantId || requireCurrentTenantId();
            o.baseSubtotal = request.order.footer.baseSubtotal;
            o.subtotal = request.order.footer.subtotal;
            o.tax = 0;
            o.total = request.order.footer.total;
            o.lineDiscountTotal = request.order.footer.lineDiscountTotal;
            o.orderDiscountTotal = request.order.footer.orderDiscountTotal;
            o.discountTotal = request.order.footer.discount;
            o.savingsTotal = request.order.footer.savingsTotal;
            o.promoCodes = request.order.promoCodes.map((promo) => promo.code);
            o.pricingVersion = 'discounts-v1';
            o.pricingSnapshotHash = buildPricingSnapshotHash(request.order);
            o.pricingSource = request.order.footer.pricingSource;
            o.reconciliationStatus = request.order.footer.reconciliationStatus;
            o.appliedDiscountSummary = toAppliedDiscountSummarySnapshot(
                request.order.appliedDiscountSummary
            );
            o.status = 'PAID';
            o.lines = buildOrderLines(request.order, allocations);
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

        const refundedOrder = Order.copyOf(existing, (o) => {
            o.tenantId = existing.tenantId || requireCurrentTenantId();
            o.status = 'REFUNDED';
            o.inventoryApplyState = 'PENDING';
            o.inventoryAppliedAt = null;
            o.inventoryApplyOperationId = buildOrderInventoryOperationId(
                existing.id,
                'REFUNDED'
            );
            o.inventoryApplyError = null;
            o.refundInfo = {
                employeeId: request.by.id,
                employeeName: `${request.by.firstName} ${request.by.lastName}`
            }
        });

        const savedRefundedOrder = await DataStore.save(refundedOrder);

        const hasCartItems = !!(request.order as unknown as CartState)?.items;
        const cartOrder: CartState = hasCartItems
            ? ({
                  ...(request.order as unknown as CartState),
                  id: request.id,
              } as CartState)
            : OrderEntityMapper.asCartState({
                  id: request.id,
                  orderNo: (request.order as unknown as Partial<OrderEntity>).orderNo || existing.orderNo,
                  subtotal:
                      (request.order as unknown as Partial<OrderEntity>).subtotal ??
                      existing.subtotal,
                  tax: (request.order as unknown as Partial<OrderEntity>).tax ?? existing.tax,
                  total:
                      (request.order as unknown as Partial<OrderEntity>).total ??
                      existing.total,
                  status:
                      ((request.order as unknown as Partial<OrderEntity>).status as
                          | OrderStatus
                          | keyof typeof OrderStatus
                          | undefined) || existing.status,
                  employeeId:
                      (request.order as unknown as Partial<OrderEntity>).employeeId ||
                      existing.employeeId,
                  employeeName:
                      (request.order as unknown as Partial<OrderEntity>).employeeName ||
                      existing.employeeName,
                  lines:
                      (request.order as unknown as Partial<OrderEntity>).lines ||
                      OrderEntityMapper.fromModel(existing).lines,
                  payments:
                      (request.order as unknown as Partial<OrderEntity>).payments ||
                      null,
                  paymentInfo:
                      (request.order as unknown as Partial<OrderEntity>).paymentInfo ||
                      null,
                  refundInfo:
                      (request.order as unknown as Partial<OrderEntity>).refundInfo ||
                      null,
                  orderDate:
                      (request.order as unknown as Partial<OrderEntity>).orderDate ||
                      existing.orderDate,
                  createdAt:
                      (request.order as unknown as Partial<OrderEntity>).createdAt ||
                      existing.createdAt,
                  updatedAt:
                      (request.order as unknown as Partial<OrderEntity>).updatedAt ||
                      existing.updatedAt,
              } as OrderEntity);

        request.refundedLines.forEach((l) => {
            const line = cartOrder.items.find(
                (li) => li.identifier === l.identifier && li.quantity > 0
            );

            if (line) {
                line.quantity -= l.quantity;
            }
        });

        const newCart = await OrderEntityMapper.fromRefundedCart(
            request.by,
            cartOrder
        );

        if (!newCart.items?.length) return savedRefundedOrder;
        const createdBy = await EmployeeService.getById(refundedOrder.employeeId);

        if  (!createdBy) {
            Alert.alert(`Employee ${refundedOrder.employeeId} not found`);
            return savedRefundedOrder;
        }

        await OrderService.create({
            by: createdBy,// get original employee
            order: newCart
        }) // .upsertOrder(employee, newCart, OrderStatus.PAID);

        return savedRefundedOrder;
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

        if (fullOrderNumber) {
            searchResult = items.filter(i => i.status === options.status && i.orderNo === options.filter)
        } else {
            searchResult = items.filter((i) => {
                return (
                    i.status === options.status &&
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

function roundMoney(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
