/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateStoreInput = {
  id?: string | null,
  name: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  phone: string,
  fax?: string | null,
  email: string,
  disclaimer?: string | null,
  _version?: number | null,
};

export type ModelStoreConditionInput = {
  name?: ModelStringInput | null,
  address?: ModelStringInput | null,
  city?: ModelStringInput | null,
  state?: ModelStringInput | null,
  zipCode?: ModelStringInput | null,
  country?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  fax?: ModelStringInput | null,
  email?: ModelStringInput | null,
  disclaimer?: ModelStringInput | null,
  and?: Array< ModelStoreConditionInput | null > | null,
  or?: Array< ModelStoreConditionInput | null > | null,
  not?: ModelStoreConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type Store = {
  __typename: "Store",
  id: string,
  name: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  phone: string,
  fax?: string | null,
  email: string,
  disclaimer?: string | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateStoreInput = {
  id: string,
  name?: string | null,
  address?: string | null,
  city?: string | null,
  state?: string | null,
  zipCode?: string | null,
  country?: string | null,
  phone?: string | null,
  fax?: string | null,
  email?: string | null,
  disclaimer?: string | null,
  _version?: number | null,
};

export type DeleteStoreInput = {
  id: string,
  _version?: number | null,
};

export type CreateBrandInput = {
  id?: string | null,
  name: string,
  description?: string | null,
  _version?: number | null,
};

export type ModelBrandConditionInput = {
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelBrandConditionInput | null > | null,
  or?: Array< ModelBrandConditionInput | null > | null,
  not?: ModelBrandConditionInput | null,
};

export type Brand = {
  __typename: "Brand",
  id: string,
  name: string,
  description?: string | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateBrandInput = {
  id: string,
  name?: string | null,
  description?: string | null,
  _version?: number | null,
};

export type DeleteBrandInput = {
  id: string,
  _version?: number | null,
};

export type CreateCategoryInput = {
  id?: string | null,
  name: string,
  description?: string | null,
  code?: string | null,
  color?: string | null,
  picture?: string | null,
  _version?: number | null,
};

export type ModelCategoryConditionInput = {
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  code?: ModelStringInput | null,
  color?: ModelStringInput | null,
  picture?: ModelStringInput | null,
  and?: Array< ModelCategoryConditionInput | null > | null,
  or?: Array< ModelCategoryConditionInput | null > | null,
  not?: ModelCategoryConditionInput | null,
};

export type Category = {
  __typename: "Category",
  id: string,
  name: string,
  description?: string | null,
  code?: string | null,
  color?: string | null,
  picture?: string | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateCategoryInput = {
  id: string,
  name?: string | null,
  description?: string | null,
  code?: string | null,
  color?: string | null,
  picture?: string | null,
  _version?: number | null,
};

export type DeleteCategoryInput = {
  id: string,
  _version?: number | null,
};

export type CreateCustomerInput = {
  id?: string | null,
  firstName: string,
  lastName?: string | null,
  middleName?: string | null,
  dob?: string | null,
  phone?: string | null,
  email?: string | null,
  _version?: number | null,
};

export type ModelCustomerConditionInput = {
  firstName?: ModelStringInput | null,
  lastName?: ModelStringInput | null,
  middleName?: ModelStringInput | null,
  dob?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  email?: ModelStringInput | null,
  and?: Array< ModelCustomerConditionInput | null > | null,
  or?: Array< ModelCustomerConditionInput | null > | null,
  not?: ModelCustomerConditionInput | null,
};

export type Customer = {
  __typename: "Customer",
  id: string,
  firstName: string,
  lastName?: string | null,
  middleName?: string | null,
  dob?: string | null,
  phone?: string | null,
  email?: string | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateCustomerInput = {
  id: string,
  firstName?: string | null,
  lastName?: string | null,
  middleName?: string | null,
  dob?: string | null,
  phone?: string | null,
  email?: string | null,
  _version?: number | null,
};

export type DeleteCustomerInput = {
  id: string,
  _version?: number | null,
};

export type CreateEmployeeInput = {
  id?: string | null,
  code: string,
  firstName: string,
  lastName?: string | null,
  middleName?: string | null,
  dob?: string | null,
  phone?: string | null,
  email?: string | null,
  pin: string,
  roles: Array< string | null >,
  active: boolean,
  _version?: number | null,
};

export type ModelEmployeeConditionInput = {
  code?: ModelStringInput | null,
  firstName?: ModelStringInput | null,
  lastName?: ModelStringInput | null,
  middleName?: ModelStringInput | null,
  dob?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  email?: ModelStringInput | null,
  pin?: ModelStringInput | null,
  roles?: ModelStringInput | null,
  active?: ModelBooleanInput | null,
  and?: Array< ModelEmployeeConditionInput | null > | null,
  or?: Array< ModelEmployeeConditionInput | null > | null,
  not?: ModelEmployeeConditionInput | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Employee = {
  __typename: "Employee",
  id: string,
  code: string,
  firstName: string,
  lastName?: string | null,
  middleName?: string | null,
  dob?: string | null,
  phone?: string | null,
  email?: string | null,
  pin: string,
  roles: Array< string | null >,
  active: boolean,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateEmployeeInput = {
  id: string,
  code?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  middleName?: string | null,
  dob?: string | null,
  phone?: string | null,
  email?: string | null,
  pin?: string | null,
  roles?: Array< string | null > | null,
  active?: boolean | null,
  _version?: number | null,
};

export type DeleteEmployeeInput = {
  id: string,
  _version?: number | null,
};

export type CreateOrderInput = {
  id?: string | null,
  orderNo: string,
  orderDate: string,
  subtotal: number,
  tax: number,
  total: number,
  status: OrderStatus,
  employeeId: string,
  employeeName: string,
  lines: Array< OrderLineInput | null >,
  paymentInfo?: PaymentInfoInput | null,
  refundInfo?: RefundInfoInput | null,
  createdBy?: ByEmployeeInput | null,
  updatedBy?: ByEmployeeInput | null,
  _version?: number | null,
  orderCustomerId?: string | null,
};

export enum OrderStatus {
  OPEN = "OPEN",
  REFUNDED = "REFUNDED",
  PAID = "PAID",
}


export type OrderLineInput = {
  identifier: string,
  productId: string,
  productName: string,
  unitOfMeasure: string,
  barcode?: string | null,
  sku?: string | null,
  quantity: number,
  tax: number,
  price: number,
};

export type PaymentInfoInput = {
  employeeId: string,
  employeeName: string,
  payments?: Array< PaymentInput | null > | null,
};

export type PaymentInput = {
  type: PaymentType,
  amount: number,
};

export enum PaymentType {
  CASH = "CASH",
  CHECK = "CHECK",
  CC = "CC",
}


export type RefundInfoInput = {
  employeeId: string,
  employeeName: string,
  comments?: string | null,
};

export type ByEmployeeInput = {
  id: string,
  name: string,
};

export type ModelOrderConditionInput = {
  orderNo?: ModelStringInput | null,
  orderDate?: ModelStringInput | null,
  subtotal?: ModelFloatInput | null,
  tax?: ModelFloatInput | null,
  total?: ModelFloatInput | null,
  status?: ModelOrderStatusInput | null,
  employeeId?: ModelStringInput | null,
  employeeName?: ModelStringInput | null,
  and?: Array< ModelOrderConditionInput | null > | null,
  or?: Array< ModelOrderConditionInput | null > | null,
  not?: ModelOrderConditionInput | null,
  orderCustomerId?: ModelIDInput | null,
};

export type ModelFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelOrderStatusInput = {
  eq?: OrderStatus | null,
  ne?: OrderStatus | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type Order = {
  __typename: "Order",
  id: string,
  orderNo: string,
  orderDate: string,
  subtotal: number,
  tax: number,
  total: number,
  status: OrderStatus,
  employeeId: string,
  employeeName: string,
  lines:  Array<OrderLine | null >,
  paymentInfo?: PaymentInfo | null,
  refundInfo?: RefundInfo | null,
  createdBy?: ByEmployee | null,
  updatedBy?: ByEmployee | null,
  Customer?: Customer | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  orderCustomerId?: string | null,
};

export type OrderLine = {
  __typename: "OrderLine",
  identifier: string,
  productId: string,
  productName: string,
  unitOfMeasure: string,
  barcode?: string | null,
  sku?: string | null,
  quantity: number,
  tax: number,
  price: number,
};

export type PaymentInfo = {
  __typename: "PaymentInfo",
  employeeId: string,
  employeeName: string,
  payments?:  Array<Payment | null > | null,
};

export type Payment = {
  __typename: "Payment",
  type: PaymentType,
  amount: number,
};

export type RefundInfo = {
  __typename: "RefundInfo",
  employeeId: string,
  employeeName: string,
  comments?: string | null,
};

export type ByEmployee = {
  __typename: "ByEmployee",
  id: string,
  name: string,
};

export type UpdateOrderInput = {
  id: string,
  orderNo?: string | null,
  orderDate?: string | null,
  subtotal?: number | null,
  tax?: number | null,
  total?: number | null,
  status?: OrderStatus | null,
  employeeId?: string | null,
  employeeName?: string | null,
  lines?: Array< OrderLineInput | null > | null,
  paymentInfo?: PaymentInfoInput | null,
  refundInfo?: RefundInfoInput | null,
  createdBy?: ByEmployeeInput | null,
  updatedBy?: ByEmployeeInput | null,
  _version?: number | null,
  orderCustomerId?: string | null,
};

export type DeleteOrderInput = {
  id: string,
  _version?: number | null,
};

export type CreateProductInput = {
  id?: string | null,
  name: string,
  description?: string | null,
  price: number,
  tags?: string | null,
  cost?: number | null,
  barcode?: string | null,
  sku?: string | null,
  plu?: string | null,
  quantity: number,
  unitOfMeasure: string,
  trackStock: boolean,
  reorderPoint?: number | null,
  reorderQuantity?: number | null,
  picture?: string | null,
  isActive?: boolean | null,
  _version?: number | null,
  productCategoryId?: string | null,
  productBrandId?: string | null,
};

export type ModelProductConditionInput = {
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  price?: ModelFloatInput | null,
  tags?: ModelStringInput | null,
  cost?: ModelFloatInput | null,
  barcode?: ModelStringInput | null,
  sku?: ModelStringInput | null,
  plu?: ModelStringInput | null,
  quantity?: ModelFloatInput | null,
  unitOfMeasure?: ModelStringInput | null,
  trackStock?: ModelBooleanInput | null,
  reorderPoint?: ModelFloatInput | null,
  reorderQuantity?: ModelFloatInput | null,
  picture?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  and?: Array< ModelProductConditionInput | null > | null,
  or?: Array< ModelProductConditionInput | null > | null,
  not?: ModelProductConditionInput | null,
  productCategoryId?: ModelIDInput | null,
  productBrandId?: ModelIDInput | null,
};

export type Product = {
  __typename: "Product",
  id: string,
  name: string,
  description?: string | null,
  price: number,
  tags?: string | null,
  cost?: number | null,
  barcode?: string | null,
  sku?: string | null,
  plu?: string | null,
  quantity: number,
  unitOfMeasure: string,
  trackStock: boolean,
  reorderPoint?: number | null,
  reorderQuantity?: number | null,
  picture?: string | null,
  Category?: Category | null,
  Brand?: Brand | null,
  isActive?: boolean | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  productCategoryId?: string | null,
  productBrandId?: string | null,
};

export type UpdateProductInput = {
  id: string,
  name?: string | null,
  description?: string | null,
  price?: number | null,
  tags?: string | null,
  cost?: number | null,
  barcode?: string | null,
  sku?: string | null,
  plu?: string | null,
  quantity?: number | null,
  unitOfMeasure?: string | null,
  trackStock?: boolean | null,
  reorderPoint?: number | null,
  reorderQuantity?: number | null,
  picture?: string | null,
  isActive?: boolean | null,
  _version?: number | null,
  productCategoryId?: string | null,
  productBrandId?: string | null,
};

export type DeleteProductInput = {
  id: string,
  _version?: number | null,
};

export type CreateUnitOfMeasureInput = {
  id?: string | null,
  name: string,
  description?: string | null,
  _version?: number | null,
};

export type ModelUnitOfMeasureConditionInput = {
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelUnitOfMeasureConditionInput | null > | null,
  or?: Array< ModelUnitOfMeasureConditionInput | null > | null,
  not?: ModelUnitOfMeasureConditionInput | null,
};

export type UnitOfMeasure = {
  __typename: "UnitOfMeasure",
  id: string,
  name: string,
  description?: string | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateUnitOfMeasureInput = {
  id: string,
  name?: string | null,
  description?: string | null,
  _version?: number | null,
};

export type DeleteUnitOfMeasureInput = {
  id: string,
  _version?: number | null,
};

export type CreateInventoryChangesInput = {
  id?: string | null,
  timestamp: string,
  type: string,
  typeId?: string | null,
  quantityIn: number,
  quantityOut: number,
  _version?: number | null,
  inventoryChangesProductId?: string | null,
};

export type ModelInventoryChangesConditionInput = {
  timestamp?: ModelStringInput | null,
  type?: ModelStringInput | null,
  typeId?: ModelStringInput | null,
  quantityIn?: ModelIntInput | null,
  quantityOut?: ModelIntInput | null,
  and?: Array< ModelInventoryChangesConditionInput | null > | null,
  or?: Array< ModelInventoryChangesConditionInput | null > | null,
  not?: ModelInventoryChangesConditionInput | null,
  inventoryChangesProductId?: ModelIDInput | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type InventoryChanges = {
  __typename: "InventoryChanges",
  id: string,
  timestamp: string,
  type: string,
  typeId?: string | null,
  quantityIn: number,
  quantityOut: number,
  Product?: Product | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  inventoryChangesProductId?: string | null,
};

export type UpdateInventoryChangesInput = {
  id: string,
  timestamp?: string | null,
  type?: string | null,
  typeId?: string | null,
  quantityIn?: number | null,
  quantityOut?: number | null,
  _version?: number | null,
  inventoryChangesProductId?: string | null,
};

export type DeleteInventoryChangesInput = {
  id: string,
  _version?: number | null,
};

export type CreateInventoryCountInput = {
  id?: string | null,
  comments?: string | null,
  status: InventoryCountStatus,
  createdBy: ByEmployeeInput,
  _version?: number | null,
};

export enum InventoryCountStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}


export type ModelInventoryCountConditionInput = {
  comments?: ModelStringInput | null,
  status?: ModelInventoryCountStatusInput | null,
  and?: Array< ModelInventoryCountConditionInput | null > | null,
  or?: Array< ModelInventoryCountConditionInput | null > | null,
  not?: ModelInventoryCountConditionInput | null,
};

export type ModelInventoryCountStatusInput = {
  eq?: InventoryCountStatus | null,
  ne?: InventoryCountStatus | null,
};

export type InventoryCount = {
  __typename: "InventoryCount",
  id: string,
  comments?: string | null,
  status: InventoryCountStatus,
  createdBy: ByEmployee,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateInventoryCountInput = {
  id: string,
  comments?: string | null,
  status?: InventoryCountStatus | null,
  createdBy?: ByEmployeeInput | null,
  _version?: number | null,
};

export type DeleteInventoryCountInput = {
  id: string,
  _version?: number | null,
};

export type CreateInventoryCountLineInput = {
  id?: string | null,
  productId: string,
  productName: string,
  unitOfMeasure: string,
  current: number,
  newCount: number,
  comments?: string | null,
  _version?: number | null,
  inventoryCountLineInventoryCountId?: string | null,
};

export type ModelInventoryCountLineConditionInput = {
  productId?: ModelStringInput | null,
  productName?: ModelStringInput | null,
  unitOfMeasure?: ModelStringInput | null,
  current?: ModelFloatInput | null,
  newCount?: ModelFloatInput | null,
  comments?: ModelStringInput | null,
  and?: Array< ModelInventoryCountLineConditionInput | null > | null,
  or?: Array< ModelInventoryCountLineConditionInput | null > | null,
  not?: ModelInventoryCountLineConditionInput | null,
  inventoryCountLineInventoryCountId?: ModelIDInput | null,
};

export type InventoryCountLine = {
  __typename: "InventoryCountLine",
  id: string,
  productId: string,
  productName: string,
  unitOfMeasure: string,
  current: number,
  newCount: number,
  comments?: string | null,
  InventoryCount?: InventoryCount | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  inventoryCountLineInventoryCountId?: string | null,
};

export type UpdateInventoryCountLineInput = {
  id: string,
  productId?: string | null,
  productName?: string | null,
  unitOfMeasure?: string | null,
  current?: number | null,
  newCount?: number | null,
  comments?: string | null,
  _version?: number | null,
  inventoryCountLineInventoryCountId?: string | null,
};

export type DeleteInventoryCountLineInput = {
  id: string,
  _version?: number | null,
};

export type CreateInventoryReceiveInput = {
  id?: string | null,
  comments?: string | null,
  status: InventoryReceiveStatus,
  createdBy: ByEmployeeInput,
  _version?: number | null,
};

export enum InventoryReceiveStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}


export type ModelInventoryReceiveConditionInput = {
  comments?: ModelStringInput | null,
  status?: ModelInventoryReceiveStatusInput | null,
  and?: Array< ModelInventoryReceiveConditionInput | null > | null,
  or?: Array< ModelInventoryReceiveConditionInput | null > | null,
  not?: ModelInventoryReceiveConditionInput | null,
};

export type ModelInventoryReceiveStatusInput = {
  eq?: InventoryReceiveStatus | null,
  ne?: InventoryReceiveStatus | null,
};

export type InventoryReceive = {
  __typename: "InventoryReceive",
  id: string,
  comments?: string | null,
  status: InventoryReceiveStatus,
  createdBy: ByEmployee,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateInventoryReceiveInput = {
  id: string,
  comments?: string | null,
  status?: InventoryReceiveStatus | null,
  createdBy?: ByEmployeeInput | null,
  _version?: number | null,
};

export type DeleteInventoryReceiveInput = {
  id: string,
  _version?: number | null,
};

export type CreateInventoryReceiveLineInput = {
  id?: string | null,
  productId: string,
  productName: string,
  unitOfMeasure: string,
  received: number,
  comments?: string | null,
  _version?: number | null,
  inventoryReceiveLineInventoryReceiveId?: string | null,
};

export type ModelInventoryReceiveLineConditionInput = {
  productId?: ModelStringInput | null,
  productName?: ModelStringInput | null,
  unitOfMeasure?: ModelStringInput | null,
  received?: ModelFloatInput | null,
  comments?: ModelStringInput | null,
  and?: Array< ModelInventoryReceiveLineConditionInput | null > | null,
  or?: Array< ModelInventoryReceiveLineConditionInput | null > | null,
  not?: ModelInventoryReceiveLineConditionInput | null,
  inventoryReceiveLineInventoryReceiveId?: ModelIDInput | null,
};

export type InventoryReceiveLine = {
  __typename: "InventoryReceiveLine",
  id: string,
  productId: string,
  productName: string,
  unitOfMeasure: string,
  received: number,
  comments?: string | null,
  InventoryReceive?: InventoryReceive | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  inventoryReceiveLineInventoryReceiveId?: string | null,
};

export type UpdateInventoryReceiveLineInput = {
  id: string,
  productId?: string | null,
  productName?: string | null,
  unitOfMeasure?: string | null,
  received?: number | null,
  comments?: string | null,
  _version?: number | null,
  inventoryReceiveLineInventoryReceiveId?: string | null,
};

export type DeleteInventoryReceiveLineInput = {
  id: string,
  _version?: number | null,
};

export type CreatePrinterInput = {
  id?: string | null,
  deviceId: string,
  identifier: string,
  interfaceType: string,
  ip: string,
  model?: string | null,
  alias?: string | null,
  _version?: number | null,
};

export type ModelPrinterConditionInput = {
  deviceId?: ModelStringInput | null,
  identifier?: ModelStringInput | null,
  interfaceType?: ModelStringInput | null,
  ip?: ModelStringInput | null,
  model?: ModelStringInput | null,
  alias?: ModelStringInput | null,
  and?: Array< ModelPrinterConditionInput | null > | null,
  or?: Array< ModelPrinterConditionInput | null > | null,
  not?: ModelPrinterConditionInput | null,
};

export type Printer = {
  __typename: "Printer",
  id: string,
  deviceId: string,
  identifier: string,
  interfaceType: string,
  ip: string,
  model?: string | null,
  alias?: string | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdatePrinterInput = {
  id: string,
  deviceId?: string | null,
  identifier?: string | null,
  interfaceType?: string | null,
  ip?: string | null,
  model?: string | null,
  alias?: string | null,
  _version?: number | null,
};

export type DeletePrinterInput = {
  id: string,
  _version?: number | null,
};

export type CreateStationInput = {
  id?: string | null,
  deviceId: string,
  alias: string,
  _version?: number | null,
};

export type ModelStationConditionInput = {
  deviceId?: ModelStringInput | null,
  alias?: ModelStringInput | null,
  and?: Array< ModelStationConditionInput | null > | null,
  or?: Array< ModelStationConditionInput | null > | null,
  not?: ModelStationConditionInput | null,
};

export type Station = {
  __typename: "Station",
  id: string,
  deviceId: string,
  alias: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateStationInput = {
  id: string,
  deviceId?: string | null,
  alias?: string | null,
  _version?: number | null,
};

export type DeleteStationInput = {
  id: string,
  _version?: number | null,
};

export type SalesSummary = {
  __typename: "SalesSummary",
  products?:  Array<ProductSaleSummary | null > | null,
  employees?:  Array<EmployeeSaleSummary | null > | null,
  dates?:  Array<DatePartSaleSummary | null > | null,
  totalAmount: number,
  totalOrders: number,
};

export type ProductSaleSummary = {
  __typename: "ProductSaleSummary",
  productId: string,
  productName: string,
  unitOfMeasure: string,
  quantity: number,
  amount: number,
};

export type EmployeeSaleSummary = {
  __typename: "EmployeeSaleSummary",
  employeeId: string,
  employeeName: string,
  orders: number,
  amount: number,
};

export type DatePartSaleSummary = {
  __typename: "DatePartSaleSummary",
  datePart: string,
  orders: number,
  amount: number,
};

export type ModelStoreFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  address?: ModelStringInput | null,
  city?: ModelStringInput | null,
  state?: ModelStringInput | null,
  zipCode?: ModelStringInput | null,
  country?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  fax?: ModelStringInput | null,
  email?: ModelStringInput | null,
  disclaimer?: ModelStringInput | null,
  and?: Array< ModelStoreFilterInput | null > | null,
  or?: Array< ModelStoreFilterInput | null > | null,
  not?: ModelStoreFilterInput | null,
};

export type ModelStoreConnection = {
  __typename: "ModelStoreConnection",
  items:  Array<Store | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelBrandFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelBrandFilterInput | null > | null,
  or?: Array< ModelBrandFilterInput | null > | null,
  not?: ModelBrandFilterInput | null,
};

export type ModelBrandConnection = {
  __typename: "ModelBrandConnection",
  items:  Array<Brand | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelCategoryFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  code?: ModelStringInput | null,
  color?: ModelStringInput | null,
  picture?: ModelStringInput | null,
  and?: Array< ModelCategoryFilterInput | null > | null,
  or?: Array< ModelCategoryFilterInput | null > | null,
  not?: ModelCategoryFilterInput | null,
};

export type ModelCategoryConnection = {
  __typename: "ModelCategoryConnection",
  items:  Array<Category | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelCustomerFilterInput = {
  id?: ModelIDInput | null,
  firstName?: ModelStringInput | null,
  lastName?: ModelStringInput | null,
  middleName?: ModelStringInput | null,
  dob?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  email?: ModelStringInput | null,
  and?: Array< ModelCustomerFilterInput | null > | null,
  or?: Array< ModelCustomerFilterInput | null > | null,
  not?: ModelCustomerFilterInput | null,
};

export type ModelCustomerConnection = {
  __typename: "ModelCustomerConnection",
  items:  Array<Customer | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelEmployeeFilterInput = {
  id?: ModelIDInput | null,
  code?: ModelStringInput | null,
  firstName?: ModelStringInput | null,
  lastName?: ModelStringInput | null,
  middleName?: ModelStringInput | null,
  dob?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  email?: ModelStringInput | null,
  pin?: ModelStringInput | null,
  roles?: ModelStringInput | null,
  active?: ModelBooleanInput | null,
  and?: Array< ModelEmployeeFilterInput | null > | null,
  or?: Array< ModelEmployeeFilterInput | null > | null,
  not?: ModelEmployeeFilterInput | null,
};

export type ModelEmployeeConnection = {
  __typename: "ModelEmployeeConnection",
  items:  Array<Employee | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelOrderFilterInput = {
  id?: ModelIDInput | null,
  orderNo?: ModelStringInput | null,
  orderDate?: ModelStringInput | null,
  subtotal?: ModelFloatInput | null,
  tax?: ModelFloatInput | null,
  total?: ModelFloatInput | null,
  status?: ModelOrderStatusInput | null,
  employeeId?: ModelStringInput | null,
  employeeName?: ModelStringInput | null,
  and?: Array< ModelOrderFilterInput | null > | null,
  or?: Array< ModelOrderFilterInput | null > | null,
  not?: ModelOrderFilterInput | null,
  orderCustomerId?: ModelIDInput | null,
};

export type ModelOrderConnection = {
  __typename: "ModelOrderConnection",
  items:  Array<Order | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelProductFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  price?: ModelFloatInput | null,
  tags?: ModelStringInput | null,
  cost?: ModelFloatInput | null,
  barcode?: ModelStringInput | null,
  sku?: ModelStringInput | null,
  plu?: ModelStringInput | null,
  quantity?: ModelFloatInput | null,
  unitOfMeasure?: ModelStringInput | null,
  trackStock?: ModelBooleanInput | null,
  reorderPoint?: ModelFloatInput | null,
  reorderQuantity?: ModelFloatInput | null,
  picture?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  and?: Array< ModelProductFilterInput | null > | null,
  or?: Array< ModelProductFilterInput | null > | null,
  not?: ModelProductFilterInput | null,
  productCategoryId?: ModelIDInput | null,
  productBrandId?: ModelIDInput | null,
};

export type ModelProductConnection = {
  __typename: "ModelProductConnection",
  items:  Array<Product | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelUnitOfMeasureFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelUnitOfMeasureFilterInput | null > | null,
  or?: Array< ModelUnitOfMeasureFilterInput | null > | null,
  not?: ModelUnitOfMeasureFilterInput | null,
};

export type ModelUnitOfMeasureConnection = {
  __typename: "ModelUnitOfMeasureConnection",
  items:  Array<UnitOfMeasure | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelInventoryChangesFilterInput = {
  id?: ModelIDInput | null,
  timestamp?: ModelStringInput | null,
  type?: ModelStringInput | null,
  typeId?: ModelStringInput | null,
  quantityIn?: ModelIntInput | null,
  quantityOut?: ModelIntInput | null,
  and?: Array< ModelInventoryChangesFilterInput | null > | null,
  or?: Array< ModelInventoryChangesFilterInput | null > | null,
  not?: ModelInventoryChangesFilterInput | null,
  inventoryChangesProductId?: ModelIDInput | null,
};

export type ModelInventoryChangesConnection = {
  __typename: "ModelInventoryChangesConnection",
  items:  Array<InventoryChanges | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelInventoryCountFilterInput = {
  id?: ModelIDInput | null,
  comments?: ModelStringInput | null,
  status?: ModelInventoryCountStatusInput | null,
  and?: Array< ModelInventoryCountFilterInput | null > | null,
  or?: Array< ModelInventoryCountFilterInput | null > | null,
  not?: ModelInventoryCountFilterInput | null,
};

export type ModelInventoryCountConnection = {
  __typename: "ModelInventoryCountConnection",
  items:  Array<InventoryCount | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelInventoryCountLineFilterInput = {
  id?: ModelIDInput | null,
  productId?: ModelStringInput | null,
  productName?: ModelStringInput | null,
  unitOfMeasure?: ModelStringInput | null,
  current?: ModelFloatInput | null,
  newCount?: ModelFloatInput | null,
  comments?: ModelStringInput | null,
  and?: Array< ModelInventoryCountLineFilterInput | null > | null,
  or?: Array< ModelInventoryCountLineFilterInput | null > | null,
  not?: ModelInventoryCountLineFilterInput | null,
  inventoryCountLineInventoryCountId?: ModelIDInput | null,
};

export type ModelInventoryCountLineConnection = {
  __typename: "ModelInventoryCountLineConnection",
  items:  Array<InventoryCountLine | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelInventoryReceiveFilterInput = {
  id?: ModelIDInput | null,
  comments?: ModelStringInput | null,
  status?: ModelInventoryReceiveStatusInput | null,
  and?: Array< ModelInventoryReceiveFilterInput | null > | null,
  or?: Array< ModelInventoryReceiveFilterInput | null > | null,
  not?: ModelInventoryReceiveFilterInput | null,
};

export type ModelInventoryReceiveConnection = {
  __typename: "ModelInventoryReceiveConnection",
  items:  Array<InventoryReceive | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelInventoryReceiveLineFilterInput = {
  id?: ModelIDInput | null,
  productId?: ModelStringInput | null,
  productName?: ModelStringInput | null,
  unitOfMeasure?: ModelStringInput | null,
  received?: ModelFloatInput | null,
  comments?: ModelStringInput | null,
  and?: Array< ModelInventoryReceiveLineFilterInput | null > | null,
  or?: Array< ModelInventoryReceiveLineFilterInput | null > | null,
  not?: ModelInventoryReceiveLineFilterInput | null,
  inventoryReceiveLineInventoryReceiveId?: ModelIDInput | null,
};

export type ModelInventoryReceiveLineConnection = {
  __typename: "ModelInventoryReceiveLineConnection",
  items:  Array<InventoryReceiveLine | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelPrinterFilterInput = {
  id?: ModelIDInput | null,
  deviceId?: ModelStringInput | null,
  identifier?: ModelStringInput | null,
  interfaceType?: ModelStringInput | null,
  ip?: ModelStringInput | null,
  model?: ModelStringInput | null,
  alias?: ModelStringInput | null,
  and?: Array< ModelPrinterFilterInput | null > | null,
  or?: Array< ModelPrinterFilterInput | null > | null,
  not?: ModelPrinterFilterInput | null,
};

export type ModelPrinterConnection = {
  __typename: "ModelPrinterConnection",
  items:  Array<Printer | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelStationFilterInput = {
  id?: ModelIDInput | null,
  deviceId?: ModelStringInput | null,
  alias?: ModelStringInput | null,
  and?: Array< ModelStationFilterInput | null > | null,
  or?: Array< ModelStationFilterInput | null > | null,
  not?: ModelStationFilterInput | null,
};

export type ModelStationConnection = {
  __typename: "ModelStationConnection",
  items:  Array<Station | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type CreateStoreMutationVariables = {
  input: CreateStoreInput,
  condition?: ModelStoreConditionInput | null,
};

export type CreateStoreMutation = {
  createStore?:  {
    __typename: "Store",
    id: string,
    name: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string,
    fax?: string | null,
    email: string,
    disclaimer?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateStoreMutationVariables = {
  input: UpdateStoreInput,
  condition?: ModelStoreConditionInput | null,
};

export type UpdateStoreMutation = {
  updateStore?:  {
    __typename: "Store",
    id: string,
    name: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string,
    fax?: string | null,
    email: string,
    disclaimer?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteStoreMutationVariables = {
  input: DeleteStoreInput,
  condition?: ModelStoreConditionInput | null,
};

export type DeleteStoreMutation = {
  deleteStore?:  {
    __typename: "Store",
    id: string,
    name: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string,
    fax?: string | null,
    email: string,
    disclaimer?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateBrandMutationVariables = {
  input: CreateBrandInput,
  condition?: ModelBrandConditionInput | null,
};

export type CreateBrandMutation = {
  createBrand?:  {
    __typename: "Brand",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateBrandMutationVariables = {
  input: UpdateBrandInput,
  condition?: ModelBrandConditionInput | null,
};

export type UpdateBrandMutation = {
  updateBrand?:  {
    __typename: "Brand",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteBrandMutationVariables = {
  input: DeleteBrandInput,
  condition?: ModelBrandConditionInput | null,
};

export type DeleteBrandMutation = {
  deleteBrand?:  {
    __typename: "Brand",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateCategoryMutationVariables = {
  input: CreateCategoryInput,
  condition?: ModelCategoryConditionInput | null,
};

export type CreateCategoryMutation = {
  createCategory?:  {
    __typename: "Category",
    id: string,
    name: string,
    description?: string | null,
    code?: string | null,
    color?: string | null,
    picture?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateCategoryMutationVariables = {
  input: UpdateCategoryInput,
  condition?: ModelCategoryConditionInput | null,
};

export type UpdateCategoryMutation = {
  updateCategory?:  {
    __typename: "Category",
    id: string,
    name: string,
    description?: string | null,
    code?: string | null,
    color?: string | null,
    picture?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteCategoryMutationVariables = {
  input: DeleteCategoryInput,
  condition?: ModelCategoryConditionInput | null,
};

export type DeleteCategoryMutation = {
  deleteCategory?:  {
    __typename: "Category",
    id: string,
    name: string,
    description?: string | null,
    code?: string | null,
    color?: string | null,
    picture?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateCustomerMutationVariables = {
  input: CreateCustomerInput,
  condition?: ModelCustomerConditionInput | null,
};

export type CreateCustomerMutation = {
  createCustomer?:  {
    __typename: "Customer",
    id: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateCustomerMutationVariables = {
  input: UpdateCustomerInput,
  condition?: ModelCustomerConditionInput | null,
};

export type UpdateCustomerMutation = {
  updateCustomer?:  {
    __typename: "Customer",
    id: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteCustomerMutationVariables = {
  input: DeleteCustomerInput,
  condition?: ModelCustomerConditionInput | null,
};

export type DeleteCustomerMutation = {
  deleteCustomer?:  {
    __typename: "Customer",
    id: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateEmployeeMutationVariables = {
  input: CreateEmployeeInput,
  condition?: ModelEmployeeConditionInput | null,
};

export type CreateEmployeeMutation = {
  createEmployee?:  {
    __typename: "Employee",
    id: string,
    code: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    pin: string,
    roles: Array< string | null >,
    active: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateEmployeeMutationVariables = {
  input: UpdateEmployeeInput,
  condition?: ModelEmployeeConditionInput | null,
};

export type UpdateEmployeeMutation = {
  updateEmployee?:  {
    __typename: "Employee",
    id: string,
    code: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    pin: string,
    roles: Array< string | null >,
    active: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteEmployeeMutationVariables = {
  input: DeleteEmployeeInput,
  condition?: ModelEmployeeConditionInput | null,
};

export type DeleteEmployeeMutation = {
  deleteEmployee?:  {
    __typename: "Employee",
    id: string,
    code: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    pin: string,
    roles: Array< string | null >,
    active: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateOrderMutationVariables = {
  input: CreateOrderInput,
  condition?: ModelOrderConditionInput | null,
};

export type CreateOrderMutation = {
  createOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    orderDate: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    employeeId: string,
    employeeName: string,
    lines:  Array< {
      __typename: "OrderLine",
      identifier: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      barcode?: string | null,
      sku?: string | null,
      quantity: number,
      tax: number,
      price: number,
    } | null >,
    paymentInfo?:  {
      __typename: "PaymentInfo",
      employeeId: string,
      employeeName: string,
    } | null,
    refundInfo?:  {
      __typename: "RefundInfo",
      employeeId: string,
      employeeName: string,
      comments?: string | null,
    } | null,
    createdBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    updatedBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    Customer?:  {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderCustomerId?: string | null,
  } | null,
};

export type UpdateOrderMutationVariables = {
  input: UpdateOrderInput,
  condition?: ModelOrderConditionInput | null,
};

export type UpdateOrderMutation = {
  updateOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    orderDate: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    employeeId: string,
    employeeName: string,
    lines:  Array< {
      __typename: "OrderLine",
      identifier: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      barcode?: string | null,
      sku?: string | null,
      quantity: number,
      tax: number,
      price: number,
    } | null >,
    paymentInfo?:  {
      __typename: "PaymentInfo",
      employeeId: string,
      employeeName: string,
    } | null,
    refundInfo?:  {
      __typename: "RefundInfo",
      employeeId: string,
      employeeName: string,
      comments?: string | null,
    } | null,
    createdBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    updatedBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    Customer?:  {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderCustomerId?: string | null,
  } | null,
};

export type DeleteOrderMutationVariables = {
  input: DeleteOrderInput,
  condition?: ModelOrderConditionInput | null,
};

export type DeleteOrderMutation = {
  deleteOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    orderDate: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    employeeId: string,
    employeeName: string,
    lines:  Array< {
      __typename: "OrderLine",
      identifier: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      barcode?: string | null,
      sku?: string | null,
      quantity: number,
      tax: number,
      price: number,
    } | null >,
    paymentInfo?:  {
      __typename: "PaymentInfo",
      employeeId: string,
      employeeName: string,
    } | null,
    refundInfo?:  {
      __typename: "RefundInfo",
      employeeId: string,
      employeeName: string,
      comments?: string | null,
    } | null,
    createdBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    updatedBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    Customer?:  {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderCustomerId?: string | null,
  } | null,
};

export type CreateProductMutationVariables = {
  input: CreateProductInput,
  condition?: ModelProductConditionInput | null,
};

export type CreateProductMutation = {
  createProduct?:  {
    __typename: "Product",
    id: string,
    name: string,
    description?: string | null,
    price: number,
    tags?: string | null,
    cost?: number | null,
    barcode?: string | null,
    sku?: string | null,
    plu?: string | null,
    quantity: number,
    unitOfMeasure: string,
    trackStock: boolean,
    reorderPoint?: number | null,
    reorderQuantity?: number | null,
    picture?: string | null,
    Category?:  {
      __typename: "Category",
      id: string,
      name: string,
      description?: string | null,
      code?: string | null,
      color?: string | null,
      picture?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    Brand?:  {
      __typename: "Brand",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type UpdateProductMutationVariables = {
  input: UpdateProductInput,
  condition?: ModelProductConditionInput | null,
};

export type UpdateProductMutation = {
  updateProduct?:  {
    __typename: "Product",
    id: string,
    name: string,
    description?: string | null,
    price: number,
    tags?: string | null,
    cost?: number | null,
    barcode?: string | null,
    sku?: string | null,
    plu?: string | null,
    quantity: number,
    unitOfMeasure: string,
    trackStock: boolean,
    reorderPoint?: number | null,
    reorderQuantity?: number | null,
    picture?: string | null,
    Category?:  {
      __typename: "Category",
      id: string,
      name: string,
      description?: string | null,
      code?: string | null,
      color?: string | null,
      picture?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    Brand?:  {
      __typename: "Brand",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type DeleteProductMutationVariables = {
  input: DeleteProductInput,
  condition?: ModelProductConditionInput | null,
};

export type DeleteProductMutation = {
  deleteProduct?:  {
    __typename: "Product",
    id: string,
    name: string,
    description?: string | null,
    price: number,
    tags?: string | null,
    cost?: number | null,
    barcode?: string | null,
    sku?: string | null,
    plu?: string | null,
    quantity: number,
    unitOfMeasure: string,
    trackStock: boolean,
    reorderPoint?: number | null,
    reorderQuantity?: number | null,
    picture?: string | null,
    Category?:  {
      __typename: "Category",
      id: string,
      name: string,
      description?: string | null,
      code?: string | null,
      color?: string | null,
      picture?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    Brand?:  {
      __typename: "Brand",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type CreateUnitOfMeasureMutationVariables = {
  input: CreateUnitOfMeasureInput,
  condition?: ModelUnitOfMeasureConditionInput | null,
};

export type CreateUnitOfMeasureMutation = {
  createUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateUnitOfMeasureMutationVariables = {
  input: UpdateUnitOfMeasureInput,
  condition?: ModelUnitOfMeasureConditionInput | null,
};

export type UpdateUnitOfMeasureMutation = {
  updateUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteUnitOfMeasureMutationVariables = {
  input: DeleteUnitOfMeasureInput,
  condition?: ModelUnitOfMeasureConditionInput | null,
};

export type DeleteUnitOfMeasureMutation = {
  deleteUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateInventoryChangesMutationVariables = {
  input: CreateInventoryChangesInput,
  condition?: ModelInventoryChangesConditionInput | null,
};

export type CreateInventoryChangesMutation = {
  createInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      name: string,
      description?: string | null,
      price: number,
      tags?: string | null,
      cost?: number | null,
      barcode?: string | null,
      sku?: string | null,
      plu?: string | null,
      quantity: number,
      unitOfMeasure: string,
      trackStock: boolean,
      reorderPoint?: number | null,
      reorderQuantity?: number | null,
      picture?: string | null,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productBrandId?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryChangesProductId?: string | null,
  } | null,
};

export type UpdateInventoryChangesMutationVariables = {
  input: UpdateInventoryChangesInput,
  condition?: ModelInventoryChangesConditionInput | null,
};

export type UpdateInventoryChangesMutation = {
  updateInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      name: string,
      description?: string | null,
      price: number,
      tags?: string | null,
      cost?: number | null,
      barcode?: string | null,
      sku?: string | null,
      plu?: string | null,
      quantity: number,
      unitOfMeasure: string,
      trackStock: boolean,
      reorderPoint?: number | null,
      reorderQuantity?: number | null,
      picture?: string | null,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productBrandId?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryChangesProductId?: string | null,
  } | null,
};

export type DeleteInventoryChangesMutationVariables = {
  input: DeleteInventoryChangesInput,
  condition?: ModelInventoryChangesConditionInput | null,
};

export type DeleteInventoryChangesMutation = {
  deleteInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      name: string,
      description?: string | null,
      price: number,
      tags?: string | null,
      cost?: number | null,
      barcode?: string | null,
      sku?: string | null,
      plu?: string | null,
      quantity: number,
      unitOfMeasure: string,
      trackStock: boolean,
      reorderPoint?: number | null,
      reorderQuantity?: number | null,
      picture?: string | null,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productBrandId?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryChangesProductId?: string | null,
  } | null,
};

export type CreateInventoryCountMutationVariables = {
  input: CreateInventoryCountInput,
  condition?: ModelInventoryCountConditionInput | null,
};

export type CreateInventoryCountMutation = {
  createInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    comments?: string | null,
    status: InventoryCountStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateInventoryCountMutationVariables = {
  input: UpdateInventoryCountInput,
  condition?: ModelInventoryCountConditionInput | null,
};

export type UpdateInventoryCountMutation = {
  updateInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    comments?: string | null,
    status: InventoryCountStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteInventoryCountMutationVariables = {
  input: DeleteInventoryCountInput,
  condition?: ModelInventoryCountConditionInput | null,
};

export type DeleteInventoryCountMutation = {
  deleteInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    comments?: string | null,
    status: InventoryCountStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateInventoryCountLineMutationVariables = {
  input: CreateInventoryCountLineInput,
  condition?: ModelInventoryCountLineConditionInput | null,
};

export type CreateInventoryCountLineMutation = {
  createInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      comments?: string | null,
      status: InventoryCountStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryCountLineInventoryCountId?: string | null,
  } | null,
};

export type UpdateInventoryCountLineMutationVariables = {
  input: UpdateInventoryCountLineInput,
  condition?: ModelInventoryCountLineConditionInput | null,
};

export type UpdateInventoryCountLineMutation = {
  updateInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      comments?: string | null,
      status: InventoryCountStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryCountLineInventoryCountId?: string | null,
  } | null,
};

export type DeleteInventoryCountLineMutationVariables = {
  input: DeleteInventoryCountLineInput,
  condition?: ModelInventoryCountLineConditionInput | null,
};

export type DeleteInventoryCountLineMutation = {
  deleteInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      comments?: string | null,
      status: InventoryCountStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryCountLineInventoryCountId?: string | null,
  } | null,
};

export type CreateInventoryReceiveMutationVariables = {
  input: CreateInventoryReceiveInput,
  condition?: ModelInventoryReceiveConditionInput | null,
};

export type CreateInventoryReceiveMutation = {
  createInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    comments?: string | null,
    status: InventoryReceiveStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateInventoryReceiveMutationVariables = {
  input: UpdateInventoryReceiveInput,
  condition?: ModelInventoryReceiveConditionInput | null,
};

export type UpdateInventoryReceiveMutation = {
  updateInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    comments?: string | null,
    status: InventoryReceiveStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteInventoryReceiveMutationVariables = {
  input: DeleteInventoryReceiveInput,
  condition?: ModelInventoryReceiveConditionInput | null,
};

export type DeleteInventoryReceiveMutation = {
  deleteInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    comments?: string | null,
    status: InventoryReceiveStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateInventoryReceiveLineMutationVariables = {
  input: CreateInventoryReceiveLineInput,
  condition?: ModelInventoryReceiveLineConditionInput | null,
};

export type CreateInventoryReceiveLineMutation = {
  createInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      comments?: string | null,
      status: InventoryReceiveStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryReceiveLineInventoryReceiveId?: string | null,
  } | null,
};

export type UpdateInventoryReceiveLineMutationVariables = {
  input: UpdateInventoryReceiveLineInput,
  condition?: ModelInventoryReceiveLineConditionInput | null,
};

export type UpdateInventoryReceiveLineMutation = {
  updateInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      comments?: string | null,
      status: InventoryReceiveStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryReceiveLineInventoryReceiveId?: string | null,
  } | null,
};

export type DeleteInventoryReceiveLineMutationVariables = {
  input: DeleteInventoryReceiveLineInput,
  condition?: ModelInventoryReceiveLineConditionInput | null,
};

export type DeleteInventoryReceiveLineMutation = {
  deleteInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      comments?: string | null,
      status: InventoryReceiveStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryReceiveLineInventoryReceiveId?: string | null,
  } | null,
};

export type CreatePrinterMutationVariables = {
  input: CreatePrinterInput,
  condition?: ModelPrinterConditionInput | null,
};

export type CreatePrinterMutation = {
  createPrinter?:  {
    __typename: "Printer",
    id: string,
    deviceId: string,
    identifier: string,
    interfaceType: string,
    ip: string,
    model?: string | null,
    alias?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdatePrinterMutationVariables = {
  input: UpdatePrinterInput,
  condition?: ModelPrinterConditionInput | null,
};

export type UpdatePrinterMutation = {
  updatePrinter?:  {
    __typename: "Printer",
    id: string,
    deviceId: string,
    identifier: string,
    interfaceType: string,
    ip: string,
    model?: string | null,
    alias?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeletePrinterMutationVariables = {
  input: DeletePrinterInput,
  condition?: ModelPrinterConditionInput | null,
};

export type DeletePrinterMutation = {
  deletePrinter?:  {
    __typename: "Printer",
    id: string,
    deviceId: string,
    identifier: string,
    interfaceType: string,
    ip: string,
    model?: string | null,
    alias?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateStationMutationVariables = {
  input: CreateStationInput,
  condition?: ModelStationConditionInput | null,
};

export type CreateStationMutation = {
  createStation?:  {
    __typename: "Station",
    id: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateStationMutationVariables = {
  input: UpdateStationInput,
  condition?: ModelStationConditionInput | null,
};

export type UpdateStationMutation = {
  updateStation?:  {
    __typename: "Station",
    id: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteStationMutationVariables = {
  input: DeleteStationInput,
  condition?: ModelStationConditionInput | null,
};

export type DeleteStationMutation = {
  deleteStation?:  {
    __typename: "Station",
    id: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type GetSalesQueryVariables = {
  status: OrderStatus,
  from: string,
  to: string,
};

export type GetSalesQuery = {
  getSales?:  Array< {
    __typename: "Order",
    id: string,
    orderNo: string,
    orderDate: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    employeeId: string,
    employeeName: string,
    lines:  Array< {
      __typename: "OrderLine",
      identifier: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      barcode?: string | null,
      sku?: string | null,
      quantity: number,
      tax: number,
      price: number,
    } | null >,
    paymentInfo?:  {
      __typename: "PaymentInfo",
      employeeId: string,
      employeeName: string,
    } | null,
    refundInfo?:  {
      __typename: "RefundInfo",
      employeeId: string,
      employeeName: string,
      comments?: string | null,
    } | null,
    createdBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    updatedBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    Customer?:  {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderCustomerId?: string | null,
  } | null > | null,
};

export type GetSalesSummaryQueryVariables = {
  status: OrderStatus,
  from: string,
  to: string,
};

export type GetSalesSummaryQuery = {
  getSalesSummary?:  {
    __typename: "SalesSummary",
    products?:  Array< {
      __typename: "ProductSaleSummary",
      productId: string,
      productName: string,
      unitOfMeasure: string,
      quantity: number,
      amount: number,
    } | null > | null,
    employees?:  Array< {
      __typename: "EmployeeSaleSummary",
      employeeId: string,
      employeeName: string,
      orders: number,
      amount: number,
    } | null > | null,
    dates?:  Array< {
      __typename: "DatePartSaleSummary",
      datePart: string,
      orders: number,
      amount: number,
    } | null > | null,
    totalAmount: number,
    totalOrders: number,
  } | null,
};

export type GetStoreQueryVariables = {
  id: string,
};

export type GetStoreQuery = {
  getStore?:  {
    __typename: "Store",
    id: string,
    name: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string,
    fax?: string | null,
    email: string,
    disclaimer?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListStoresQueryVariables = {
  filter?: ModelStoreFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListStoresQuery = {
  listStores?:  {
    __typename: "ModelStoreConnection",
    items:  Array< {
      __typename: "Store",
      id: string,
      name: string,
      address: string,
      city: string,
      state: string,
      zipCode: string,
      country: string,
      phone: string,
      fax?: string | null,
      email: string,
      disclaimer?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncStoresQueryVariables = {
  filter?: ModelStoreFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncStoresQuery = {
  syncStores?:  {
    __typename: "ModelStoreConnection",
    items:  Array< {
      __typename: "Store",
      id: string,
      name: string,
      address: string,
      city: string,
      state: string,
      zipCode: string,
      country: string,
      phone: string,
      fax?: string | null,
      email: string,
      disclaimer?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetBrandQueryVariables = {
  id: string,
};

export type GetBrandQuery = {
  getBrand?:  {
    __typename: "Brand",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListBrandsQueryVariables = {
  filter?: ModelBrandFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListBrandsQuery = {
  listBrands?:  {
    __typename: "ModelBrandConnection",
    items:  Array< {
      __typename: "Brand",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncBrandsQueryVariables = {
  filter?: ModelBrandFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncBrandsQuery = {
  syncBrands?:  {
    __typename: "ModelBrandConnection",
    items:  Array< {
      __typename: "Brand",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetCategoryQueryVariables = {
  id: string,
};

export type GetCategoryQuery = {
  getCategory?:  {
    __typename: "Category",
    id: string,
    name: string,
    description?: string | null,
    code?: string | null,
    color?: string | null,
    picture?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListCategoriesQueryVariables = {
  filter?: ModelCategoryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCategoriesQuery = {
  listCategories?:  {
    __typename: "ModelCategoryConnection",
    items:  Array< {
      __typename: "Category",
      id: string,
      name: string,
      description?: string | null,
      code?: string | null,
      color?: string | null,
      picture?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncCategoriesQueryVariables = {
  filter?: ModelCategoryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncCategoriesQuery = {
  syncCategories?:  {
    __typename: "ModelCategoryConnection",
    items:  Array< {
      __typename: "Category",
      id: string,
      name: string,
      description?: string | null,
      code?: string | null,
      color?: string | null,
      picture?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetCustomerQueryVariables = {
  id: string,
};

export type GetCustomerQuery = {
  getCustomer?:  {
    __typename: "Customer",
    id: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListCustomersQueryVariables = {
  filter?: ModelCustomerFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCustomersQuery = {
  listCustomers?:  {
    __typename: "ModelCustomerConnection",
    items:  Array< {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncCustomersQueryVariables = {
  filter?: ModelCustomerFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncCustomersQuery = {
  syncCustomers?:  {
    __typename: "ModelCustomerConnection",
    items:  Array< {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetEmployeeQueryVariables = {
  id: string,
};

export type GetEmployeeQuery = {
  getEmployee?:  {
    __typename: "Employee",
    id: string,
    code: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    pin: string,
    roles: Array< string | null >,
    active: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListEmployeesQueryVariables = {
  filter?: ModelEmployeeFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListEmployeesQuery = {
  listEmployees?:  {
    __typename: "ModelEmployeeConnection",
    items:  Array< {
      __typename: "Employee",
      id: string,
      code: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      pin: string,
      roles: Array< string | null >,
      active: boolean,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncEmployeesQueryVariables = {
  filter?: ModelEmployeeFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncEmployeesQuery = {
  syncEmployees?:  {
    __typename: "ModelEmployeeConnection",
    items:  Array< {
      __typename: "Employee",
      id: string,
      code: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      pin: string,
      roles: Array< string | null >,
      active: boolean,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetOrderQueryVariables = {
  id: string,
};

export type GetOrderQuery = {
  getOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    orderDate: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    employeeId: string,
    employeeName: string,
    lines:  Array< {
      __typename: "OrderLine",
      identifier: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      barcode?: string | null,
      sku?: string | null,
      quantity: number,
      tax: number,
      price: number,
    } | null >,
    paymentInfo?:  {
      __typename: "PaymentInfo",
      employeeId: string,
      employeeName: string,
    } | null,
    refundInfo?:  {
      __typename: "RefundInfo",
      employeeId: string,
      employeeName: string,
      comments?: string | null,
    } | null,
    createdBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    updatedBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    Customer?:  {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderCustomerId?: string | null,
  } | null,
};

export type ListOrdersQueryVariables = {
  filter?: ModelOrderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListOrdersQuery = {
  listOrders?:  {
    __typename: "ModelOrderConnection",
    items:  Array< {
      __typename: "Order",
      id: string,
      orderNo: string,
      orderDate: string,
      subtotal: number,
      tax: number,
      total: number,
      status: OrderStatus,
      employeeId: string,
      employeeName: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      orderCustomerId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncOrdersQueryVariables = {
  filter?: ModelOrderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncOrdersQuery = {
  syncOrders?:  {
    __typename: "ModelOrderConnection",
    items:  Array< {
      __typename: "Order",
      id: string,
      orderNo: string,
      orderDate: string,
      subtotal: number,
      tax: number,
      total: number,
      status: OrderStatus,
      employeeId: string,
      employeeName: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      orderCustomerId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetProductQueryVariables = {
  id: string,
};

export type GetProductQuery = {
  getProduct?:  {
    __typename: "Product",
    id: string,
    name: string,
    description?: string | null,
    price: number,
    tags?: string | null,
    cost?: number | null,
    barcode?: string | null,
    sku?: string | null,
    plu?: string | null,
    quantity: number,
    unitOfMeasure: string,
    trackStock: boolean,
    reorderPoint?: number | null,
    reorderQuantity?: number | null,
    picture?: string | null,
    Category?:  {
      __typename: "Category",
      id: string,
      name: string,
      description?: string | null,
      code?: string | null,
      color?: string | null,
      picture?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    Brand?:  {
      __typename: "Brand",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type ListProductsQueryVariables = {
  filter?: ModelProductFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListProductsQuery = {
  listProducts?:  {
    __typename: "ModelProductConnection",
    items:  Array< {
      __typename: "Product",
      id: string,
      name: string,
      description?: string | null,
      price: number,
      tags?: string | null,
      cost?: number | null,
      barcode?: string | null,
      sku?: string | null,
      plu?: string | null,
      quantity: number,
      unitOfMeasure: string,
      trackStock: boolean,
      reorderPoint?: number | null,
      reorderQuantity?: number | null,
      picture?: string | null,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productBrandId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncProductsQueryVariables = {
  filter?: ModelProductFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncProductsQuery = {
  syncProducts?:  {
    __typename: "ModelProductConnection",
    items:  Array< {
      __typename: "Product",
      id: string,
      name: string,
      description?: string | null,
      price: number,
      tags?: string | null,
      cost?: number | null,
      barcode?: string | null,
      sku?: string | null,
      plu?: string | null,
      quantity: number,
      unitOfMeasure: string,
      trackStock: boolean,
      reorderPoint?: number | null,
      reorderQuantity?: number | null,
      picture?: string | null,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productBrandId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetUnitOfMeasureQueryVariables = {
  id: string,
};

export type GetUnitOfMeasureQuery = {
  getUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListUnitOfMeasuresQueryVariables = {
  filter?: ModelUnitOfMeasureFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUnitOfMeasuresQuery = {
  listUnitOfMeasures?:  {
    __typename: "ModelUnitOfMeasureConnection",
    items:  Array< {
      __typename: "UnitOfMeasure",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncUnitOfMeasuresQueryVariables = {
  filter?: ModelUnitOfMeasureFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncUnitOfMeasuresQuery = {
  syncUnitOfMeasures?:  {
    __typename: "ModelUnitOfMeasureConnection",
    items:  Array< {
      __typename: "UnitOfMeasure",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetInventoryChangesQueryVariables = {
  id: string,
};

export type GetInventoryChangesQuery = {
  getInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      name: string,
      description?: string | null,
      price: number,
      tags?: string | null,
      cost?: number | null,
      barcode?: string | null,
      sku?: string | null,
      plu?: string | null,
      quantity: number,
      unitOfMeasure: string,
      trackStock: boolean,
      reorderPoint?: number | null,
      reorderQuantity?: number | null,
      picture?: string | null,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productBrandId?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryChangesProductId?: string | null,
  } | null,
};

export type ListInventoryChangesQueryVariables = {
  filter?: ModelInventoryChangesFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListInventoryChangesQuery = {
  listInventoryChanges?:  {
    __typename: "ModelInventoryChangesConnection",
    items:  Array< {
      __typename: "InventoryChanges",
      id: string,
      timestamp: string,
      type: string,
      typeId?: string | null,
      quantityIn: number,
      quantityOut: number,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      inventoryChangesProductId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncInventoryChangesQueryVariables = {
  filter?: ModelInventoryChangesFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncInventoryChangesQuery = {
  syncInventoryChanges?:  {
    __typename: "ModelInventoryChangesConnection",
    items:  Array< {
      __typename: "InventoryChanges",
      id: string,
      timestamp: string,
      type: string,
      typeId?: string | null,
      quantityIn: number,
      quantityOut: number,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      inventoryChangesProductId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetInventoryCountQueryVariables = {
  id: string,
};

export type GetInventoryCountQuery = {
  getInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    comments?: string | null,
    status: InventoryCountStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListInventoryCountsQueryVariables = {
  filter?: ModelInventoryCountFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListInventoryCountsQuery = {
  listInventoryCounts?:  {
    __typename: "ModelInventoryCountConnection",
    items:  Array< {
      __typename: "InventoryCount",
      id: string,
      comments?: string | null,
      status: InventoryCountStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncInventoryCountsQueryVariables = {
  filter?: ModelInventoryCountFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncInventoryCountsQuery = {
  syncInventoryCounts?:  {
    __typename: "ModelInventoryCountConnection",
    items:  Array< {
      __typename: "InventoryCount",
      id: string,
      comments?: string | null,
      status: InventoryCountStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetInventoryCountLineQueryVariables = {
  id: string,
};

export type GetInventoryCountLineQuery = {
  getInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      comments?: string | null,
      status: InventoryCountStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryCountLineInventoryCountId?: string | null,
  } | null,
};

export type ListInventoryCountLinesQueryVariables = {
  filter?: ModelInventoryCountLineFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListInventoryCountLinesQuery = {
  listInventoryCountLines?:  {
    __typename: "ModelInventoryCountLineConnection",
    items:  Array< {
      __typename: "InventoryCountLine",
      id: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      current: number,
      newCount: number,
      comments?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      inventoryCountLineInventoryCountId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncInventoryCountLinesQueryVariables = {
  filter?: ModelInventoryCountLineFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncInventoryCountLinesQuery = {
  syncInventoryCountLines?:  {
    __typename: "ModelInventoryCountLineConnection",
    items:  Array< {
      __typename: "InventoryCountLine",
      id: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      current: number,
      newCount: number,
      comments?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      inventoryCountLineInventoryCountId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetInventoryReceiveQueryVariables = {
  id: string,
};

export type GetInventoryReceiveQuery = {
  getInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    comments?: string | null,
    status: InventoryReceiveStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListInventoryReceivesQueryVariables = {
  filter?: ModelInventoryReceiveFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListInventoryReceivesQuery = {
  listInventoryReceives?:  {
    __typename: "ModelInventoryReceiveConnection",
    items:  Array< {
      __typename: "InventoryReceive",
      id: string,
      comments?: string | null,
      status: InventoryReceiveStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncInventoryReceivesQueryVariables = {
  filter?: ModelInventoryReceiveFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncInventoryReceivesQuery = {
  syncInventoryReceives?:  {
    __typename: "ModelInventoryReceiveConnection",
    items:  Array< {
      __typename: "InventoryReceive",
      id: string,
      comments?: string | null,
      status: InventoryReceiveStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetInventoryReceiveLineQueryVariables = {
  id: string,
};

export type GetInventoryReceiveLineQuery = {
  getInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      comments?: string | null,
      status: InventoryReceiveStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryReceiveLineInventoryReceiveId?: string | null,
  } | null,
};

export type ListInventoryReceiveLinesQueryVariables = {
  filter?: ModelInventoryReceiveLineFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListInventoryReceiveLinesQuery = {
  listInventoryReceiveLines?:  {
    __typename: "ModelInventoryReceiveLineConnection",
    items:  Array< {
      __typename: "InventoryReceiveLine",
      id: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      received: number,
      comments?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      inventoryReceiveLineInventoryReceiveId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncInventoryReceiveLinesQueryVariables = {
  filter?: ModelInventoryReceiveLineFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncInventoryReceiveLinesQuery = {
  syncInventoryReceiveLines?:  {
    __typename: "ModelInventoryReceiveLineConnection",
    items:  Array< {
      __typename: "InventoryReceiveLine",
      id: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      received: number,
      comments?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      inventoryReceiveLineInventoryReceiveId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetPrinterQueryVariables = {
  id: string,
};

export type GetPrinterQuery = {
  getPrinter?:  {
    __typename: "Printer",
    id: string,
    deviceId: string,
    identifier: string,
    interfaceType: string,
    ip: string,
    model?: string | null,
    alias?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListPrintersQueryVariables = {
  filter?: ModelPrinterFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPrintersQuery = {
  listPrinters?:  {
    __typename: "ModelPrinterConnection",
    items:  Array< {
      __typename: "Printer",
      id: string,
      deviceId: string,
      identifier: string,
      interfaceType: string,
      ip: string,
      model?: string | null,
      alias?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncPrintersQueryVariables = {
  filter?: ModelPrinterFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncPrintersQuery = {
  syncPrinters?:  {
    __typename: "ModelPrinterConnection",
    items:  Array< {
      __typename: "Printer",
      id: string,
      deviceId: string,
      identifier: string,
      interfaceType: string,
      ip: string,
      model?: string | null,
      alias?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetStationQueryVariables = {
  id: string,
};

export type GetStationQuery = {
  getStation?:  {
    __typename: "Station",
    id: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListStationsQueryVariables = {
  filter?: ModelStationFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListStationsQuery = {
  listStations?:  {
    __typename: "ModelStationConnection",
    items:  Array< {
      __typename: "Station",
      id: string,
      deviceId: string,
      alias: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncStationsQueryVariables = {
  filter?: ModelStationFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncStationsQuery = {
  syncStations?:  {
    __typename: "ModelStationConnection",
    items:  Array< {
      __typename: "Station",
      id: string,
      deviceId: string,
      alias: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type OnCreateStoreSubscription = {
  onCreateStore?:  {
    __typename: "Store",
    id: string,
    name: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string,
    fax?: string | null,
    email: string,
    disclaimer?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateStoreSubscription = {
  onUpdateStore?:  {
    __typename: "Store",
    id: string,
    name: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string,
    fax?: string | null,
    email: string,
    disclaimer?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteStoreSubscription = {
  onDeleteStore?:  {
    __typename: "Store",
    id: string,
    name: string,
    address: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string,
    fax?: string | null,
    email: string,
    disclaimer?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateBrandSubscription = {
  onCreateBrand?:  {
    __typename: "Brand",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateBrandSubscription = {
  onUpdateBrand?:  {
    __typename: "Brand",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteBrandSubscription = {
  onDeleteBrand?:  {
    __typename: "Brand",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateCategorySubscription = {
  onCreateCategory?:  {
    __typename: "Category",
    id: string,
    name: string,
    description?: string | null,
    code?: string | null,
    color?: string | null,
    picture?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateCategorySubscription = {
  onUpdateCategory?:  {
    __typename: "Category",
    id: string,
    name: string,
    description?: string | null,
    code?: string | null,
    color?: string | null,
    picture?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteCategorySubscription = {
  onDeleteCategory?:  {
    __typename: "Category",
    id: string,
    name: string,
    description?: string | null,
    code?: string | null,
    color?: string | null,
    picture?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateCustomerSubscription = {
  onCreateCustomer?:  {
    __typename: "Customer",
    id: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateCustomerSubscription = {
  onUpdateCustomer?:  {
    __typename: "Customer",
    id: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteCustomerSubscription = {
  onDeleteCustomer?:  {
    __typename: "Customer",
    id: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateEmployeeSubscription = {
  onCreateEmployee?:  {
    __typename: "Employee",
    id: string,
    code: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    pin: string,
    roles: Array< string | null >,
    active: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateEmployeeSubscription = {
  onUpdateEmployee?:  {
    __typename: "Employee",
    id: string,
    code: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    pin: string,
    roles: Array< string | null >,
    active: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteEmployeeSubscription = {
  onDeleteEmployee?:  {
    __typename: "Employee",
    id: string,
    code: string,
    firstName: string,
    lastName?: string | null,
    middleName?: string | null,
    dob?: string | null,
    phone?: string | null,
    email?: string | null,
    pin: string,
    roles: Array< string | null >,
    active: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateOrderSubscription = {
  onCreateOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    orderDate: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    employeeId: string,
    employeeName: string,
    lines:  Array< {
      __typename: "OrderLine",
      identifier: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      barcode?: string | null,
      sku?: string | null,
      quantity: number,
      tax: number,
      price: number,
    } | null >,
    paymentInfo?:  {
      __typename: "PaymentInfo",
      employeeId: string,
      employeeName: string,
    } | null,
    refundInfo?:  {
      __typename: "RefundInfo",
      employeeId: string,
      employeeName: string,
      comments?: string | null,
    } | null,
    createdBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    updatedBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    Customer?:  {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderCustomerId?: string | null,
  } | null,
};

export type OnUpdateOrderSubscription = {
  onUpdateOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    orderDate: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    employeeId: string,
    employeeName: string,
    lines:  Array< {
      __typename: "OrderLine",
      identifier: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      barcode?: string | null,
      sku?: string | null,
      quantity: number,
      tax: number,
      price: number,
    } | null >,
    paymentInfo?:  {
      __typename: "PaymentInfo",
      employeeId: string,
      employeeName: string,
    } | null,
    refundInfo?:  {
      __typename: "RefundInfo",
      employeeId: string,
      employeeName: string,
      comments?: string | null,
    } | null,
    createdBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    updatedBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    Customer?:  {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderCustomerId?: string | null,
  } | null,
};

export type OnDeleteOrderSubscription = {
  onDeleteOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    orderDate: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    employeeId: string,
    employeeName: string,
    lines:  Array< {
      __typename: "OrderLine",
      identifier: string,
      productId: string,
      productName: string,
      unitOfMeasure: string,
      barcode?: string | null,
      sku?: string | null,
      quantity: number,
      tax: number,
      price: number,
    } | null >,
    paymentInfo?:  {
      __typename: "PaymentInfo",
      employeeId: string,
      employeeName: string,
    } | null,
    refundInfo?:  {
      __typename: "RefundInfo",
      employeeId: string,
      employeeName: string,
      comments?: string | null,
    } | null,
    createdBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    updatedBy?:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    } | null,
    Customer?:  {
      __typename: "Customer",
      id: string,
      firstName: string,
      lastName?: string | null,
      middleName?: string | null,
      dob?: string | null,
      phone?: string | null,
      email?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderCustomerId?: string | null,
  } | null,
};

export type OnCreateProductSubscription = {
  onCreateProduct?:  {
    __typename: "Product",
    id: string,
    name: string,
    description?: string | null,
    price: number,
    tags?: string | null,
    cost?: number | null,
    barcode?: string | null,
    sku?: string | null,
    plu?: string | null,
    quantity: number,
    unitOfMeasure: string,
    trackStock: boolean,
    reorderPoint?: number | null,
    reorderQuantity?: number | null,
    picture?: string | null,
    Category?:  {
      __typename: "Category",
      id: string,
      name: string,
      description?: string | null,
      code?: string | null,
      color?: string | null,
      picture?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    Brand?:  {
      __typename: "Brand",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type OnUpdateProductSubscription = {
  onUpdateProduct?:  {
    __typename: "Product",
    id: string,
    name: string,
    description?: string | null,
    price: number,
    tags?: string | null,
    cost?: number | null,
    barcode?: string | null,
    sku?: string | null,
    plu?: string | null,
    quantity: number,
    unitOfMeasure: string,
    trackStock: boolean,
    reorderPoint?: number | null,
    reorderQuantity?: number | null,
    picture?: string | null,
    Category?:  {
      __typename: "Category",
      id: string,
      name: string,
      description?: string | null,
      code?: string | null,
      color?: string | null,
      picture?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    Brand?:  {
      __typename: "Brand",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type OnDeleteProductSubscription = {
  onDeleteProduct?:  {
    __typename: "Product",
    id: string,
    name: string,
    description?: string | null,
    price: number,
    tags?: string | null,
    cost?: number | null,
    barcode?: string | null,
    sku?: string | null,
    plu?: string | null,
    quantity: number,
    unitOfMeasure: string,
    trackStock: boolean,
    reorderPoint?: number | null,
    reorderQuantity?: number | null,
    picture?: string | null,
    Category?:  {
      __typename: "Category",
      id: string,
      name: string,
      description?: string | null,
      code?: string | null,
      color?: string | null,
      picture?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    Brand?:  {
      __typename: "Brand",
      id: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type OnCreateUnitOfMeasureSubscription = {
  onCreateUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateUnitOfMeasureSubscription = {
  onUpdateUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteUnitOfMeasureSubscription = {
  onDeleteUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateInventoryChangesSubscription = {
  onCreateInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      name: string,
      description?: string | null,
      price: number,
      tags?: string | null,
      cost?: number | null,
      barcode?: string | null,
      sku?: string | null,
      plu?: string | null,
      quantity: number,
      unitOfMeasure: string,
      trackStock: boolean,
      reorderPoint?: number | null,
      reorderQuantity?: number | null,
      picture?: string | null,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productBrandId?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryChangesProductId?: string | null,
  } | null,
};

export type OnUpdateInventoryChangesSubscription = {
  onUpdateInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      name: string,
      description?: string | null,
      price: number,
      tags?: string | null,
      cost?: number | null,
      barcode?: string | null,
      sku?: string | null,
      plu?: string | null,
      quantity: number,
      unitOfMeasure: string,
      trackStock: boolean,
      reorderPoint?: number | null,
      reorderQuantity?: number | null,
      picture?: string | null,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productBrandId?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryChangesProductId?: string | null,
  } | null,
};

export type OnDeleteInventoryChangesSubscription = {
  onDeleteInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      name: string,
      description?: string | null,
      price: number,
      tags?: string | null,
      cost?: number | null,
      barcode?: string | null,
      sku?: string | null,
      plu?: string | null,
      quantity: number,
      unitOfMeasure: string,
      trackStock: boolean,
      reorderPoint?: number | null,
      reorderQuantity?: number | null,
      picture?: string | null,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productBrandId?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryChangesProductId?: string | null,
  } | null,
};

export type OnCreateInventoryCountSubscription = {
  onCreateInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    comments?: string | null,
    status: InventoryCountStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateInventoryCountSubscription = {
  onUpdateInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    comments?: string | null,
    status: InventoryCountStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteInventoryCountSubscription = {
  onDeleteInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    comments?: string | null,
    status: InventoryCountStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateInventoryCountLineSubscription = {
  onCreateInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      comments?: string | null,
      status: InventoryCountStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryCountLineInventoryCountId?: string | null,
  } | null,
};

export type OnUpdateInventoryCountLineSubscription = {
  onUpdateInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      comments?: string | null,
      status: InventoryCountStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryCountLineInventoryCountId?: string | null,
  } | null,
};

export type OnDeleteInventoryCountLineSubscription = {
  onDeleteInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      comments?: string | null,
      status: InventoryCountStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryCountLineInventoryCountId?: string | null,
  } | null,
};

export type OnCreateInventoryReceiveSubscription = {
  onCreateInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    comments?: string | null,
    status: InventoryReceiveStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateInventoryReceiveSubscription = {
  onUpdateInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    comments?: string | null,
    status: InventoryReceiveStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteInventoryReceiveSubscription = {
  onDeleteInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    comments?: string | null,
    status: InventoryReceiveStatus,
    createdBy:  {
      __typename: "ByEmployee",
      id: string,
      name: string,
    },
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateInventoryReceiveLineSubscription = {
  onCreateInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      comments?: string | null,
      status: InventoryReceiveStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryReceiveLineInventoryReceiveId?: string | null,
  } | null,
};

export type OnUpdateInventoryReceiveLineSubscription = {
  onUpdateInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      comments?: string | null,
      status: InventoryReceiveStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryReceiveLineInventoryReceiveId?: string | null,
  } | null,
};

export type OnDeleteInventoryReceiveLineSubscription = {
  onDeleteInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      comments?: string | null,
      status: InventoryReceiveStatus,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    inventoryReceiveLineInventoryReceiveId?: string | null,
  } | null,
};

export type OnCreatePrinterSubscription = {
  onCreatePrinter?:  {
    __typename: "Printer",
    id: string,
    deviceId: string,
    identifier: string,
    interfaceType: string,
    ip: string,
    model?: string | null,
    alias?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdatePrinterSubscription = {
  onUpdatePrinter?:  {
    __typename: "Printer",
    id: string,
    deviceId: string,
    identifier: string,
    interfaceType: string,
    ip: string,
    model?: string | null,
    alias?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeletePrinterSubscription = {
  onDeletePrinter?:  {
    __typename: "Printer",
    id: string,
    deviceId: string,
    identifier: string,
    interfaceType: string,
    ip: string,
    model?: string | null,
    alias?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateStationSubscription = {
  onCreateStation?:  {
    __typename: "Station",
    id: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateStationSubscription = {
  onUpdateStation?:  {
    __typename: "Station",
    id: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteStationSubscription = {
  onDeleteStation?:  {
    __typename: "Station",
    id: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};
