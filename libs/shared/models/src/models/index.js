// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const TenantUserRole = {
  "OWNER": "OWNER",
  "ADMIN": "ADMIN"
};

const CategoryDiscountPolicyMode = {
  "DEFAULT": "DEFAULT",
  "FORCE_INCLUDE": "FORCE_INCLUDE",
  "FORCE_EXCLUDE": "FORCE_EXCLUDE"
};

const DiscountDefinitionStatus = {
  "DRAFT": "DRAFT",
  "ACTIVE": "ACTIVE",
  "INACTIVE": "INACTIVE",
  "EXPIRED": "EXPIRED"
};

const DiscountDefinitionType = {
  "MANUAL": "MANUAL",
  "AUTOMATIC": "AUTOMATIC",
  "PROMO_CODE": "PROMO_CODE"
};

const DiscountMethod = {
  "PERCENT": "PERCENT",
  "AMOUNT": "AMOUNT",
  "FINAL_PRICE": "FINAL_PRICE"
};

const DiscountScope = {
  "LINE": "LINE",
  "ORDER": "ORDER"
};

const DiscountStackMode = {
  "EXCLUSIVE": "EXCLUSIVE",
  "STACKABLE": "STACKABLE",
  "BEST_PRICE_ONLY": "BEST_PRICE_ONLY"
};

const DiscountApplicationType = {
  "MANUAL_LINE_DISCOUNT": "MANUAL_LINE_DISCOUNT",
  "MANUAL_ORDER_DISCOUNT": "MANUAL_ORDER_DISCOUNT",
  "AUTOMATIC_DISCOUNT": "AUTOMATIC_DISCOUNT",
  "PROMO_CODE": "PROMO_CODE",
  "PRICE_OVERRIDE": "PRICE_OVERRIDE"
};

const DiscountApprovalStatus = {
  "NOT_REQUIRED": "NOT_REQUIRED",
  "APPROVED": "APPROVED",
  "REJECTED": "REJECTED"
};

const DiscountSourceKind = {
  "MANUAL": "manual",
  "AUTOMATIC": "automatic",
  "PROMO": "promo",
  "OVERRIDE": "override"
};

const PricingApprovalType = {
  "DISCOUNT": "DISCOUNT",
  "PRICE_OVERRIDE": "PRICE_OVERRIDE"
};

const PricingApprovalDecision = {
  "APPROVED": "APPROVED",
  "REJECTED": "REJECTED"
};

const PricingSource = {
  "ONLINE_VALIDATED": "ONLINE_VALIDATED",
  "OFFLINE_LOCAL": "OFFLINE_LOCAL"
};

const ReconciliationStatus = {
  "NOT_REQUIRED": "NOT_REQUIRED",
  "PENDING": "PENDING",
  "RECONCILED": "RECONCILED",
  "RECONCILED_WITH_EXCEPTION": "RECONCILED_WITH_EXCEPTION"
};

const CustomerCreditStatus = {
  "OK": "OK",
  "OVER_LIMIT": "OVER_LIMIT"
};

const CustomerCreditTransactionType = {
  "CREDIT_PURCHASE": "CREDIT_PURCHASE",
  "ACCOUNT_PAYMENT": "ACCOUNT_PAYMENT",
  "REFUND_REVERSAL": "REFUND_REVERSAL",
  "ADJUSTMENT": "ADJUSTMENT"
};

const InventoryApplyState = {
  "PENDING": "PENDING",
  "APPLYING": "APPLYING",
  "APPLIED": "APPLIED",
  "FAILED": "FAILED"
};

const RefundType = {
  "PARTIAL": "PARTIAL",
  "FULL": "FULL"
};

const OrderRefundStatus = {
  "COMPLETED": "COMPLETED",
  "FAILED": "FAILED"
};

const PaymentType = {
  "CASH": "CASH",
  "CHECK": "CHECK",
  "CC": "CC",
  "EBT": "EBT",
  "CREDIT": "CREDIT"
};

const OrderStatus = {
  "OPEN": "OPEN",
  "PARTIALLY_REFUNDED": "PARTIALLY_REFUNDED",
  "REFUNDED": "REFUNDED",
  "PAID": "PAID"
};

const InventoryCountStatus = {
  "IN_PROGRESS": "IN_PROGRESS",
  "COMPLETED": "COMPLETED"
};

const InventoryReceiveStatus = {
  "IN_PROGRESS": "IN_PROGRESS",
  "COMPLETED": "COMPLETED"
};

const { Tenant, TenantUser, Store, Brand, Category, Customer, CustomerCreditTransaction, Employee, Order, OrderRefund, OrderRefundLine, OrderDiscountDefinitionSnapshot, Product, UnitOfMeasure, InventoryChanges, InventoryCount, InventoryCountLine, InventoryReceive, InventoryReceiveLine, Printer, Station, GlobalSettings, DiscountDefinition, DiscountReasonCode, EmployeeDiscountPolicy, DiscountPreset, DiscountApplication, ApprovalEvent, DiscountReconciliationException, PaymentInfo, RefundInfo, ByEmployee, AppliedDiscountDetailSnapshot, PricingApprovalEventSnapshot, AppliedLineDiscountSummarySnapshot, AppliedDiscountSummarySnapshot, OrderLine, Payment, ProductSaleSummary, EmployeeSaleSummary, DatePartSaleSummary, SalesSummary, InventoryProductFinalizeResult, InventoryFinalizeResult } = initSchema(schema);

export {
  Tenant,
  TenantUser,
  Store,
  Brand,
  Category,
  Customer,
  CustomerCreditTransaction,
  Employee,
  Order,
  OrderRefund,
  OrderRefundLine,
  OrderDiscountDefinitionSnapshot,
  Product,
  UnitOfMeasure,
  InventoryChanges,
  InventoryCount,
  InventoryCountLine,
  InventoryReceive,
  InventoryReceiveLine,
  Printer,
  Station,
  GlobalSettings,
  DiscountDefinition,
  DiscountReasonCode,
  EmployeeDiscountPolicy,
  DiscountPreset,
  DiscountApplication,
  ApprovalEvent,
  DiscountReconciliationException,
  TenantUserRole,
  CategoryDiscountPolicyMode,
  DiscountDefinitionStatus,
  DiscountDefinitionType,
  DiscountMethod,
  DiscountScope,
  DiscountStackMode,
  DiscountApplicationType,
  DiscountApprovalStatus,
  DiscountSourceKind,
  PricingApprovalType,
  PricingApprovalDecision,
  PricingSource,
  ReconciliationStatus,
  CustomerCreditStatus,
  CustomerCreditTransactionType,
  InventoryApplyState,
  RefundType,
  OrderRefundStatus,
  PaymentType,
  OrderStatus,
  InventoryCountStatus,
  InventoryReceiveStatus,
  PaymentInfo,
  RefundInfo,
  ByEmployee,
  AppliedDiscountDetailSnapshot,
  PricingApprovalEventSnapshot,
  AppliedLineDiscountSummarySnapshot,
  AppliedDiscountSummarySnapshot,
  OrderLine,
  Payment,
  ProductSaleSummary,
  EmployeeSaleSummary,
  DatePartSaleSummary,
  SalesSummary,
  InventoryProductFinalizeResult,
  InventoryFinalizeResult
};