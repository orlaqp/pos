// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const OrderStatus = {
  "OPEN": "OPEN",
  "CANCELLED": "CANCELLED",
  "PAID": "PAID",
  "ONHOLD": "ONHOLD"
};

const { Brand, Category, Customer, Order, OrderLine, Product, PurchaseOrder, Supplier, PurchaseOrderLine, Store, Stock, Tag, UnitOfMeasure, Inventory, InventoryChanges, InventoryCount, InventoryCountLine, InventoryReceived, InventoryReceivedLine, Printer, Station } = initSchema(schema);

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
  Inventory,
  InventoryChanges,
  InventoryCount,
  InventoryCountLine,
  InventoryReceived,
  InventoryReceivedLine,
  Printer,
  Station,
  OrderStatus
};