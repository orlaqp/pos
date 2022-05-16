// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const OrderStatus = {
  "CREATED": "CREATED",
  "CANCELLED": "CANCELLED",
  "PAID": "PAID",
  "ONHOLD": "ONHOLD"
};

const { Brand, Category, Customer, Order, OrderLine, Product, PurchaseOrder, Supplier, PurchaseOrderLine, Store, Stock, Tag, UnitOfMeasure, InventoryChanges } = initSchema(schema);

export {
  Brand,
  Category,
  Customer,
  Order,
  OrderLine,
  Product,
  PurchaseOrder,
  Supplier,
  PurchaseOrderLine,
  Store,
  Stock,
  Tag,
  UnitOfMeasure,
  InventoryChanges,
  OrderStatus
};