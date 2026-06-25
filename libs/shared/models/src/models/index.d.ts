import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncItem } from "@aws-amplify/datastore";

export enum TenantUserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN"
}

export enum CategoryDiscountPolicyMode {
  DEFAULT = "DEFAULT",
  FORCE_INCLUDE = "FORCE_INCLUDE",
  FORCE_EXCLUDE = "FORCE_EXCLUDE"
}

export enum DiscountDefinitionStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED"
}

export enum DiscountDefinitionType {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
  PROMO_CODE = "PROMO_CODE"
}

export enum DiscountMethod {
  PERCENT = "PERCENT",
  AMOUNT = "AMOUNT",
  FINAL_PRICE = "FINAL_PRICE"
}

export enum DiscountScope {
  LINE = "LINE",
  ORDER = "ORDER"
}

export enum DiscountStackMode {
  EXCLUSIVE = "EXCLUSIVE",
  STACKABLE = "STACKABLE",
  BEST_PRICE_ONLY = "BEST_PRICE_ONLY"
}

export enum DiscountApplicationType {
  MANUAL_LINE_DISCOUNT = "MANUAL_LINE_DISCOUNT",
  MANUAL_ORDER_DISCOUNT = "MANUAL_ORDER_DISCOUNT",
  AUTOMATIC_DISCOUNT = "AUTOMATIC_DISCOUNT",
  PROMO_CODE = "PROMO_CODE",
  PRICE_OVERRIDE = "PRICE_OVERRIDE"
}

export enum DiscountApprovalStatus {
  NOT_REQUIRED = "NOT_REQUIRED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum DiscountSourceKind {
  MANUAL = "manual",
  AUTOMATIC = "automatic",
  PROMO = "promo",
  OVERRIDE = "override"
}

export enum PricingApprovalType {
  DISCOUNT = "DISCOUNT",
  PRICE_OVERRIDE = "PRICE_OVERRIDE"
}

export enum PricingApprovalDecision {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum PricingSource {
  ONLINE_VALIDATED = "ONLINE_VALIDATED",
  OFFLINE_LOCAL = "OFFLINE_LOCAL"
}

export enum ReconciliationStatus {
  NOT_REQUIRED = "NOT_REQUIRED",
  PENDING = "PENDING",
  RECONCILED = "RECONCILED",
  RECONCILED_WITH_EXCEPTION = "RECONCILED_WITH_EXCEPTION"
}

export enum InventoryApplyState {
  PENDING = "PENDING",
  APPLYING = "APPLYING",
  APPLIED = "APPLIED",
  FAILED = "FAILED"
}

export enum RefundType {
  PARTIAL = "PARTIAL",
  FULL = "FULL"
}

export enum OrderRefundStatus {
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

export enum PaymentType {
  CASH = "CASH",
  CHECK = "CHECK",
  CC = "CC",
  EBT = "EBT"
}

export enum OrderStatus {
  OPEN = "OPEN",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
  REFUNDED = "REFUNDED",
  PAID = "PAID"
}

export enum InventoryCountStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export enum InventoryReceiveStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

type EagerPaymentInfo = {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly payments?: (Payment | null)[] | null;
}

type LazyPaymentInfo = {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly payments?: (Payment | null)[] | null;
}

export declare type PaymentInfo = LazyLoading extends LazyLoadingDisabled ? EagerPaymentInfo : LazyPaymentInfo

export declare const PaymentInfo: (new (init: ModelInit<PaymentInfo>) => PaymentInfo)

type EagerRefundInfo = {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly comments?: string | null;
}

type LazyRefundInfo = {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly comments?: string | null;
}

export declare type RefundInfo = LazyLoading extends LazyLoadingDisabled ? EagerRefundInfo : LazyRefundInfo

export declare const RefundInfo: (new (init: ModelInit<RefundInfo>) => RefundInfo)

type EagerByEmployee = {
  readonly id: string;
  readonly name: string;
}

type LazyByEmployee = {
  readonly id: string;
  readonly name: string;
}

export declare type ByEmployee = LazyLoading extends LazyLoadingDisabled ? EagerByEmployee : LazyByEmployee

export declare const ByEmployee: (new (init: ModelInit<ByEmployee>) => ByEmployee)

type EagerAppliedDiscountDetailSnapshot = {
  readonly discountApplicationId: string;
  readonly discountDefinitionId?: string | null;
  readonly orderDiscountSnapshotId?: string | null;
  readonly applicationType: DiscountApplicationType | keyof typeof DiscountApplicationType;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly name: string;
  readonly code?: string | null;
  readonly stackMode: DiscountStackMode | keyof typeof DiscountStackMode;
  readonly source: DiscountSourceKind | keyof typeof DiscountSourceKind;
  readonly value: number;
  readonly originalAmount: number;
  readonly discountAmount: number;
  readonly finalAmount: number;
  readonly quantityBasis?: number | null;
  readonly reasonCode?: string | null;
  readonly reasonNote?: string | null;
  readonly appliedByEmployeeId?: string | null;
  readonly appliedByEmployeeName?: string | null;
  readonly approvedByEmployeeId?: string | null;
  readonly approvedByEmployeeName?: string | null;
  readonly approvalRequired?: boolean | null;
  readonly approvalStatus?: DiscountApprovalStatus | keyof typeof DiscountApprovalStatus | null;
  readonly approvalReference?: string | null;
  readonly sourceSnapshot?: string | null;
  readonly appliedAt: string;
}

type LazyAppliedDiscountDetailSnapshot = {
  readonly discountApplicationId: string;
  readonly discountDefinitionId?: string | null;
  readonly orderDiscountSnapshotId?: string | null;
  readonly applicationType: DiscountApplicationType | keyof typeof DiscountApplicationType;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly name: string;
  readonly code?: string | null;
  readonly stackMode: DiscountStackMode | keyof typeof DiscountStackMode;
  readonly source: DiscountSourceKind | keyof typeof DiscountSourceKind;
  readonly value: number;
  readonly originalAmount: number;
  readonly discountAmount: number;
  readonly finalAmount: number;
  readonly quantityBasis?: number | null;
  readonly reasonCode?: string | null;
  readonly reasonNote?: string | null;
  readonly appliedByEmployeeId?: string | null;
  readonly appliedByEmployeeName?: string | null;
  readonly approvedByEmployeeId?: string | null;
  readonly approvedByEmployeeName?: string | null;
  readonly approvalRequired?: boolean | null;
  readonly approvalStatus?: DiscountApprovalStatus | keyof typeof DiscountApprovalStatus | null;
  readonly approvalReference?: string | null;
  readonly sourceSnapshot?: string | null;
  readonly appliedAt: string;
}

export declare type AppliedDiscountDetailSnapshot = LazyLoading extends LazyLoadingDisabled ? EagerAppliedDiscountDetailSnapshot : LazyAppliedDiscountDetailSnapshot

export declare const AppliedDiscountDetailSnapshot: (new (init: ModelInit<AppliedDiscountDetailSnapshot>) => AppliedDiscountDetailSnapshot)

type EagerPricingApprovalEventSnapshot = {
  readonly id: string;
  readonly approvalType: PricingApprovalType | keyof typeof PricingApprovalType;
  readonly requestingEmployeeId: string;
  readonly approvingEmployeeId: string;
  readonly requestedAction: string;
  readonly reasonCode?: string | null;
  readonly reasonNote?: string | null;
  readonly policySnapshot?: string | null;
  readonly status: PricingApprovalDecision | keyof typeof PricingApprovalDecision;
  readonly createdAt: string;
}

type LazyPricingApprovalEventSnapshot = {
  readonly id: string;
  readonly approvalType: PricingApprovalType | keyof typeof PricingApprovalType;
  readonly requestingEmployeeId: string;
  readonly approvingEmployeeId: string;
  readonly requestedAction: string;
  readonly reasonCode?: string | null;
  readonly reasonNote?: string | null;
  readonly policySnapshot?: string | null;
  readonly status: PricingApprovalDecision | keyof typeof PricingApprovalDecision;
  readonly createdAt: string;
}

export declare type PricingApprovalEventSnapshot = LazyLoading extends LazyLoadingDisabled ? EagerPricingApprovalEventSnapshot : LazyPricingApprovalEventSnapshot

export declare const PricingApprovalEventSnapshot: (new (init: ModelInit<PricingApprovalEventSnapshot>) => PricingApprovalEventSnapshot)

type EagerAppliedLineDiscountSummarySnapshot = {
  readonly lineId: string;
  readonly discounts: AppliedDiscountDetailSnapshot[];
  readonly lineDiscountTotal: number;
  readonly allocatedOrderDiscountTotal: number;
  readonly lineTotalBeforeTax: number;
}

type LazyAppliedLineDiscountSummarySnapshot = {
  readonly lineId: string;
  readonly discounts: AppliedDiscountDetailSnapshot[];
  readonly lineDiscountTotal: number;
  readonly allocatedOrderDiscountTotal: number;
  readonly lineTotalBeforeTax: number;
}

export declare type AppliedLineDiscountSummarySnapshot = LazyLoading extends LazyLoadingDisabled ? EagerAppliedLineDiscountSummarySnapshot : LazyAppliedLineDiscountSummarySnapshot

export declare const AppliedLineDiscountSummarySnapshot: (new (init: ModelInit<AppliedLineDiscountSummarySnapshot>) => AppliedLineDiscountSummarySnapshot)

type EagerAppliedDiscountSummarySnapshot = {
  readonly applications: AppliedDiscountDetailSnapshot[];
  readonly approvalEvents: PricingApprovalEventSnapshot[];
  readonly lineSummaries: AppliedLineDiscountSummarySnapshot[];
  readonly orderLevelAdjustments: AppliedDiscountDetailSnapshot[];
  readonly warnings: string[];
  readonly pricingGeneratedAt: string;
}

type LazyAppliedDiscountSummarySnapshot = {
  readonly applications: AppliedDiscountDetailSnapshot[];
  readonly approvalEvents: PricingApprovalEventSnapshot[];
  readonly lineSummaries: AppliedLineDiscountSummarySnapshot[];
  readonly orderLevelAdjustments: AppliedDiscountDetailSnapshot[];
  readonly warnings: string[];
  readonly pricingGeneratedAt: string;
}

export declare type AppliedDiscountSummarySnapshot = LazyLoading extends LazyLoadingDisabled ? EagerAppliedDiscountSummarySnapshot : LazyAppliedDiscountSummarySnapshot

export declare const AppliedDiscountSummarySnapshot: (new (init: ModelInit<AppliedDiscountSummarySnapshot>) => AppliedDiscountSummarySnapshot)

type EagerOrderLine = {
  readonly identifier: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly barcode?: string | null;
  readonly sku?: string | null;
  readonly quantity: number;
  readonly tax: number;
  readonly price: number;
  readonly basePrice?: number | null;
  readonly overridePrice?: number | null;
  readonly netUnitPrice?: number | null;
  readonly lineSubtotalBeforeOrderDiscount?: number | null;
  readonly lineDiscountTotal?: number | null;
  readonly allocatedOrderDiscountTotal?: number | null;
  readonly lineTotalBeforeTax?: number | null;
  readonly lineTotalAfterTax?: number | null;
  readonly appliedDiscounts?: AppliedDiscountDetailSnapshot[] | null;
  readonly categoryId?: string | null;
  readonly discountable?: boolean | null;
  readonly taxable?: boolean | null;
  readonly minAllowedPrice?: number | null;
  readonly maxManualDiscountPercent?: number | null;
  readonly maxManualDiscountAmount?: number | null;
  readonly isEBTEligible?: boolean | null;
  readonly ebtPaidAmount?: number | null;
  readonly nonEbtPaidAmount?: number | null;
}

type LazyOrderLine = {
  readonly identifier: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly barcode?: string | null;
  readonly sku?: string | null;
  readonly quantity: number;
  readonly tax: number;
  readonly price: number;
  readonly basePrice?: number | null;
  readonly overridePrice?: number | null;
  readonly netUnitPrice?: number | null;
  readonly lineSubtotalBeforeOrderDiscount?: number | null;
  readonly lineDiscountTotal?: number | null;
  readonly allocatedOrderDiscountTotal?: number | null;
  readonly lineTotalBeforeTax?: number | null;
  readonly lineTotalAfterTax?: number | null;
  readonly appliedDiscounts?: AppliedDiscountDetailSnapshot[] | null;
  readonly categoryId?: string | null;
  readonly discountable?: boolean | null;
  readonly taxable?: boolean | null;
  readonly minAllowedPrice?: number | null;
  readonly maxManualDiscountPercent?: number | null;
  readonly maxManualDiscountAmount?: number | null;
  readonly isEBTEligible?: boolean | null;
  readonly ebtPaidAmount?: number | null;
  readonly nonEbtPaidAmount?: number | null;
}

export declare type OrderLine = LazyLoading extends LazyLoadingDisabled ? EagerOrderLine : LazyOrderLine

export declare const OrderLine: (new (init: ModelInit<OrderLine>) => OrderLine)

type EagerPayment = {
  readonly type: PaymentType | keyof typeof PaymentType;
  readonly amount: number;
}

type LazyPayment = {
  readonly type: PaymentType | keyof typeof PaymentType;
  readonly amount: number;
}

export declare type Payment = LazyLoading extends LazyLoadingDisabled ? EagerPayment : LazyPayment

export declare const Payment: (new (init: ModelInit<Payment>) => Payment)

type EagerProductSaleSummary = {
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly quantity: number;
  readonly amount: number;
}

type LazyProductSaleSummary = {
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly quantity: number;
  readonly amount: number;
}

export declare type ProductSaleSummary = LazyLoading extends LazyLoadingDisabled ? EagerProductSaleSummary : LazyProductSaleSummary

export declare const ProductSaleSummary: (new (init: ModelInit<ProductSaleSummary>) => ProductSaleSummary)

type EagerEmployeeSaleSummary = {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly orders: number;
  readonly amount: number;
}

type LazyEmployeeSaleSummary = {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly orders: number;
  readonly amount: number;
}

export declare type EmployeeSaleSummary = LazyLoading extends LazyLoadingDisabled ? EagerEmployeeSaleSummary : LazyEmployeeSaleSummary

export declare const EmployeeSaleSummary: (new (init: ModelInit<EmployeeSaleSummary>) => EmployeeSaleSummary)

type EagerDatePartSaleSummary = {
  readonly datePart: string;
  readonly orders: number;
  readonly amount: number;
}

type LazyDatePartSaleSummary = {
  readonly datePart: string;
  readonly orders: number;
  readonly amount: number;
}

export declare type DatePartSaleSummary = LazyLoading extends LazyLoadingDisabled ? EagerDatePartSaleSummary : LazyDatePartSaleSummary

export declare const DatePartSaleSummary: (new (init: ModelInit<DatePartSaleSummary>) => DatePartSaleSummary)

type EagerSalesSummary = {
  readonly products?: (ProductSaleSummary | null)[] | null;
  readonly employees?: (EmployeeSaleSummary | null)[] | null;
  readonly dates?: (DatePartSaleSummary | null)[] | null;
  readonly totalAmount: number;
  readonly totalOrders: number;
}

type LazySalesSummary = {
  readonly products?: (ProductSaleSummary | null)[] | null;
  readonly employees?: (EmployeeSaleSummary | null)[] | null;
  readonly dates?: (DatePartSaleSummary | null)[] | null;
  readonly totalAmount: number;
  readonly totalOrders: number;
}

export declare type SalesSummary = LazyLoading extends LazyLoadingDisabled ? EagerSalesSummary : LazySalesSummary

export declare const SalesSummary: (new (init: ModelInit<SalesSummary>) => SalesSummary)

type EagerInventoryProductFinalizeResult = {
  readonly productId: string;
  readonly finalQuantity: number;
  readonly appliedDelta: number;
}

type LazyInventoryProductFinalizeResult = {
  readonly productId: string;
  readonly finalQuantity: number;
  readonly appliedDelta: number;
}

export declare type InventoryProductFinalizeResult = LazyLoading extends LazyLoadingDisabled ? EagerInventoryProductFinalizeResult : LazyInventoryProductFinalizeResult

export declare const InventoryProductFinalizeResult: (new (init: ModelInit<InventoryProductFinalizeResult>) => InventoryProductFinalizeResult)

type EagerInventoryFinalizeResult = {
  readonly sourceId: string;
  readonly sourceType: string;
  readonly status: InventoryApplyState | keyof typeof InventoryApplyState;
  readonly appliedAt?: string | null;
  readonly error?: string | null;
  readonly affectedProducts: InventoryProductFinalizeResult[];
}

type LazyInventoryFinalizeResult = {
  readonly sourceId: string;
  readonly sourceType: string;
  readonly status: InventoryApplyState | keyof typeof InventoryApplyState;
  readonly appliedAt?: string | null;
  readonly error?: string | null;
  readonly affectedProducts: InventoryProductFinalizeResult[];
}

export declare type InventoryFinalizeResult = LazyLoading extends LazyLoadingDisabled ? EagerInventoryFinalizeResult : LazyInventoryFinalizeResult

export declare const InventoryFinalizeResult: (new (init: ModelInit<InventoryFinalizeResult>) => InventoryFinalizeResult)

type TenantMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type TenantUserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type StoreMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type BrandMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type CategoryMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type CustomerMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EmployeeMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type OrderMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type OrderRefundMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type OrderRefundLineMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type OrderDiscountDefinitionSnapshotMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ProductMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UnitOfMeasureMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type InventoryChangesMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type InventoryCountMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type InventoryCountLineMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type InventoryReceiveMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type InventoryReceiveLineMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type PrinterMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type StationMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type GlobalSettingsMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type DiscountDefinitionMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type DiscountReasonCodeMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EmployeeDiscountPolicyMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type DiscountPresetMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type DiscountApplicationMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ApprovalEventMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type DiscountReconciliationExceptionMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EagerTenant = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly ownerUserId: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyTenant = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly ownerUserId: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Tenant = LazyLoading extends LazyLoadingDisabled ? EagerTenant : LazyTenant

export declare const Tenant: (new (init: ModelInit<Tenant, TenantMetaData>) => Tenant) & {
  copyOf(source: Tenant, mutator: (draft: MutableModel<Tenant, TenantMetaData>) => MutableModel<Tenant, TenantMetaData> | void): Tenant;
}

type EagerTenantUser = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly role: TenantUserRole | keyof typeof TenantUserRole;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyTenantUser = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly role: TenantUserRole | keyof typeof TenantUserRole;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type TenantUser = LazyLoading extends LazyLoadingDisabled ? EagerTenantUser : LazyTenantUser

export declare const TenantUser: (new (init: ModelInit<TenantUser, TenantUserMetaData>) => TenantUser) & {
  copyOf(source: TenantUser, mutator: (draft: MutableModel<TenantUser, TenantUserMetaData>) => MutableModel<TenantUser, TenantUserMetaData> | void): TenantUser;
}

type EagerStore = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly address: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly country: string;
  readonly phone: string;
  readonly fax?: string | null;
  readonly email: string;
  readonly disclaimer?: string | null;
  readonly timezone: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyStore = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly address: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly country: string;
  readonly phone: string;
  readonly fax?: string | null;
  readonly email: string;
  readonly disclaimer?: string | null;
  readonly timezone: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Store = LazyLoading extends LazyLoadingDisabled ? EagerStore : LazyStore

export declare const Store: (new (init: ModelInit<Store, StoreMetaData>) => Store) & {
  copyOf(source: Store, mutator: (draft: MutableModel<Store, StoreMetaData>) => MutableModel<Store, StoreMetaData> | void): Store;
}

type EagerBrand = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyBrand = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Brand = LazyLoading extends LazyLoadingDisabled ? EagerBrand : LazyBrand

export declare const Brand: (new (init: ModelInit<Brand, BrandMetaData>) => Brand) & {
  copyOf(source: Brand, mutator: (draft: MutableModel<Brand, BrandMetaData>) => MutableModel<Brand, BrandMetaData> | void): Brand;
}

type EagerCategory = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly color?: string | null;
  readonly picture?: string | null;
  readonly discountable: boolean;
  readonly discountPolicyMode: CategoryDiscountPolicyMode | keyof typeof CategoryDiscountPolicyMode;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCategory = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly color?: string | null;
  readonly picture?: string | null;
  readonly discountable: boolean;
  readonly discountPolicyMode: CategoryDiscountPolicyMode | keyof typeof CategoryDiscountPolicyMode;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Category = LazyLoading extends LazyLoadingDisabled ? EagerCategory : LazyCategory

export declare const Category: (new (init: ModelInit<Category, CategoryMetaData>) => Category) & {
  copyOf(source: Category, mutator: (draft: MutableModel<Category, CategoryMetaData>) => MutableModel<Category, CategoryMetaData> | void): Category;
}

type EagerCustomer = {
  readonly id: string;
  readonly tenantId: string;
  readonly firstName: string;
  readonly lastName?: string | null;
  readonly middleName?: string | null;
  readonly dob?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCustomer = {
  readonly id: string;
  readonly tenantId: string;
  readonly firstName: string;
  readonly lastName?: string | null;
  readonly middleName?: string | null;
  readonly dob?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Customer = LazyLoading extends LazyLoadingDisabled ? EagerCustomer : LazyCustomer

export declare const Customer: (new (init: ModelInit<Customer, CustomerMetaData>) => Customer) & {
  copyOf(source: Customer, mutator: (draft: MutableModel<Customer, CustomerMetaData>) => MutableModel<Customer, CustomerMetaData> | void): Customer;
}

type EagerEmployee = {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly firstName: string;
  readonly lastName?: string | null;
  readonly middleName?: string | null;
  readonly dob?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly pin: string;
  readonly roles: (string | null)[];
  readonly active: boolean;
  readonly discountPolicyId?: string | null;
  readonly policyProfileKey?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyEmployee = {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly firstName: string;
  readonly lastName?: string | null;
  readonly middleName?: string | null;
  readonly dob?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly pin: string;
  readonly roles: (string | null)[];
  readonly active: boolean;
  readonly discountPolicyId?: string | null;
  readonly policyProfileKey?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Employee = LazyLoading extends LazyLoadingDisabled ? EagerEmployee : LazyEmployee

export declare const Employee: (new (init: ModelInit<Employee, EmployeeMetaData>) => Employee) & {
  copyOf(source: Employee, mutator: (draft: MutableModel<Employee, EmployeeMetaData>) => MutableModel<Employee, EmployeeMetaData> | void): Employee;
}

type EagerOrder = {
  readonly id: string;
  readonly tenantId: string;
  readonly orderNo: string;
  readonly orderDate: string;
  readonly baseSubtotal?: number | null;
  readonly subtotal: number;
  readonly lineDiscountTotal?: number | null;
  readonly orderDiscountTotal?: number | null;
  readonly discountTotal?: number | null;
  readonly savingsTotal?: number | null;
  readonly tax: number;
  readonly total: number;
  readonly currentSubtotal?: number | null;
  readonly currentDiscountTotal?: number | null;
  readonly currentTax?: number | null;
  readonly currentTotal?: number | null;
  readonly promoCodes?: (string | null)[] | null;
  readonly pricingVersion?: string | null;
  readonly pricingSnapshotHash?: string | null;
  readonly pricingSource?: PricingSource | keyof typeof PricingSource | null;
  readonly reconciliationStatus?: ReconciliationStatus | keyof typeof ReconciliationStatus | null;
  readonly appliedDiscountSummary?: AppliedDiscountSummarySnapshot | null;
  readonly status: OrderStatus | keyof typeof OrderStatus;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly lines: (OrderLine | null)[];
  readonly paymentInfo?: PaymentInfo | null;
  readonly refundInfo?: RefundInfo | null;
  readonly createdBy?: ByEmployee | null;
  readonly updatedBy?: ByEmployee | null;
  readonly inventoryApplyState?: InventoryApplyState | keyof typeof InventoryApplyState | null;
  readonly inventoryAppliedAt?: string | null;
  readonly inventoryApplyOperationId?: string | null;
  readonly inventoryApplyError?: string | null;
  readonly Customer?: Customer | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly orderCustomerId?: string | null;
}

type LazyOrder = {
  readonly id: string;
  readonly tenantId: string;
  readonly orderNo: string;
  readonly orderDate: string;
  readonly baseSubtotal?: number | null;
  readonly subtotal: number;
  readonly lineDiscountTotal?: number | null;
  readonly orderDiscountTotal?: number | null;
  readonly discountTotal?: number | null;
  readonly savingsTotal?: number | null;
  readonly tax: number;
  readonly total: number;
  readonly currentSubtotal?: number | null;
  readonly currentDiscountTotal?: number | null;
  readonly currentTax?: number | null;
  readonly currentTotal?: number | null;
  readonly promoCodes?: (string | null)[] | null;
  readonly pricingVersion?: string | null;
  readonly pricingSnapshotHash?: string | null;
  readonly pricingSource?: PricingSource | keyof typeof PricingSource | null;
  readonly reconciliationStatus?: ReconciliationStatus | keyof typeof ReconciliationStatus | null;
  readonly appliedDiscountSummary?: AppliedDiscountSummarySnapshot | null;
  readonly status: OrderStatus | keyof typeof OrderStatus;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly lines: (OrderLine | null)[];
  readonly paymentInfo?: PaymentInfo | null;
  readonly refundInfo?: RefundInfo | null;
  readonly createdBy?: ByEmployee | null;
  readonly updatedBy?: ByEmployee | null;
  readonly inventoryApplyState?: InventoryApplyState | keyof typeof InventoryApplyState | null;
  readonly inventoryAppliedAt?: string | null;
  readonly inventoryApplyOperationId?: string | null;
  readonly inventoryApplyError?: string | null;
  readonly Customer: AsyncItem<Customer | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly orderCustomerId?: string | null;
}

export declare type Order = LazyLoading extends LazyLoadingDisabled ? EagerOrder : LazyOrder

export declare const Order: (new (init: ModelInit<Order, OrderMetaData>) => Order) & {
  copyOf(source: Order, mutator: (draft: MutableModel<Order, OrderMetaData>) => MutableModel<Order, OrderMetaData> | void): Order;
}

type EagerOrderRefund = {
  readonly id: string;
  readonly tenantId: string;
  readonly orderId: string;
  readonly orderNo: string;
  readonly refundDate: string;
  readonly refundType: RefundType | keyof typeof RefundType;
  readonly status: OrderRefundStatus | keyof typeof OrderRefundStatus;
  readonly refundAmount: number;
  readonly refundReason?: string | null;
  readonly refundPayments?: Payment[] | null;
  readonly createdByEmployeeId: string;
  readonly createdByEmployeeName: string;
  readonly inventoryApplyState?: InventoryApplyState | keyof typeof InventoryApplyState | null;
  readonly inventoryAppliedAt?: string | null;
  readonly inventoryApplyOperationId?: string | null;
  readonly inventoryApplyError?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyOrderRefund = {
  readonly id: string;
  readonly tenantId: string;
  readonly orderId: string;
  readonly orderNo: string;
  readonly refundDate: string;
  readonly refundType: RefundType | keyof typeof RefundType;
  readonly status: OrderRefundStatus | keyof typeof OrderRefundStatus;
  readonly refundAmount: number;
  readonly refundReason?: string | null;
  readonly refundPayments?: Payment[] | null;
  readonly createdByEmployeeId: string;
  readonly createdByEmployeeName: string;
  readonly inventoryApplyState?: InventoryApplyState | keyof typeof InventoryApplyState | null;
  readonly inventoryAppliedAt?: string | null;
  readonly inventoryApplyOperationId?: string | null;
  readonly inventoryApplyError?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type OrderRefund = LazyLoading extends LazyLoadingDisabled ? EagerOrderRefund : LazyOrderRefund

export declare const OrderRefund: (new (init: ModelInit<OrderRefund, OrderRefundMetaData>) => OrderRefund) & {
  copyOf(source: OrderRefund, mutator: (draft: MutableModel<OrderRefund, OrderRefundMetaData>) => MutableModel<OrderRefund, OrderRefundMetaData> | void): OrderRefund;
}

type EagerOrderRefundLine = {
  readonly id: string;
  readonly tenantId: string;
  readonly refundId: string;
  readonly orderId: string;
  readonly refundDate: string;
  readonly orderLineIdentifier: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly categoryId?: string | null;
  readonly quantityRefunded: number;
  readonly unitRefundAmount: number;
  readonly lineRefundAmount: number;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyOrderRefundLine = {
  readonly id: string;
  readonly tenantId: string;
  readonly refundId: string;
  readonly orderId: string;
  readonly refundDate: string;
  readonly orderLineIdentifier: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly categoryId?: string | null;
  readonly quantityRefunded: number;
  readonly unitRefundAmount: number;
  readonly lineRefundAmount: number;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type OrderRefundLine = LazyLoading extends LazyLoadingDisabled ? EagerOrderRefundLine : LazyOrderRefundLine

export declare const OrderRefundLine: (new (init: ModelInit<OrderRefundLine, OrderRefundLineMetaData>) => OrderRefundLine) & {
  copyOf(source: OrderRefundLine, mutator: (draft: MutableModel<OrderRefundLine, OrderRefundLineMetaData>) => MutableModel<OrderRefundLine, OrderRefundLineMetaData> | void): OrderRefundLine;
}

type EagerOrderDiscountDefinitionSnapshot = {
  readonly id: string;
  readonly tenantId: string;
  readonly orderId: string;
  readonly discountDefinitionId: string;
  readonly name: string;
  readonly code?: string | null;
  readonly description?: string | null;
  readonly status: DiscountDefinitionStatus | keyof typeof DiscountDefinitionStatus;
  readonly type: DiscountDefinitionType | keyof typeof DiscountDefinitionType;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly value: number;
  readonly priority?: number | null;
  readonly stackMode: DiscountStackMode | keyof typeof DiscountStackMode;
  readonly approvalRequired?: boolean | null;
  readonly reasonRequired?: boolean | null;
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly daysOfWeek?: (string | null)[] | null;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
  readonly minSubtotal?: number | null;
  readonly minQuantity?: number | null;
  readonly usageLimitTotal?: number | null;
  readonly usageCountTotal?: number | null;
  readonly applicableProductIds?: (string | null)[] | null;
  readonly applicableCategoryIds?: (string | null)[] | null;
  readonly excludedProductIds?: (string | null)[] | null;
  readonly excludedCategoryIds?: (string | null)[] | null;
  readonly excludeAlreadyDiscountedItems?: boolean | null;
  readonly appliesToAllProducts?: boolean | null;
  readonly stationIds?: (string | null)[] | null;
  readonly active?: boolean | null;
  readonly pricingGeneratedAt?: string | null;
  readonly pricingTimezone?: string | null;
  readonly pricingStoreId?: string | null;
  readonly pricingStationId?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyOrderDiscountDefinitionSnapshot = {
  readonly id: string;
  readonly tenantId: string;
  readonly orderId: string;
  readonly discountDefinitionId: string;
  readonly name: string;
  readonly code?: string | null;
  readonly description?: string | null;
  readonly status: DiscountDefinitionStatus | keyof typeof DiscountDefinitionStatus;
  readonly type: DiscountDefinitionType | keyof typeof DiscountDefinitionType;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly value: number;
  readonly priority?: number | null;
  readonly stackMode: DiscountStackMode | keyof typeof DiscountStackMode;
  readonly approvalRequired?: boolean | null;
  readonly reasonRequired?: boolean | null;
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly daysOfWeek?: (string | null)[] | null;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
  readonly minSubtotal?: number | null;
  readonly minQuantity?: number | null;
  readonly usageLimitTotal?: number | null;
  readonly usageCountTotal?: number | null;
  readonly applicableProductIds?: (string | null)[] | null;
  readonly applicableCategoryIds?: (string | null)[] | null;
  readonly excludedProductIds?: (string | null)[] | null;
  readonly excludedCategoryIds?: (string | null)[] | null;
  readonly excludeAlreadyDiscountedItems?: boolean | null;
  readonly appliesToAllProducts?: boolean | null;
  readonly stationIds?: (string | null)[] | null;
  readonly active?: boolean | null;
  readonly pricingGeneratedAt?: string | null;
  readonly pricingTimezone?: string | null;
  readonly pricingStoreId?: string | null;
  readonly pricingStationId?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type OrderDiscountDefinitionSnapshot = LazyLoading extends LazyLoadingDisabled ? EagerOrderDiscountDefinitionSnapshot : LazyOrderDiscountDefinitionSnapshot

export declare const OrderDiscountDefinitionSnapshot: (new (init: ModelInit<OrderDiscountDefinitionSnapshot, OrderDiscountDefinitionSnapshotMetaData>) => OrderDiscountDefinitionSnapshot) & {
  copyOf(source: OrderDiscountDefinitionSnapshot, mutator: (draft: MutableModel<OrderDiscountDefinitionSnapshot, OrderDiscountDefinitionSnapshotMetaData>) => MutableModel<OrderDiscountDefinitionSnapshot, OrderDiscountDefinitionSnapshotMetaData> | void): OrderDiscountDefinitionSnapshot;
}

type EagerProduct = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly price: number;
  readonly tags?: string | null;
  readonly cost?: number | null;
  readonly barcode?: string | null;
  readonly sku?: string | null;
  readonly plu?: string | null;
  readonly quantity: number;
  readonly unitOfMeasure: string;
  readonly trackStock: boolean;
  readonly reorderPoint?: number | null;
  readonly reorderQuantity?: number | null;
  readonly picture?: string | null;
  readonly Category?: Category | null;
  readonly Brand?: Brand | null;
  readonly isActive: boolean;
  readonly isEBTEligible?: boolean | null;
  readonly discountable: boolean;
  readonly taxable?: boolean | null;
  readonly minAllowedPrice?: number | null;
  readonly maxManualDiscountPercent?: number | null;
  readonly maxManualDiscountAmount?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly productCategoryId?: string | null;
  readonly productBrandId?: string | null;
}

type LazyProduct = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly price: number;
  readonly tags?: string | null;
  readonly cost?: number | null;
  readonly barcode?: string | null;
  readonly sku?: string | null;
  readonly plu?: string | null;
  readonly quantity: number;
  readonly unitOfMeasure: string;
  readonly trackStock: boolean;
  readonly reorderPoint?: number | null;
  readonly reorderQuantity?: number | null;
  readonly picture?: string | null;
  readonly Category: AsyncItem<Category | undefined>;
  readonly Brand: AsyncItem<Brand | undefined>;
  readonly isActive: boolean;
  readonly isEBTEligible?: boolean | null;
  readonly discountable: boolean;
  readonly taxable?: boolean | null;
  readonly minAllowedPrice?: number | null;
  readonly maxManualDiscountPercent?: number | null;
  readonly maxManualDiscountAmount?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly productCategoryId?: string | null;
  readonly productBrandId?: string | null;
}

export declare type Product = LazyLoading extends LazyLoadingDisabled ? EagerProduct : LazyProduct

export declare const Product: (new (init: ModelInit<Product, ProductMetaData>) => Product) & {
  copyOf(source: Product, mutator: (draft: MutableModel<Product, ProductMetaData>) => MutableModel<Product, ProductMetaData> | void): Product;
}

type EagerUnitOfMeasure = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUnitOfMeasure = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UnitOfMeasure = LazyLoading extends LazyLoadingDisabled ? EagerUnitOfMeasure : LazyUnitOfMeasure

export declare const UnitOfMeasure: (new (init: ModelInit<UnitOfMeasure, UnitOfMeasureMetaData>) => UnitOfMeasure) & {
  copyOf(source: UnitOfMeasure, mutator: (draft: MutableModel<UnitOfMeasure, UnitOfMeasureMetaData>) => MutableModel<UnitOfMeasure, UnitOfMeasureMetaData> | void): UnitOfMeasure;
}

type EagerInventoryChanges = {
  readonly id: string;
  readonly tenantId: string;
  readonly timestamp: string;
  readonly type: string;
  readonly typeId?: string | null;
  readonly quantityIn: number;
  readonly quantityOut: number;
  readonly Product?: Product | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryChangesProductId?: string | null;
}

type LazyInventoryChanges = {
  readonly id: string;
  readonly tenantId: string;
  readonly timestamp: string;
  readonly type: string;
  readonly typeId?: string | null;
  readonly quantityIn: number;
  readonly quantityOut: number;
  readonly Product: AsyncItem<Product | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryChangesProductId?: string | null;
}

export declare type InventoryChanges = LazyLoading extends LazyLoadingDisabled ? EagerInventoryChanges : LazyInventoryChanges

export declare const InventoryChanges: (new (init: ModelInit<InventoryChanges, InventoryChangesMetaData>) => InventoryChanges) & {
  copyOf(source: InventoryChanges, mutator: (draft: MutableModel<InventoryChanges, InventoryChangesMetaData>) => MutableModel<InventoryChanges, InventoryChangesMetaData> | void): InventoryChanges;
}

type EagerInventoryCount = {
  readonly id: string;
  readonly tenantId: string;
  readonly comments?: string | null;
  readonly status: InventoryCountStatus | keyof typeof InventoryCountStatus;
  readonly createdBy: ByEmployee;
  readonly inventoryApplyState?: InventoryApplyState | keyof typeof InventoryApplyState | null;
  readonly inventoryAppliedAt?: string | null;
  readonly inventoryApplyOperationId?: string | null;
  readonly inventoryApplyError?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyInventoryCount = {
  readonly id: string;
  readonly tenantId: string;
  readonly comments?: string | null;
  readonly status: InventoryCountStatus | keyof typeof InventoryCountStatus;
  readonly createdBy: ByEmployee;
  readonly inventoryApplyState?: InventoryApplyState | keyof typeof InventoryApplyState | null;
  readonly inventoryAppliedAt?: string | null;
  readonly inventoryApplyOperationId?: string | null;
  readonly inventoryApplyError?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type InventoryCount = LazyLoading extends LazyLoadingDisabled ? EagerInventoryCount : LazyInventoryCount

export declare const InventoryCount: (new (init: ModelInit<InventoryCount, InventoryCountMetaData>) => InventoryCount) & {
  copyOf(source: InventoryCount, mutator: (draft: MutableModel<InventoryCount, InventoryCountMetaData>) => MutableModel<InventoryCount, InventoryCountMetaData> | void): InventoryCount;
}

type EagerInventoryCountLine = {
  readonly id: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly current?: number | null;
  readonly newCount: number;
  readonly comments?: string | null;
  readonly InventoryCount?: InventoryCount | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryCountLineInventoryCountId?: string | null;
}

type LazyInventoryCountLine = {
  readonly id: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly current?: number | null;
  readonly newCount: number;
  readonly comments?: string | null;
  readonly InventoryCount: AsyncItem<InventoryCount | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryCountLineInventoryCountId?: string | null;
}

export declare type InventoryCountLine = LazyLoading extends LazyLoadingDisabled ? EagerInventoryCountLine : LazyInventoryCountLine

export declare const InventoryCountLine: (new (init: ModelInit<InventoryCountLine, InventoryCountLineMetaData>) => InventoryCountLine) & {
  copyOf(source: InventoryCountLine, mutator: (draft: MutableModel<InventoryCountLine, InventoryCountLineMetaData>) => MutableModel<InventoryCountLine, InventoryCountLineMetaData> | void): InventoryCountLine;
}

type EagerInventoryReceive = {
  readonly id: string;
  readonly tenantId: string;
  readonly comments?: string | null;
  readonly status: InventoryReceiveStatus | keyof typeof InventoryReceiveStatus;
  readonly createdBy: ByEmployee;
  readonly inventoryApplyState?: InventoryApplyState | keyof typeof InventoryApplyState | null;
  readonly inventoryAppliedAt?: string | null;
  readonly inventoryApplyOperationId?: string | null;
  readonly inventoryApplyError?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyInventoryReceive = {
  readonly id: string;
  readonly tenantId: string;
  readonly comments?: string | null;
  readonly status: InventoryReceiveStatus | keyof typeof InventoryReceiveStatus;
  readonly createdBy: ByEmployee;
  readonly inventoryApplyState?: InventoryApplyState | keyof typeof InventoryApplyState | null;
  readonly inventoryAppliedAt?: string | null;
  readonly inventoryApplyOperationId?: string | null;
  readonly inventoryApplyError?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type InventoryReceive = LazyLoading extends LazyLoadingDisabled ? EagerInventoryReceive : LazyInventoryReceive

export declare const InventoryReceive: (new (init: ModelInit<InventoryReceive, InventoryReceiveMetaData>) => InventoryReceive) & {
  copyOf(source: InventoryReceive, mutator: (draft: MutableModel<InventoryReceive, InventoryReceiveMetaData>) => MutableModel<InventoryReceive, InventoryReceiveMetaData> | void): InventoryReceive;
}

type EagerInventoryReceiveLine = {
  readonly id: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly current?: number | null;
  readonly received: number;
  readonly comments?: string | null;
  readonly InventoryReceive?: InventoryReceive | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryReceiveLineInventoryReceiveId?: string | null;
}

type LazyInventoryReceiveLine = {
  readonly id: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly current?: number | null;
  readonly received: number;
  readonly comments?: string | null;
  readonly InventoryReceive: AsyncItem<InventoryReceive | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryReceiveLineInventoryReceiveId?: string | null;
}

export declare type InventoryReceiveLine = LazyLoading extends LazyLoadingDisabled ? EagerInventoryReceiveLine : LazyInventoryReceiveLine

export declare const InventoryReceiveLine: (new (init: ModelInit<InventoryReceiveLine, InventoryReceiveLineMetaData>) => InventoryReceiveLine) & {
  copyOf(source: InventoryReceiveLine, mutator: (draft: MutableModel<InventoryReceiveLine, InventoryReceiveLineMetaData>) => MutableModel<InventoryReceiveLine, InventoryReceiveLineMetaData> | void): InventoryReceiveLine;
}

type EagerPrinter = {
  readonly id: string;
  readonly tenantId: string;
  readonly deviceId: string;
  readonly identifier: string;
  readonly interfaceType: string;
  readonly ip: string;
  readonly model?: string | null;
  readonly alias?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPrinter = {
  readonly id: string;
  readonly tenantId: string;
  readonly deviceId: string;
  readonly identifier: string;
  readonly interfaceType: string;
  readonly ip: string;
  readonly model?: string | null;
  readonly alias?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Printer = LazyLoading extends LazyLoadingDisabled ? EagerPrinter : LazyPrinter

export declare const Printer: (new (init: ModelInit<Printer, PrinterMetaData>) => Printer) & {
  copyOf(source: Printer, mutator: (draft: MutableModel<Printer, PrinterMetaData>) => MutableModel<Printer, PrinterMetaData> | void): Printer;
}

type EagerStation = {
  readonly id: string;
  readonly tenantId: string;
  readonly deviceId: string;
  readonly alias: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyStation = {
  readonly id: string;
  readonly tenantId: string;
  readonly deviceId: string;
  readonly alias: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Station = LazyLoading extends LazyLoadingDisabled ? EagerStation : LazyStation

export declare const Station: (new (init: ModelInit<Station, StationMetaData>) => Station) & {
  copyOf(source: Station, mutator: (draft: MutableModel<Station, StationMetaData>) => MutableModel<Station, StationMetaData> | void): Station;
}

type EagerGlobalSettings = {
  readonly id: string;
  readonly tenantId: string;
  readonly enforceSalesBasedOnInventory: boolean;
  readonly timezone: string;
  readonly scaleBarcodePriceFormat?: string | null;
  readonly taxValue?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyGlobalSettings = {
  readonly id: string;
  readonly tenantId: string;
  readonly enforceSalesBasedOnInventory: boolean;
  readonly timezone: string;
  readonly scaleBarcodePriceFormat?: string | null;
  readonly taxValue?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type GlobalSettings = LazyLoading extends LazyLoadingDisabled ? EagerGlobalSettings : LazyGlobalSettings

export declare const GlobalSettings: (new (init: ModelInit<GlobalSettings, GlobalSettingsMetaData>) => GlobalSettings) & {
  copyOf(source: GlobalSettings, mutator: (draft: MutableModel<GlobalSettings, GlobalSettingsMetaData>) => MutableModel<GlobalSettings, GlobalSettingsMetaData> | void): GlobalSettings;
}

type EagerDiscountDefinition = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly code?: string | null;
  readonly description?: string | null;
  readonly status: DiscountDefinitionStatus | keyof typeof DiscountDefinitionStatus;
  readonly type: DiscountDefinitionType | keyof typeof DiscountDefinitionType;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly value: number;
  readonly priority?: number | null;
  readonly stackMode: DiscountStackMode | keyof typeof DiscountStackMode;
  readonly approvalRequired?: boolean | null;
  readonly reasonRequired?: boolean | null;
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly daysOfWeek?: (string | null)[] | null;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
  readonly minSubtotal?: number | null;
  readonly minQuantity?: number | null;
  readonly usageLimitTotal?: number | null;
  readonly usageCountTotal?: number | null;
  readonly applicableProductIds?: (string | null)[] | null;
  readonly applicableCategoryIds?: (string | null)[] | null;
  readonly excludedProductIds?: (string | null)[] | null;
  readonly excludedCategoryIds?: (string | null)[] | null;
  readonly excludeAlreadyDiscountedItems?: boolean | null;
  readonly appliesToAllProducts?: boolean | null;
  readonly storeIds?: (string | null)[] | null;
  readonly stationIds?: (string | null)[] | null;
  readonly active: boolean;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDiscountDefinition = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly code?: string | null;
  readonly description?: string | null;
  readonly status: DiscountDefinitionStatus | keyof typeof DiscountDefinitionStatus;
  readonly type: DiscountDefinitionType | keyof typeof DiscountDefinitionType;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly value: number;
  readonly priority?: number | null;
  readonly stackMode: DiscountStackMode | keyof typeof DiscountStackMode;
  readonly approvalRequired?: boolean | null;
  readonly reasonRequired?: boolean | null;
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly daysOfWeek?: (string | null)[] | null;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
  readonly minSubtotal?: number | null;
  readonly minQuantity?: number | null;
  readonly usageLimitTotal?: number | null;
  readonly usageCountTotal?: number | null;
  readonly applicableProductIds?: (string | null)[] | null;
  readonly applicableCategoryIds?: (string | null)[] | null;
  readonly excludedProductIds?: (string | null)[] | null;
  readonly excludedCategoryIds?: (string | null)[] | null;
  readonly excludeAlreadyDiscountedItems?: boolean | null;
  readonly appliesToAllProducts?: boolean | null;
  readonly storeIds?: (string | null)[] | null;
  readonly stationIds?: (string | null)[] | null;
  readonly active: boolean;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DiscountDefinition = LazyLoading extends LazyLoadingDisabled ? EagerDiscountDefinition : LazyDiscountDefinition

export declare const DiscountDefinition: (new (init: ModelInit<DiscountDefinition, DiscountDefinitionMetaData>) => DiscountDefinition) & {
  copyOf(source: DiscountDefinition, mutator: (draft: MutableModel<DiscountDefinition, DiscountDefinitionMetaData>) => MutableModel<DiscountDefinition, DiscountDefinitionMetaData> | void): DiscountDefinition;
}

type EagerDiscountReasonCode = {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly label: string;
  readonly description?: string | null;
  readonly active: boolean;
  readonly requiresNote?: boolean | null;
  readonly appliesTo?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDiscountReasonCode = {
  readonly id: string;
  readonly tenantId: string;
  readonly code: string;
  readonly label: string;
  readonly description?: string | null;
  readonly active: boolean;
  readonly requiresNote?: boolean | null;
  readonly appliesTo?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DiscountReasonCode = LazyLoading extends LazyLoadingDisabled ? EagerDiscountReasonCode : LazyDiscountReasonCode

export declare const DiscountReasonCode: (new (init: ModelInit<DiscountReasonCode, DiscountReasonCodeMetaData>) => DiscountReasonCode) & {
  copyOf(source: DiscountReasonCode, mutator: (draft: MutableModel<DiscountReasonCode, DiscountReasonCodeMetaData>) => MutableModel<DiscountReasonCode, DiscountReasonCodeMetaData> | void): DiscountReasonCode;
}

type EagerEmployeeDiscountPolicy = {
  readonly id: string;
  readonly tenantId: string;
  readonly employeeId?: string | null;
  readonly roleKey?: string | null;
  readonly maxManualPercentDiscount?: number | null;
  readonly maxManualAmountDiscount?: number | null;
  readonly maxPriceOverrideAmount?: number | null;
  readonly maxPriceOverridePercentBelowBase?: number | null;
  readonly canApplyOrderDiscount?: boolean | null;
  readonly canOverridePrice?: boolean | null;
  readonly canApproveDiscounts?: boolean | null;
  readonly canApprovePriceOverrides?: boolean | null;
  readonly canUsePromoCodes?: boolean | null;
  readonly requireReasonForManualDiscounts?: boolean | null;
  readonly requireReasonForOverrides?: boolean | null;
  readonly requireApprovalForOrderDiscount?: boolean | null;
  readonly requireApprovalForAnyPriceOverride?: boolean | null;
  readonly allowExclusiveDiscountOverride?: boolean | null;
  readonly active: boolean;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyEmployeeDiscountPolicy = {
  readonly id: string;
  readonly tenantId: string;
  readonly employeeId?: string | null;
  readonly roleKey?: string | null;
  readonly maxManualPercentDiscount?: number | null;
  readonly maxManualAmountDiscount?: number | null;
  readonly maxPriceOverrideAmount?: number | null;
  readonly maxPriceOverridePercentBelowBase?: number | null;
  readonly canApplyOrderDiscount?: boolean | null;
  readonly canOverridePrice?: boolean | null;
  readonly canApproveDiscounts?: boolean | null;
  readonly canApprovePriceOverrides?: boolean | null;
  readonly canUsePromoCodes?: boolean | null;
  readonly requireReasonForManualDiscounts?: boolean | null;
  readonly requireReasonForOverrides?: boolean | null;
  readonly requireApprovalForOrderDiscount?: boolean | null;
  readonly requireApprovalForAnyPriceOverride?: boolean | null;
  readonly allowExclusiveDiscountOverride?: boolean | null;
  readonly active: boolean;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type EmployeeDiscountPolicy = LazyLoading extends LazyLoadingDisabled ? EagerEmployeeDiscountPolicy : LazyEmployeeDiscountPolicy

export declare const EmployeeDiscountPolicy: (new (init: ModelInit<EmployeeDiscountPolicy, EmployeeDiscountPolicyMetaData>) => EmployeeDiscountPolicy) & {
  copyOf(source: EmployeeDiscountPolicy, mutator: (draft: MutableModel<EmployeeDiscountPolicy, EmployeeDiscountPolicyMetaData>) => MutableModel<EmployeeDiscountPolicy, EmployeeDiscountPolicyMetaData> | void): EmployeeDiscountPolicy;
}

type EagerDiscountPreset = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly value?: number | null;
  readonly promptForCustomValue?: boolean | null;
  readonly active: boolean;
  readonly sortOrder?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDiscountPreset = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly value?: number | null;
  readonly promptForCustomValue?: boolean | null;
  readonly active: boolean;
  readonly sortOrder?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DiscountPreset = LazyLoading extends LazyLoadingDisabled ? EagerDiscountPreset : LazyDiscountPreset

export declare const DiscountPreset: (new (init: ModelInit<DiscountPreset, DiscountPresetMetaData>) => DiscountPreset) & {
  copyOf(source: DiscountPreset, mutator: (draft: MutableModel<DiscountPreset, DiscountPresetMetaData>) => MutableModel<DiscountPreset, DiscountPresetMetaData> | void): DiscountPreset;
}

type EagerDiscountApplication = {
  readonly id: string;
  readonly tenantId: string;
  readonly transactionId: string;
  readonly lineId?: string | null;
  readonly discountDefinitionId?: string | null;
  readonly applicationType: DiscountApplicationType | keyof typeof DiscountApplicationType;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly name: string;
  readonly code?: string | null;
  readonly stackMode: DiscountStackMode | keyof typeof DiscountStackMode;
  readonly originalAmount: number;
  readonly discountAmount: number;
  readonly finalAmount: number;
  readonly quantityBasis?: number | null;
  readonly reasonCode?: string | null;
  readonly reasonNote?: string | null;
  readonly appliedByEmployeeId?: string | null;
  readonly appliedByEmployeeName?: string | null;
  readonly approvedByEmployeeId?: string | null;
  readonly approvedByEmployeeName?: string | null;
  readonly approvalRequired?: boolean | null;
  readonly approvalStatus?: DiscountApprovalStatus | keyof typeof DiscountApprovalStatus | null;
  readonly approvalReference?: string | null;
  readonly sourceSnapshot?: string | null;
  readonly appliedAt: string;
  readonly syncStatus?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDiscountApplication = {
  readonly id: string;
  readonly tenantId: string;
  readonly transactionId: string;
  readonly lineId?: string | null;
  readonly discountDefinitionId?: string | null;
  readonly applicationType: DiscountApplicationType | keyof typeof DiscountApplicationType;
  readonly scope: DiscountScope | keyof typeof DiscountScope;
  readonly method: DiscountMethod | keyof typeof DiscountMethod;
  readonly name: string;
  readonly code?: string | null;
  readonly stackMode: DiscountStackMode | keyof typeof DiscountStackMode;
  readonly originalAmount: number;
  readonly discountAmount: number;
  readonly finalAmount: number;
  readonly quantityBasis?: number | null;
  readonly reasonCode?: string | null;
  readonly reasonNote?: string | null;
  readonly appliedByEmployeeId?: string | null;
  readonly appliedByEmployeeName?: string | null;
  readonly approvedByEmployeeId?: string | null;
  readonly approvedByEmployeeName?: string | null;
  readonly approvalRequired?: boolean | null;
  readonly approvalStatus?: DiscountApprovalStatus | keyof typeof DiscountApprovalStatus | null;
  readonly approvalReference?: string | null;
  readonly sourceSnapshot?: string | null;
  readonly appliedAt: string;
  readonly syncStatus?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DiscountApplication = LazyLoading extends LazyLoadingDisabled ? EagerDiscountApplication : LazyDiscountApplication

export declare const DiscountApplication: (new (init: ModelInit<DiscountApplication, DiscountApplicationMetaData>) => DiscountApplication) & {
  copyOf(source: DiscountApplication, mutator: (draft: MutableModel<DiscountApplication, DiscountApplicationMetaData>) => MutableModel<DiscountApplication, DiscountApplicationMetaData> | void): DiscountApplication;
}

type EagerApprovalEvent = {
  readonly id: string;
  readonly tenantId: string;
  readonly transactionId: string;
  readonly lineId?: string | null;
  readonly approvalType: string;
  readonly requestingEmployeeId: string;
  readonly approvingEmployeeId: string;
  readonly requestedAction: string;
  readonly reasonCode?: string | null;
  readonly reasonNote?: string | null;
  readonly policySnapshot?: string | null;
  readonly status: string;
  readonly syncStatus?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyApprovalEvent = {
  readonly id: string;
  readonly tenantId: string;
  readonly transactionId: string;
  readonly lineId?: string | null;
  readonly approvalType: string;
  readonly requestingEmployeeId: string;
  readonly approvingEmployeeId: string;
  readonly requestedAction: string;
  readonly reasonCode?: string | null;
  readonly reasonNote?: string | null;
  readonly policySnapshot?: string | null;
  readonly status: string;
  readonly syncStatus?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ApprovalEvent = LazyLoading extends LazyLoadingDisabled ? EagerApprovalEvent : LazyApprovalEvent

export declare const ApprovalEvent: (new (init: ModelInit<ApprovalEvent, ApprovalEventMetaData>) => ApprovalEvent) & {
  copyOf(source: ApprovalEvent, mutator: (draft: MutableModel<ApprovalEvent, ApprovalEventMetaData>) => MutableModel<ApprovalEvent, ApprovalEventMetaData> | void): ApprovalEvent;
}

type EagerDiscountReconciliationException = {
  readonly id: string;
  readonly tenantId: string;
  readonly transactionId: string;
  readonly discountApplicationId?: string | null;
  readonly exceptionType: string;
  readonly severity: string;
  readonly message: string;
  readonly backendSnapshot?: string | null;
  readonly resolved: boolean;
  readonly resolvedByEmployeeId?: string | null;
  readonly resolvedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDiscountReconciliationException = {
  readonly id: string;
  readonly tenantId: string;
  readonly transactionId: string;
  readonly discountApplicationId?: string | null;
  readonly exceptionType: string;
  readonly severity: string;
  readonly message: string;
  readonly backendSnapshot?: string | null;
  readonly resolved: boolean;
  readonly resolvedByEmployeeId?: string | null;
  readonly resolvedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DiscountReconciliationException = LazyLoading extends LazyLoadingDisabled ? EagerDiscountReconciliationException : LazyDiscountReconciliationException

export declare const DiscountReconciliationException: (new (init: ModelInit<DiscountReconciliationException, DiscountReconciliationExceptionMetaData>) => DiscountReconciliationException) & {
  copyOf(source: DiscountReconciliationException, mutator: (draft: MutableModel<DiscountReconciliationException, DiscountReconciliationExceptionMetaData>) => MutableModel<DiscountReconciliationException, DiscountReconciliationExceptionMetaData> | void): DiscountReconciliationException;
}