// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const PaymentType = {
  "CASH": "CASH",
  "CHECK": "CHECK",
  "CC": "CC"
};

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

const { Store, Brand, Category, Customer, Employee, Order, Product, UnitOfMeasure, InventoryChanges, InventoryCount, InventoryCountLine, InventoryReceive, InventoryReceiveLine, Printer, Station, GlobalSettings, PaymentInfo, RefundInfo, ByEmployee, OrderLine, Payment, ProductSaleSummary, EmployeeSaleSummary, DatePartSaleSummary, SalesSummary } = initSchema(schema);

export {
  Store,
  Brand,
  Category,
  Customer,
  Employee,
  Order,
  Product,
  UnitOfMeasure,
  InventoryChanges,
  InventoryCount,
  InventoryCountLine,
  InventoryReceive,
  InventoryReceiveLine,
  Printer,
  Station,
  GlobalSettings,
  PaymentType,
  OrderStatus,
  InventoryCountStatus,
  InventoryReceiveStatus,
  PaymentInfo,
  RefundInfo,
  ByEmployee,
  OrderLine,
  Payment,
  ProductSaleSummary,
  EmployeeSaleSummary,
  DatePartSaleSummary,
  SalesSummary
};