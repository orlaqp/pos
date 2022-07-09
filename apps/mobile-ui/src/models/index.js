// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const OrderStatus = {
  "OPEN": "OPEN",
  "REFUNDED": "REFUNDED",
  "PAID": "PAID"
};

const PaymentType = {
  "CASH": "CASH",
  "CHECK": "CHECK",
  "CC": "CC"
};

const InventoryCountStatus = {
  "IN_PROGRESS": "IN_PROGRESS",
  "COMPLETED": "COMPLETED"
};

const InventoryReceiveStatus = {
  "IN_PROGRESS": "IN_PROGRESS",
  "COMPLETED": "COMPLETED"
};

const { Order, Customer, Store, Brand, Category, Employee, Product, UnitOfMeasure, InventoryChanges, InventoryCount, InventoryCountLine, InventoryReceive, InventoryReceiveLine, Printer, Station, OrderLine, RefundInfo, PaymentInfo, Payment, SalesSummary, ProductSaleSummary, EmployeeSaleSummary, DatePartSaleSummary } = initSchema(schema);

export {
  Order,
  Customer,
  Store,
  Brand,
  Category,
  Employee,
  Product,
  UnitOfMeasure,
  InventoryChanges,
  InventoryCount,
  InventoryCountLine,
  InventoryReceive,
  InventoryReceiveLine,
  Printer,
  Station,
  OrderStatus,
  PaymentType,
  InventoryCountStatus,
  InventoryReceiveStatus,
  OrderLine,
  RefundInfo,
  PaymentInfo,
  Payment,
  SalesSummary,
  ProductSaleSummary,
  EmployeeSaleSummary,
  DatePartSaleSummary
};