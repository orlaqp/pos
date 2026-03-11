import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncItem } from "@aws-amplify/datastore";

export enum PaymentType {
  CASH = "CASH",
  CHECK = "CHECK",
  CC = "CC"
}

export enum OrderStatus {
  OPEN = "OPEN",
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

type EagerStore = {
  readonly id: string;
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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyStore = {
  readonly id: string;
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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Store = LazyLoading extends LazyLoadingDisabled ? EagerStore : LazyStore

export declare const Store: (new (init: ModelInit<Store, StoreMetaData>) => Store) & {
  copyOf(source: Store, mutator: (draft: MutableModel<Store, StoreMetaData>) => MutableModel<Store, StoreMetaData> | void): Store;
}

type EagerBrand = {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyBrand = {
  readonly id: string;
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
  readonly name: string;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly color?: string | null;
  readonly picture?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCategory = {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly color?: string | null;
  readonly picture?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Category = LazyLoading extends LazyLoadingDisabled ? EagerCategory : LazyCategory

export declare const Category: (new (init: ModelInit<Category, CategoryMetaData>) => Category) & {
  copyOf(source: Category, mutator: (draft: MutableModel<Category, CategoryMetaData>) => MutableModel<Category, CategoryMetaData> | void): Category;
}

type EagerCustomer = {
  readonly id: string;
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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyEmployee = {
  readonly id: string;
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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Employee = LazyLoading extends LazyLoadingDisabled ? EagerEmployee : LazyEmployee

export declare const Employee: (new (init: ModelInit<Employee, EmployeeMetaData>) => Employee) & {
  copyOf(source: Employee, mutator: (draft: MutableModel<Employee, EmployeeMetaData>) => MutableModel<Employee, EmployeeMetaData> | void): Employee;
}

type EagerOrder = {
  readonly id: string;
  readonly orderNo: string;
  readonly orderDate: string;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly status: OrderStatus | keyof typeof OrderStatus;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly lines: (OrderLine | null)[];
  readonly paymentInfo?: PaymentInfo | null;
  readonly refundInfo?: RefundInfo | null;
  readonly createdBy?: ByEmployee | null;
  readonly updatedBy?: ByEmployee | null;
  readonly Customer?: Customer | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly orderCustomerId?: string | null;
}

type LazyOrder = {
  readonly id: string;
  readonly orderNo: string;
  readonly orderDate: string;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly status: OrderStatus | keyof typeof OrderStatus;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly lines: (OrderLine | null)[];
  readonly paymentInfo?: PaymentInfo | null;
  readonly refundInfo?: RefundInfo | null;
  readonly createdBy?: ByEmployee | null;
  readonly updatedBy?: ByEmployee | null;
  readonly Customer: AsyncItem<Customer | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly orderCustomerId?: string | null;
}

export declare type Order = LazyLoading extends LazyLoadingDisabled ? EagerOrder : LazyOrder

export declare const Order: (new (init: ModelInit<Order, OrderMetaData>) => Order) & {
  copyOf(source: Order, mutator: (draft: MutableModel<Order, OrderMetaData>) => MutableModel<Order, OrderMetaData> | void): Order;
}

type EagerProduct = {
  readonly id: string;
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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly productCategoryId?: string | null;
  readonly productBrandId?: string | null;
}

type LazyProduct = {
  readonly id: string;
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
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUnitOfMeasure = {
  readonly id: string;
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
  readonly comments?: string | null;
  readonly status: InventoryCountStatus | keyof typeof InventoryCountStatus;
  readonly createdBy: ByEmployee;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyInventoryCount = {
  readonly id: string;
  readonly comments?: string | null;
  readonly status: InventoryCountStatus | keyof typeof InventoryCountStatus;
  readonly createdBy: ByEmployee;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type InventoryCount = LazyLoading extends LazyLoadingDisabled ? EagerInventoryCount : LazyInventoryCount

export declare const InventoryCount: (new (init: ModelInit<InventoryCount, InventoryCountMetaData>) => InventoryCount) & {
  copyOf(source: InventoryCount, mutator: (draft: MutableModel<InventoryCount, InventoryCountMetaData>) => MutableModel<InventoryCount, InventoryCountMetaData> | void): InventoryCount;
}

type EagerInventoryCountLine = {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly current: number;
  readonly newCount: number;
  readonly comments?: string | null;
  readonly InventoryCount?: InventoryCount | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryCountLineInventoryCountId?: string | null;
}

type LazyInventoryCountLine = {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly current: number;
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
  readonly comments?: string | null;
  readonly status: InventoryReceiveStatus | keyof typeof InventoryReceiveStatus;
  readonly createdBy: ByEmployee;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyInventoryReceive = {
  readonly id: string;
  readonly comments?: string | null;
  readonly status: InventoryReceiveStatus | keyof typeof InventoryReceiveStatus;
  readonly createdBy: ByEmployee;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type InventoryReceive = LazyLoading extends LazyLoadingDisabled ? EagerInventoryReceive : LazyInventoryReceive

export declare const InventoryReceive: (new (init: ModelInit<InventoryReceive, InventoryReceiveMetaData>) => InventoryReceive) & {
  copyOf(source: InventoryReceive, mutator: (draft: MutableModel<InventoryReceive, InventoryReceiveMetaData>) => MutableModel<InventoryReceive, InventoryReceiveMetaData> | void): InventoryReceive;
}

type EagerInventoryReceiveLine = {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly received: number;
  readonly comments?: string | null;
  readonly InventoryReceive?: InventoryReceive | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryReceiveLineInventoryReceiveId?: string | null;
}

type LazyInventoryReceiveLine = {
  readonly id: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
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
  readonly deviceId: string;
  readonly alias: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyStation = {
  readonly id: string;
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
  readonly enforceSalesBasedOnInventory: boolean;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyGlobalSettings = {
  readonly id: string;
  readonly enforceSalesBasedOnInventory: boolean;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type GlobalSettings = LazyLoading extends LazyLoadingDisabled ? EagerGlobalSettings : LazyGlobalSettings

export declare const GlobalSettings: (new (init: ModelInit<GlobalSettings, GlobalSettingsMetaData>) => GlobalSettings) & {
  copyOf(source: GlobalSettings, mutator: (draft: MutableModel<GlobalSettings, GlobalSettingsMetaData>) => MutableModel<GlobalSettings, GlobalSettingsMetaData> | void): GlobalSettings;
}