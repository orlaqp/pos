import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum OrderStatus {
  OPEN = "OPEN",
  CANCELLED = "CANCELLED",
  PAID = "PAID",
  ONHOLD = "ONHOLD"
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

type OrderMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type OrderLineMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ProductMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type PurchaseOrderMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type SupplierMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type PurchaseOrderLineMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type StoreMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type StockMetaData = {
  readOnlyFields: 'createdAt';
}

type TagMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UnitOfMeasureMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type InventoryMetaData = {
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

type InventoryReceivedMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type InventoryReceivedLineMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type PrinterMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type StationMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
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

export declare class Order {
  readonly id: string;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly status: OrderStatus | keyof typeof OrderStatus;
  readonly employeeId: string;
  readonly employeeName: string;
  readonly OrderItems?: (OrderLine | null)[] | null;
  readonly Customer?: Customer | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly orderCustomerId?: string | null;
  constructor(init: ModelInit<Order, OrderMetaData>);
  static copyOf(source: Order, mutator: (draft: MutableModel<Order, OrderMetaData>) => MutableModel<Order, OrderMetaData> | void): Order;
}

export declare class OrderLine {
  readonly id: string;
  readonly productId: string;
  readonly barcode?: string | null;
  readonly sku?: string | null;
  readonly productName: string;
  readonly unitOfMeasure: string;
  readonly quantity: number;
  readonly tax: number;
  readonly price: number;
  readonly discountType?: string | null;
  readonly discountValue?: number | null;
  readonly orderID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<OrderLine, OrderLineMetaData>);
  static copyOf(source: OrderLine, mutator: (draft: MutableModel<OrderLine, OrderLineMetaData>) => MutableModel<OrderLine, OrderLineMetaData> | void): OrderLine;
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
  readonly quantity: number;
  readonly unitOfMeasure: string;
  readonly trackStock: boolean;
  readonly picture?: string | null;
  readonly Category?: Category | null;
  readonly Brand?: Brand | null;
  readonly isActive?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly productCategoryId?: string | null;
  readonly productBrandId?: string | null;
  constructor(init: ModelInit<Product, ProductMetaData>);
  static copyOf(source: Product, mutator: (draft: MutableModel<Product, ProductMetaData>) => MutableModel<Product, ProductMetaData> | void): Product;
}

export declare class PurchaseOrder {
  readonly id: string;
  readonly Supplier?: Supplier | null;
  readonly purchaseDate?: string | null;
  readonly amount?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly purchaseOrderSupplierId?: string | null;
  constructor(init: ModelInit<PurchaseOrder, PurchaseOrderMetaData>);
  static copyOf(source: PurchaseOrder, mutator: (draft: MutableModel<PurchaseOrder, PurchaseOrderMetaData>) => MutableModel<PurchaseOrder, PurchaseOrderMetaData> | void): PurchaseOrder;
}

export declare class Supplier {
  readonly id: string;
  readonly code?: string | null;
  readonly name: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Supplier, SupplierMetaData>);
  static copyOf(source: Supplier, mutator: (draft: MutableModel<Supplier, SupplierMetaData>) => MutableModel<Supplier, SupplierMetaData> | void): Supplier;
}

export declare class PurchaseOrderLine {
  readonly id: string;
  readonly Product?: Product | null;
  readonly unitPrice?: number | null;
  readonly quantity?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly purchaseOrderLineProductId?: string | null;
  constructor(init: ModelInit<PurchaseOrderLine, PurchaseOrderLineMetaData>);
  static copyOf(source: PurchaseOrderLine, mutator: (draft: MutableModel<PurchaseOrderLine, PurchaseOrderLineMetaData>) => MutableModel<PurchaseOrderLine, PurchaseOrderLineMetaData> | void): PurchaseOrderLine;
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

export declare class Stock {
  readonly id: string;
  readonly Product?: Product | null;
  readonly quantity: number;
  readonly updatedAt?: string | null;
  readonly createdAt?: string | null;
  readonly stockProductId?: string | null;
  constructor(init: ModelInit<Stock, StockMetaData>);
  static copyOf(source: Stock, mutator: (draft: MutableModel<Stock, StockMetaData>) => MutableModel<Stock, StockMetaData> | void): Stock;
}

export declare class Tag {
  readonly id: string;
  readonly name: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Tag, TagMetaData>);
  static copyOf(source: Tag, mutator: (draft: MutableModel<Tag, TagMetaData>) => MutableModel<Tag, TagMetaData> | void): Tag;
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

export declare class Inventory {
  readonly id: string;
  readonly quantity: number;
  readonly Product?: Product | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryProductId?: string | null;
  constructor(init: ModelInit<Inventory, InventoryMetaData>);
  static copyOf(source: Inventory, mutator: (draft: MutableModel<Inventory, InventoryMetaData>) => MutableModel<Inventory, InventoryMetaData> | void): Inventory;
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
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<InventoryCount, InventoryCountMetaData>);
  static copyOf(source: InventoryCount, mutator: (draft: MutableModel<InventoryCount, InventoryCountMetaData>) => MutableModel<InventoryCount, InventoryCountMetaData> | void): InventoryCount;
}

export declare class InventoryCountLine {
  readonly id: string;
  readonly current: number;
  readonly newCount: number;
  readonly comments?: string | null;
  readonly InventoryCount?: InventoryCount | null;
  readonly Product?: Product | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryCountLineInventoryCountId?: string | null;
  readonly inventoryCountLineProductId?: string | null;
  constructor(init: ModelInit<InventoryCountLine, InventoryCountLineMetaData>);
  static copyOf(source: InventoryCountLine, mutator: (draft: MutableModel<InventoryCountLine, InventoryCountLineMetaData>) => MutableModel<InventoryCountLine, InventoryCountLineMetaData> | void): InventoryCountLine;
}

export declare class InventoryReceived {
  readonly id: string;
  readonly comments?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<InventoryReceived, InventoryReceivedMetaData>);
  static copyOf(source: InventoryReceived, mutator: (draft: MutableModel<InventoryReceived, InventoryReceivedMetaData>) => MutableModel<InventoryReceived, InventoryReceivedMetaData> | void): InventoryReceived;
}

export declare class InventoryReceivedLine {
  readonly id: string;
  readonly current: number;
  readonly received: number;
  readonly comments?: string | null;
  readonly InventoryReceived?: InventoryReceived | null;
  readonly Product?: Product | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly inventoryReceivedLineInventoryReceivedId?: string | null;
  readonly inventoryReceivedLineProductId?: string | null;
  constructor(init: ModelInit<InventoryReceivedLine, InventoryReceivedLineMetaData>);
  static copyOf(source: InventoryReceivedLine, mutator: (draft: MutableModel<InventoryReceivedLine, InventoryReceivedLineMetaData>) => MutableModel<InventoryReceivedLine, InventoryReceivedLineMetaData> | void): InventoryReceivedLine;
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