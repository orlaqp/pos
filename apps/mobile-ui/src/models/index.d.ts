import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum OrderStatus {
  CREATED = "CREATED",
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

type UnitOfMeasureMetaData = {
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

export declare class Brand {
  readonly id: string;
  readonly name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Brand, BrandMetaData>);
  static copyOf(source: Brand, mutator: (draft: MutableModel<Brand, BrandMetaData>) => MutableModel<Brand, BrandMetaData> | void): Brand;
}

export declare class Category {
  readonly id: string;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly code?: string | null;
  readonly color?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Category, CategoryMetaData>);
  static copyOf(source: Category, mutator: (draft: MutableModel<Category, CategoryMetaData>) => MutableModel<Category, CategoryMetaData> | void): Category;
}

export declare class Customer {
  readonly id: string;
  readonly firstName?: string | null;
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
  readonly orderNo?: string | null;
  readonly subtotal?: number | null;
  readonly tax?: number | null;
  readonly total?: number | null;
  readonly status?: OrderStatus | keyof typeof OrderStatus | null;
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
  readonly Product?: Product | null;
  readonly quantity?: number | null;
  readonly tax?: number | null;
  readonly discountType?: string | null;
  readonly discountValue?: number | null;
  readonly orderID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly orderLineProductId?: string | null;
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
  readonly sku?: boolean | null;
  readonly trackStock?: string | null;
  readonly Category?: Category | null;
  readonly UnitOfMeasure?: UnitOfMeasure | null;
  readonly Brand?: Brand | null;
  readonly isActive?: boolean | null;
  readonly deleted?: boolean | null;
  readonly barcode?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly productCategoryId?: string | null;
  readonly productUnitOfMeasureId?: string | null;
  readonly productBrandId?: string | null;
  constructor(init: ModelInit<Product, ProductMetaData>);
  static copyOf(source: Product, mutator: (draft: MutableModel<Product, ProductMetaData>) => MutableModel<Product, ProductMetaData> | void): Product;
}

export declare class UnitOfMeasure {
  readonly id: string;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<UnitOfMeasure, UnitOfMeasureMetaData>);
  static copyOf(source: UnitOfMeasure, mutator: (draft: MutableModel<UnitOfMeasure, UnitOfMeasureMetaData>) => MutableModel<UnitOfMeasure, UnitOfMeasureMetaData> | void): UnitOfMeasure;
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
  readonly name?: string | null;
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
  readonly name?: string | null;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly country?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Store, StoreMetaData>);
  static copyOf(source: Store, mutator: (draft: MutableModel<Store, StoreMetaData>) => MutableModel<Store, StoreMetaData> | void): Store;
}

export declare class Stock {
  readonly id: string;
  readonly Product?: Product | null;
  readonly quantity?: number | null;
  readonly updatedAt?: string | null;
  readonly createdAt?: string | null;
  readonly stockProductId?: string | null;
  constructor(init: ModelInit<Stock, StockMetaData>);
  static copyOf(source: Stock, mutator: (draft: MutableModel<Stock, StockMetaData>) => MutableModel<Stock, StockMetaData> | void): Stock;
}

export declare class Tag {
  readonly id: string;
  readonly name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Tag, TagMetaData>);
  static copyOf(source: Tag, mutator: (draft: MutableModel<Tag, TagMetaData>) => MutableModel<Tag, TagMetaData> | void): Tag;
}