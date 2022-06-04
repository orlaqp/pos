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

const { Order, Customer, Brand, Category, Product, Store, Supplier, Stock, Tag, UnitOfMeasure, Inventory, InventoryChanges, InventoryCount, InventoryCountLine, InventoryReceive, InventoryReceiveLine, Printer, Station, OrderLine, SalesSummary, ProductSaleSummary, EmployeeSaleSummary, DatePartSaleSummary } = initSchema(schema);

export {
  Order,
  Customer,
  Brand,
  Category,
  Product,
  Store,
  Supplier,
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
  OrderLine,
  SalesSummary,
  ProductSaleSummary,
  EmployeeSaleSummary,
  DatePartSaleSummary
};