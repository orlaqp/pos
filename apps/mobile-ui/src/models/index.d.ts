import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum OrderStatus {
  OPEN = "OPEN",
  REFUNDED = "REFUNDED",
  PAID = "PAID"
}

export enum PaymentType {
  CASH = "CASH",
  CHECK = "CHECK",
  CC = "CC"
}

export enum InventoryCountStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export enum InventoryReceiveStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export declare class OrderLine {
  readonly identifier: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly barcode?: string | null;
  readonly sku?: string | null;
  readonly quantity: number;
  readonly tax: number;
  readonly price: number;
  constructor(init: ModelInit<OrderLine>);
}

export declare class PaymentInfo {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly payments?: (Payment | null)[] | null;
  constructor(init: ModelInit<PaymentInfo>);
}

export declare class Payment {
  readonly type: PaymentType | keyof typeof PaymentType;
  readonly amount: number;
  constructor(init: ModelInit<Payment>);
}

export declare class RefundInfo {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly comments?: string | null;
  constructor(init: ModelInit<RefundInfo>);
}

export declare class ByEmployee {
  readonly id: string;
  readonly name: string;
  constructor(init: ModelInit<ByEmployee>);
}

export declare class SalesSummary {
  readonly products?: (ProductSaleSummary | null)[] | null;
  readonly employees?: (EmployeeSaleSummary | null)[] | null;
  readonly dates?: (DatePartSaleSummary | null)[] | null;
  readonly totalAmount: number;
  readonly totalOrders: number;
  constructor(init: ModelInit<SalesSummary>);
}

export declare class ProductSaleSummary {
  readonly productId: string;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly quantity: number;
  readonly amount: number;
  constructor(init: ModelInit<ProductSaleSummary>);
}

export declare class EmployeeSaleSummary {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly orders: number;
  readonly amount: number;
  constructor(init: ModelInit<EmployeeSaleSummary>);
}

export declare class DatePartSaleSummary {
  readonly datePart: string;
  readonly orders: number;
  readonly amount: number;
  constructor(init: ModelInit<DatePartSaleSummary>);
}

type OrderMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type CustomerMetaData = {
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

type EmployeeMetaData = {
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

export declare class Order {
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
  constructor(init: ModelInit<Order, OrderMetaData>);
  static copyOf(source: Order, mutator: (draft: MutableModel<Order, OrderMetaData>) => MutableModel<Order, OrderMetaData> | void): Order;
}

export declare class Customer {
  readonly id: string;
  readonly firstName: string;
  readonly lastName?: string | null;
  readonly middleName?: string | null;
  readonly dob?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Customer, CustomerMetaData>);
  static copyOf(source: Customer, mutator: (draft: MutableModel<Customer, CustomerMetaData>) => MutableModel<Customer, CustomerMetaData> | void): Customer;
}

export declare class Store {
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
  constructor(init: ModelInit<Store, StoreMetaData>);
  static copyOf(source: Store, mutator: (draft: MutableModel<Store, StoreMetaData>) => MutableModel<Store, StoreMetaData> | void): Store;
}

export declare class Brand {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Brand, BrandMetaData>);
  static copyOf(source: Brand, mutator: (draft: MutableModel<Brand, BrandMetaData>) => MutableModel<Brand, BrandMetaData> | void): Brand;
}

export declare class Category {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly color?: string | null;
  readonly picture?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Category, CategoryMetaData>);
  static copyOf(source: Category, mutator: (draft: MutableModel<Category, CategoryMetaData>) => MutableModel<Category, CategoryMetaData> | void): Category;
}

export declare class Employee {
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
  constructor(init: ModelInit<Employee, EmployeeMetaData>);
  static copyOf(source: Employee, mutator: (draft: MutableModel<Employee, EmployeeMetaData>) => MutableModel<Employee, EmployeeMetaData> | void): Employee;
}

export declare class Product {
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
  constructor(init: ModelInit<Product, ProductMetaData>);
  static copyOf(source: Product, mutator: (draft: MutableModel<Product, ProductMetaData>) => MutableModel<Product, ProductMetaData> | void): Product;
}

export declare class UnitOfMeasure {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<UnitOfMeasure, UnitOfMeasureMetaData>);
  static copyOf(source: UnitOfMeasure, mutator: (draft: MutableModel<UnitOfMeasure, UnitOfMeasureMetaData>) => MutableModel<UnitOfMeasure, UnitOfMeasureMetaData> | void): UnitOfMeasure;
}

export declare class InventoryChanges {
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
  constructor(init: ModelInit<InventoryChanges, InventoryChangesMetaData>);
  static copyOf(source: InventoryChanges, mutator: (draft: MutableModel<InventoryChanges, InventoryChangesMetaData>) => MutableModel<InventoryChanges, InventoryChangesMetaData> | void): InventoryChanges;
}

export declare class InventoryCount {
  readonly id: string;
  readonly comments?: string | null;
  readonly status: InventoryCountStatus | keyof typeof InventoryCountStatus;
  readonly createdBy: ByEmployee;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<InventoryCount, InventoryCountMetaData>);
  static copyOf(source: InventoryCount, mutator: (draft: MutableModel<InventoryCount, InventoryCountMetaData>) => MutableModel<InventoryCount, InventoryCountMetaData> | void): InventoryCount;
}

export declare class InventoryCountLine {
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
  constructor(init: ModelInit<InventoryCountLine, InventoryCountLineMetaData>);
  static copyOf(source: InventoryCountLine, mutator: (draft: MutableModel<InventoryCountLine, InventoryCountLineMetaData>) => MutableModel<InventoryCountLine, InventoryCountLineMetaData> | void): InventoryCountLine;
}

export declare class InventoryReceive {
  readonly id: string;
  readonly comments?: string | null;
  readonly status: InventoryReceiveStatus | keyof typeof InventoryReceiveStatus;
  readonly createdBy: ByEmployee;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<InventoryReceive, InventoryReceiveMetaData>);
  static copyOf(source: InventoryReceive, mutator: (draft: MutableModel<InventoryReceive, InventoryReceiveMetaData>) => MutableModel<InventoryReceive, InventoryReceiveMetaData> | void): InventoryReceive;
}

export declare class InventoryReceiveLine {
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
  constructor(init: ModelInit<InventoryReceiveLine, InventoryReceiveLineMetaData>);
  static copyOf(source: InventoryReceiveLine, mutator: (draft: MutableModel<InventoryReceiveLine, InventoryReceiveLineMetaData>) => MutableModel<InventoryReceiveLine, InventoryReceiveLineMetaData> | void): InventoryReceiveLine;
}

export declare class Printer {
  readonly id: string;
  readonly deviceId: string;
  readonly identifier: string;
  readonly interfaceType: string;
  readonly ip: string;
  readonly model?: string | null;
  readonly alias?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Printer, PrinterMetaData>);
  static copyOf(source: Printer, mutator: (draft: MutableModel<Printer, PrinterMetaData>) => MutableModel<Printer, PrinterMetaData> | void): Printer;
}

export declare class Station {
  readonly id: string;
  readonly deviceId: string;
  readonly alias: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Station, StationMetaData>);
  static copyOf(source: Station, mutator: (draft: MutableModel<Station, StationMetaData>) => MutableModel<Station, StationMetaData> | void): Station;
}

export declare class GlobalSettings {
  readonly id: string;
  readonly enforceSalesBasedOnInventory: boolean;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<GlobalSettings, GlobalSettingsMetaData>);
  static copyOf(source: GlobalSettings, mutator: (draft: MutableModel<GlobalSettings, GlobalSettingsMetaData>) => MutableModel<GlobalSettings, GlobalSettingsMetaData> | void): GlobalSettings;
}