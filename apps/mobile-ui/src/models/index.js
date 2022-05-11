// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const OrderStatus = {
  "CREATED": "CREATED",
  "CANCELLED": "CANCELLED",
  "PAID": "PAID",
  "ONHOLD": "ONHOLD"
};

const { Brand, Category, Customer, Order, OrderLine, Product, UnitOfMeasure, PurchaseOrder, Supplier, PurchaseOrderLine, Store, Stock, Tag } = initSchema(schema);

export {
  Brand,
  Category,
  Customer,
  Order,
  OrderLine,
  Product,
  UnitOfMeasure,
  PurchaseOrder,
  Supplier,
  PurchaseOrderLine,
  Store,
  Stock,
  Tag,
  OrderStatus
};