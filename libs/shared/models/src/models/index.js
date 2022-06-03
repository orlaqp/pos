// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const OrderStatus = {
  "OPEN": "OPEN",
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

const { Brand, Category, Customer, Order, OrderLine, Product, PurchaseOrder, Supplier, PurchaseOrderLine, Store, Stock, Tag, UnitOfMeasure, Inventory, InventoryChanges, InventoryCount, InventoryCountLine, InventoryReceive, InventoryReceiveLine, Printer, Station, SalesSummary, ProductSaleSummary, EmployeeSaleSummary } = initSchema(schema);

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
  InventoryReceive,
  InventoryReceiveLine,
  Printer,
  Station,
  OrderStatus,
  InventoryCountStatus,
  InventoryReceiveStatus,
  SalesSummary,
  ProductSaleSummary,
  EmployeeSaleSummary
};