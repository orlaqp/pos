/* eslint-disable @nx/enforce-module-boundaries */
import {
  AppliedDiscountDetail,
  AppliedDiscountSummary,
  DiscountPricingSource,
  DiscountReconciliationStatus,
  restoreDiscountStateFromSummary,
} from '@pos/discounts/domain';
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
  baseSubtotal: number;
  subtotal: number;
  lineDiscountTotal: number;
  orderDiscountTotal: number;
  discountTotal: number;
  savingsTotal: number;
  tax: number;
  total: number;
  status: OrderStatus | keyof typeof OrderStatus;
  employeeId: string;
  employeeName: string;
  promoCodes?: string[] | null;
  pricingVersion?: string | null;
  pricingSnapshotHash?: string | null;
  pricingSource: DiscountPricingSource;
  reconciliationStatus: DiscountReconciliationStatus;
  appliedDiscountSummary?: AppliedDiscountSummary | null;
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
  basePrice: number;
  overridePrice?: number | null;
  netUnitPrice: number;
  lineSubtotalBeforeOrderDiscount: number;
  lineDiscountTotal: number;
  allocatedOrderDiscountTotal: number;
  lineTotalBeforeTax: number;
  lineTotalAfterTax: number;
  appliedDiscounts?: AppliedDiscountDetail[] | null;
  categoryId?: string | null;
  discountable?: boolean | null;
  minAllowedPrice?: number | null;
  maxManualDiscountPercent?: number | null;
  maxManualDiscountAmount?: number | null;
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
        baseSubtotal: 0,
        discount: 0,
        lineDiscountTotal: 0,
        orderDiscountTotal: 0,
        subtotal: 0,
        tax: 0,
        savingsTotal: 0,
        total: 0,
        pricingSource: 'OFFLINE_LOCAL',
        reconciliationStatus: 'PENDING',
      },
      definitions: [],
      manualDiscounts: [],
      priceOverrides: [],
      promoCodes: [],
      approvalEvents: [],
      selected: undefined,
    };
  }

  private static cleanCartProductName(name?: string) {
    if (!name) return '';
    return name.replace(/^(?:NON-EBT|EBT)\s+/i, '');
  }

  private static parseAppliedDiscountSummary(
    value: unknown
  ): AppliedDiscountSummary | null {
    if (!value) return null;
    if (typeof value === 'object') return value as AppliedDiscountSummary;
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed[0] !== '{' && trimmed[0] !== '[') return null;

    try {
      return JSON.parse(trimmed) as AppliedDiscountSummary;
    } catch {
      return null;
    }
  }

  private static parseAppliedDiscounts(
    value: unknown
  ): AppliedDiscountDetail[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as AppliedDiscountDetail[];
    if (typeof value !== 'string') return [];

    const trimmed = value.trim();
    if (!trimmed || (trimmed[0] !== '[' && trimmed[0] !== '{')) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? (parsed as AppliedDiscountDetail[]) : [];
    } catch {
      return [];
    }
  }

  static fromModel(p: Order): OrderEntity {
    return {
      id: p.id,
      orderNo: p.orderNo,
      baseSubtotal: p.baseSubtotal ?? p.subtotal,
      subtotal: p.subtotal,
      lineDiscountTotal: p.lineDiscountTotal ?? 0,
      orderDiscountTotal: p.orderDiscountTotal ?? 0,
      discountTotal: p.discountTotal ?? 0,
      savingsTotal: p.savingsTotal ?? p.discountTotal ?? 0,
      tax: p.tax,
      total: p.total,
      status: p.status,
      employeeId: p.employeeId,
      employeeName: p.employeeName,
      promoCodes: (p.promoCodes || []).filter((code): code is string => !!code),
      pricingVersion: p.pricingVersion,
      pricingSnapshotHash: p.pricingSnapshotHash,
      pricingSource: (p.pricingSource as DiscountPricingSource) || 'OFFLINE_LOCAL',
      reconciliationStatus:
        (p.reconciliationStatus as DiscountReconciliationStatus) || 'PENDING',
      appliedDiscountSummary: OrderEntityMapper.parseAppliedDiscountSummary(
        p.appliedDiscountSummary
      ),
      lines: p.lines?.filter((i) => i !== null).map((i) => OrderEntityMapper.fromLine(i!)),
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
      baseSubtotal: o.baseSubtotal,
      discount: o.discountTotal,
      lineDiscountTotal: o.lineDiscountTotal,
      orderDiscountTotal: o.orderDiscountTotal,
      subtotal: o.subtotal,
      tax: o.tax,
      savingsTotal: o.savingsTotal,
      total: o.total,
      pricingSource: o.pricingSource,
      reconciliationStatus: o.reconciliationStatus,
    };
    state.header = {
      orderDate: o.orderDate || new Date().toISOString(),
      orderNumber: o.id,
      status: o.status,
      employeeId: o.employeeId,
      employeeName: o.employeeName,
    };
    state.items =
      o.lines?.map((i) => ({
        quantity: i.quantity,
        identifier: i.identifier,
        product: {
          id: i.productId,
          name: OrderEntityMapper.cleanCartProductName(i.productName),
          price: i.basePrice ?? i.price,
          unitOfMeasure: i.unitOfMeasure,
          categoryId: i.categoryId,
          barcode: i.barcode,
          sku: i.sku,
          isEBTEligible: i.isEBTEligible ?? false,
          discountable: i.discountable ?? true,
          minAllowedPrice: i.minAllowedPrice ?? null,
          maxManualDiscountPercent: i.maxManualDiscountPercent ?? null,
          maxManualDiscountAmount: i.maxManualDiscountAmount ?? null,
        },
      })) || [];
    state.payments = o.payments?.map((p) => ({
      type: p.type,
      amount: p.amount,
    }));
    state.promoCodes = (o.promoCodes || []).map((code) => ({ code }));
    state.appliedDiscountSummary = o.appliedDiscountSummary || undefined;
    const restoredDiscountState = restoreDiscountStateFromSummary(
      state.appliedDiscountSummary
    );
    state.manualDiscounts = restoredDiscountState.manualDiscounts;
    state.priceOverrides = restoredDiscountState.priceOverrides;
    state.approvalEvents = state.appliedDiscountSummary?.approvalEvents || [];
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
      basePrice: l.basePrice ?? l.price,
      overridePrice: l.overridePrice ?? null,
      netUnitPrice: l.netUnitPrice ?? l.price,
      lineSubtotalBeforeOrderDiscount: l.lineSubtotalBeforeOrderDiscount ?? l.price * l.quantity,
      lineDiscountTotal: l.lineDiscountTotal ?? 0,
      allocatedOrderDiscountTotal: l.allocatedOrderDiscountTotal ?? 0,
      lineTotalBeforeTax: l.lineTotalBeforeTax ?? l.price * l.quantity,
      lineTotalAfterTax: l.lineTotalAfterTax ?? l.price * l.quantity,
      appliedDiscounts: OrderEntityMapper.parseAppliedDiscounts(l.appliedDiscounts),
      unitOfMeasure: l.unitOfMeasure,
      categoryId: l.categoryId,
      discountable: l.discountable ?? true,
      minAllowedPrice: l.minAllowedPrice ?? null,
      maxManualDiscountPercent: l.maxManualDiscountPercent ?? null,
      maxManualDiscountAmount: l.maxManualDiscountAmount ?? null,
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
      .map((i) => ({
        quantity: i.quantity,
        identifier: i.identifier,
        product: {
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          unitOfMeasure: i.product.unitOfMeasure,
          categoryId: i.product.categoryId,
          barcode: i.product.barcode,
          sku: i.product.sku,
          isEBTEligible: i.product.isEBTEligible ?? false,
          discountable: i.product.discountable ?? true,
          minAllowedPrice: i.product.minAllowedPrice ?? null,
          maxManualDiscountPercent: i.product.maxManualDiscountPercent ?? null,
          maxManualDiscountAmount: i.product.maxManualDiscountAmount ?? null,
        },
      }));

    const total = state.items.reduce(
      (prev, next) => prev + next.product.price * next.quantity,
      0
    );

    state.footer = {
      baseSubtotal: total,
      discount: 0,
      lineDiscountTotal: 0,
      orderDiscountTotal: 0,
      subtotal: total,
      tax: cart.footer?.tax || 0,
      savingsTotal: 0,
      total,
      pricingSource: 'OFFLINE_LOCAL',
      reconciliationStatus: 'PENDING',
    };

    return state;
  }

  static fromPayment(p: Payment): PaymentEntity {
    return {
      type: p.type,
      amount: p.amount,
    };
  }
}
