/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTenantInput = {
  id?: string | null,
  name: string,
  slug: string,
  ownerUserId: string,
  _version?: number | null,
};

export type ModelTenantConditionInput = {
  name?: ModelStringInput | null,
  slug?: ModelStringInput | null,
  ownerUserId?: ModelStringInput | null,
  and?: Array< ModelTenantConditionInput | null > | null,
  or?: Array< ModelTenantConditionInput | null > | null,
  not?: ModelTenantConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
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

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Tenant = {
  __typename: "Tenant",
  id: string,
  name: string,
  slug: string,
  ownerUserId: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateTenantInput = {
  id: string,
  name?: string | null,
  slug?: string | null,
  ownerUserId?: string | null,
  _version?: number | null,
};

export type DeleteTenantInput = {
  id: string,
  _version?: number | null,
};

export type CreateTenantUserInput = {
  id?: string | null,
  tenantId: string,
  userId: string,
  role: TenantUserRole,
  _version?: number | null,
};

export enum TenantUserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
}


export type ModelTenantUserConditionInput = {
  tenantId?: ModelIDInput | null,
  userId?: ModelStringInput | null,
  role?: ModelTenantUserRoleInput | null,
  and?: Array< ModelTenantUserConditionInput | null > | null,
  or?: Array< ModelTenantUserConditionInput | null > | null,
  not?: ModelTenantUserConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
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

export type ModelTenantUserRoleInput = {
  eq?: TenantUserRole | null,
  ne?: TenantUserRole | null,
};

export type TenantUser = {
  __typename: "TenantUser",
  id: string,
  tenantId: string,
  userId: string,
  role: TenantUserRole,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateTenantUserInput = {
  id: string,
  tenantId?: string | null,
  userId?: string | null,
  role?: TenantUserRole | null,
  _version?: number | null,
};

export type DeleteTenantUserInput = {
  id: string,
  _version?: number | null,
};

export type CreateStoreInput = {
  id?: string | null,
  tenantId: string,
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
  tenantId?: ModelIDInput | null,
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
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Store = {
  __typename: "Store",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
  name: string,
  description?: string | null,
  _version?: number | null,
};

export type ModelBrandConditionInput = {
  tenantId?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelBrandConditionInput | null > | null,
  or?: Array< ModelBrandConditionInput | null > | null,
  not?: ModelBrandConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Brand = {
  __typename: "Brand",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
  name: string,
  description?: string | null,
  code?: string | null,
  color?: string | null,
  picture?: string | null,
  _version?: number | null,
};

export type ModelCategoryConditionInput = {
  tenantId?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  code?: ModelStringInput | null,
  color?: ModelStringInput | null,
  picture?: ModelStringInput | null,
  and?: Array< ModelCategoryConditionInput | null > | null,
  or?: Array< ModelCategoryConditionInput | null > | null,
  not?: ModelCategoryConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Category = {
  __typename: "Category",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
  firstName: string,
  lastName?: string | null,
  middleName?: string | null,
  dob?: string | null,
  phone?: string | null,
  email?: string | null,
  _version?: number | null,
};

export type ModelCustomerConditionInput = {
  tenantId?: ModelIDInput | null,
  firstName?: ModelStringInput | null,
  lastName?: ModelStringInput | null,
  middleName?: ModelStringInput | null,
  dob?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  email?: ModelStringInput | null,
  and?: Array< ModelCustomerConditionInput | null > | null,
  or?: Array< ModelCustomerConditionInput | null > | null,
  not?: ModelCustomerConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Customer = {
  __typename: "Customer",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
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
  tenantId?: ModelIDInput | null,
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
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Employee = {
  __typename: "Employee",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
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
  isEBTEligible?: boolean | null,
  ebtPaidAmount?: number | null,
  nonEbtPaidAmount?: number | null,
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
  EBT = "EBT",
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
  tenantId?: ModelIDInput | null,
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
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
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

export type Order = {
  __typename: "Order",
  id: string,
  tenantId: string,
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
  isEBTEligible?: boolean | null,
  ebtPaidAmount?: number | null,
  nonEbtPaidAmount?: number | null,
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
  tenantId?: string | null,
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
  tenantId: string,
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
  isActive: boolean,
  isEBTEligible?: boolean | null,
  _version?: number | null,
  productCategoryId?: string | null,
  productBrandId?: string | null,
};

export type ModelProductConditionInput = {
  tenantId?: ModelIDInput | null,
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
  isEBTEligible?: ModelBooleanInput | null,
  and?: Array< ModelProductConditionInput | null > | null,
  or?: Array< ModelProductConditionInput | null > | null,
  not?: ModelProductConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  productCategoryId?: ModelIDInput | null,
  productBrandId?: ModelIDInput | null,
};

export type Product = {
  __typename: "Product",
  id: string,
  tenantId: string,
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
  isActive: boolean,
  isEBTEligible?: boolean | null,
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
  tenantId?: string | null,
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
  isEBTEligible?: boolean | null,
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
  tenantId: string,
  name: string,
  description?: string | null,
  _version?: number | null,
};

export type ModelUnitOfMeasureConditionInput = {
  tenantId?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelUnitOfMeasureConditionInput | null > | null,
  or?: Array< ModelUnitOfMeasureConditionInput | null > | null,
  not?: ModelUnitOfMeasureConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type UnitOfMeasure = {
  __typename: "UnitOfMeasure",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
  timestamp: string,
  type: string,
  typeId?: string | null,
  quantityIn: number,
  quantityOut: number,
  _version?: number | null,
  inventoryChangesProductId?: string | null,
};

export type ModelInventoryChangesConditionInput = {
  tenantId?: ModelIDInput | null,
  timestamp?: ModelStringInput | null,
  type?: ModelStringInput | null,
  typeId?: ModelStringInput | null,
  quantityIn?: ModelIntInput | null,
  quantityOut?: ModelIntInput | null,
  and?: Array< ModelInventoryChangesConditionInput | null > | null,
  or?: Array< ModelInventoryChangesConditionInput | null > | null,
  not?: ModelInventoryChangesConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
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
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
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
  tenantId?: ModelIDInput | null,
  comments?: ModelStringInput | null,
  status?: ModelInventoryCountStatusInput | null,
  and?: Array< ModelInventoryCountConditionInput | null > | null,
  or?: Array< ModelInventoryCountConditionInput | null > | null,
  not?: ModelInventoryCountConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelInventoryCountStatusInput = {
  eq?: InventoryCountStatus | null,
  ne?: InventoryCountStatus | null,
};

export type InventoryCount = {
  __typename: "InventoryCount",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
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
  tenantId?: ModelIDInput | null,
  productId?: ModelStringInput | null,
  productName?: ModelStringInput | null,
  unitOfMeasure?: ModelStringInput | null,
  current?: ModelFloatInput | null,
  newCount?: ModelFloatInput | null,
  comments?: ModelStringInput | null,
  and?: Array< ModelInventoryCountLineConditionInput | null > | null,
  or?: Array< ModelInventoryCountLineConditionInput | null > | null,
  not?: ModelInventoryCountLineConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  inventoryCountLineInventoryCountId?: ModelIDInput | null,
};

export type InventoryCountLine = {
  __typename: "InventoryCountLine",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
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
  tenantId?: ModelIDInput | null,
  comments?: ModelStringInput | null,
  status?: ModelInventoryReceiveStatusInput | null,
  and?: Array< ModelInventoryReceiveConditionInput | null > | null,
  or?: Array< ModelInventoryReceiveConditionInput | null > | null,
  not?: ModelInventoryReceiveConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelInventoryReceiveStatusInput = {
  eq?: InventoryReceiveStatus | null,
  ne?: InventoryReceiveStatus | null,
};

export type InventoryReceive = {
  __typename: "InventoryReceive",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
  productId: string,
  productName: string,
  unitOfMeasure: string,
  received: number,
  comments?: string | null,
  _version?: number | null,
  inventoryReceiveLineInventoryReceiveId?: string | null,
};

export type ModelInventoryReceiveLineConditionInput = {
  tenantId?: ModelIDInput | null,
  productId?: ModelStringInput | null,
  productName?: ModelStringInput | null,
  unitOfMeasure?: ModelStringInput | null,
  received?: ModelFloatInput | null,
  comments?: ModelStringInput | null,
  and?: Array< ModelInventoryReceiveLineConditionInput | null > | null,
  or?: Array< ModelInventoryReceiveLineConditionInput | null > | null,
  not?: ModelInventoryReceiveLineConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  inventoryReceiveLineInventoryReceiveId?: ModelIDInput | null,
};

export type InventoryReceiveLine = {
  __typename: "InventoryReceiveLine",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
  deviceId: string,
  identifier: string,
  interfaceType: string,
  ip: string,
  model?: string | null,
  alias?: string | null,
  _version?: number | null,
};

export type ModelPrinterConditionInput = {
  tenantId?: ModelIDInput | null,
  deviceId?: ModelStringInput | null,
  identifier?: ModelStringInput | null,
  interfaceType?: ModelStringInput | null,
  ip?: ModelStringInput | null,
  model?: ModelStringInput | null,
  alias?: ModelStringInput | null,
  and?: Array< ModelPrinterConditionInput | null > | null,
  or?: Array< ModelPrinterConditionInput | null > | null,
  not?: ModelPrinterConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Printer = {
  __typename: "Printer",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
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
  tenantId: string,
  deviceId: string,
  alias: string,
  _version?: number | null,
};

export type ModelStationConditionInput = {
  tenantId?: ModelIDInput | null,
  deviceId?: ModelStringInput | null,
  alias?: ModelStringInput | null,
  and?: Array< ModelStationConditionInput | null > | null,
  or?: Array< ModelStationConditionInput | null > | null,
  not?: ModelStationConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type Station = {
  __typename: "Station",
  id: string,
  tenantId: string,
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
  tenantId?: string | null,
  deviceId?: string | null,
  alias?: string | null,
  _version?: number | null,
};

export type DeleteStationInput = {
  id: string,
  _version?: number | null,
};

export type CreateGlobalSettingsInput = {
  id?: string | null,
  tenantId: string,
  enforceSalesBasedOnInventory: boolean,
  _version?: number | null,
};

export type ModelGlobalSettingsConditionInput = {
  tenantId?: ModelIDInput | null,
  enforceSalesBasedOnInventory?: ModelBooleanInput | null,
  and?: Array< ModelGlobalSettingsConditionInput | null > | null,
  or?: Array< ModelGlobalSettingsConditionInput | null > | null,
  not?: ModelGlobalSettingsConditionInput | null,
  _deleted?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type GlobalSettings = {
  __typename: "GlobalSettings",
  id: string,
  tenantId: string,
  enforceSalesBasedOnInventory: boolean,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateGlobalSettingsInput = {
  id: string,
  tenantId?: string | null,
  enforceSalesBasedOnInventory?: boolean | null,
  _version?: number | null,
};

export type DeleteGlobalSettingsInput = {
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

export type ModelTenantFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  slug?: ModelStringInput | null,
  ownerUserId?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelTenantFilterInput | null > | null,
  or?: Array< ModelTenantFilterInput | null > | null,
  not?: ModelTenantFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelTenantConnection = {
  __typename: "ModelTenantConnection",
  items:  Array<Tenant | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelTenantUserFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  userId?: ModelStringInput | null,
  role?: ModelTenantUserRoleInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelTenantUserFilterInput | null > | null,
  or?: Array< ModelTenantUserFilterInput | null > | null,
  not?: ModelTenantUserFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelTenantUserConnection = {
  __typename: "ModelTenantUserConnection",
  items:  Array<TenantUser | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelStoreFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
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
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelStoreFilterInput | null > | null,
  or?: Array< ModelStoreFilterInput | null > | null,
  not?: ModelStoreFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelStoreConnection = {
  __typename: "ModelStoreConnection",
  items:  Array<Store | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelBrandFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelBrandFilterInput | null > | null,
  or?: Array< ModelBrandFilterInput | null > | null,
  not?: ModelBrandFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelBrandConnection = {
  __typename: "ModelBrandConnection",
  items:  Array<Brand | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelCategoryFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  code?: ModelStringInput | null,
  color?: ModelStringInput | null,
  picture?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelCategoryFilterInput | null > | null,
  or?: Array< ModelCategoryFilterInput | null > | null,
  not?: ModelCategoryFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelCategoryConnection = {
  __typename: "ModelCategoryConnection",
  items:  Array<Category | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelCustomerFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  firstName?: ModelStringInput | null,
  lastName?: ModelStringInput | null,
  middleName?: ModelStringInput | null,
  dob?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  email?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelCustomerFilterInput | null > | null,
  or?: Array< ModelCustomerFilterInput | null > | null,
  not?: ModelCustomerFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelCustomerConnection = {
  __typename: "ModelCustomerConnection",
  items:  Array<Customer | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelEmployeeFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
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
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelEmployeeFilterInput | null > | null,
  or?: Array< ModelEmployeeFilterInput | null > | null,
  not?: ModelEmployeeFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelEmployeeConnection = {
  __typename: "ModelEmployeeConnection",
  items:  Array<Employee | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelOrderFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  orderNo?: ModelStringInput | null,
  orderDate?: ModelStringInput | null,
  subtotal?: ModelFloatInput | null,
  tax?: ModelFloatInput | null,
  total?: ModelFloatInput | null,
  status?: ModelOrderStatusInput | null,
  employeeId?: ModelStringInput | null,
  employeeName?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelOrderFilterInput | null > | null,
  or?: Array< ModelOrderFilterInput | null > | null,
  not?: ModelOrderFilterInput | null,
  _deleted?: ModelBooleanInput | null,
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
  tenantId?: ModelIDInput | null,
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
  isEBTEligible?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelProductFilterInput | null > | null,
  or?: Array< ModelProductFilterInput | null > | null,
  not?: ModelProductFilterInput | null,
  _deleted?: ModelBooleanInput | null,
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
  tenantId?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUnitOfMeasureFilterInput | null > | null,
  or?: Array< ModelUnitOfMeasureFilterInput | null > | null,
  not?: ModelUnitOfMeasureFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelUnitOfMeasureConnection = {
  __typename: "ModelUnitOfMeasureConnection",
  items:  Array<UnitOfMeasure | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelInventoryChangesFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  timestamp?: ModelStringInput | null,
  type?: ModelStringInput | null,
  typeId?: ModelStringInput | null,
  quantityIn?: ModelIntInput | null,
  quantityOut?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelInventoryChangesFilterInput | null > | null,
  or?: Array< ModelInventoryChangesFilterInput | null > | null,
  not?: ModelInventoryChangesFilterInput | null,
  _deleted?: ModelBooleanInput | null,
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
  tenantId?: ModelIDInput | null,
  comments?: ModelStringInput | null,
  status?: ModelInventoryCountStatusInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelInventoryCountFilterInput | null > | null,
  or?: Array< ModelInventoryCountFilterInput | null > | null,
  not?: ModelInventoryCountFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelInventoryCountConnection = {
  __typename: "ModelInventoryCountConnection",
  items:  Array<InventoryCount | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelInventoryCountLineFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  productId?: ModelStringInput | null,
  productName?: ModelStringInput | null,
  unitOfMeasure?: ModelStringInput | null,
  current?: ModelFloatInput | null,
  newCount?: ModelFloatInput | null,
  comments?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelInventoryCountLineFilterInput | null > | null,
  or?: Array< ModelInventoryCountLineFilterInput | null > | null,
  not?: ModelInventoryCountLineFilterInput | null,
  _deleted?: ModelBooleanInput | null,
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
  tenantId?: ModelIDInput | null,
  comments?: ModelStringInput | null,
  status?: ModelInventoryReceiveStatusInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelInventoryReceiveFilterInput | null > | null,
  or?: Array< ModelInventoryReceiveFilterInput | null > | null,
  not?: ModelInventoryReceiveFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelInventoryReceiveConnection = {
  __typename: "ModelInventoryReceiveConnection",
  items:  Array<InventoryReceive | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelInventoryReceiveLineFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  productId?: ModelStringInput | null,
  productName?: ModelStringInput | null,
  unitOfMeasure?: ModelStringInput | null,
  received?: ModelFloatInput | null,
  comments?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelInventoryReceiveLineFilterInput | null > | null,
  or?: Array< ModelInventoryReceiveLineFilterInput | null > | null,
  not?: ModelInventoryReceiveLineFilterInput | null,
  _deleted?: ModelBooleanInput | null,
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
  tenantId?: ModelIDInput | null,
  deviceId?: ModelStringInput | null,
  identifier?: ModelStringInput | null,
  interfaceType?: ModelStringInput | null,
  ip?: ModelStringInput | null,
  model?: ModelStringInput | null,
  alias?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelPrinterFilterInput | null > | null,
  or?: Array< ModelPrinterFilterInput | null > | null,
  not?: ModelPrinterFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelPrinterConnection = {
  __typename: "ModelPrinterConnection",
  items:  Array<Printer | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelStationFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  deviceId?: ModelStringInput | null,
  alias?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelStationFilterInput | null > | null,
  or?: Array< ModelStationFilterInput | null > | null,
  not?: ModelStationFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelStationConnection = {
  __typename: "ModelStationConnection",
  items:  Array<Station | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelGlobalSettingsFilterInput = {
  id?: ModelIDInput | null,
  tenantId?: ModelIDInput | null,
  enforceSalesBasedOnInventory?: ModelBooleanInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelGlobalSettingsFilterInput | null > | null,
  or?: Array< ModelGlobalSettingsFilterInput | null > | null,
  not?: ModelGlobalSettingsFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelGlobalSettingsConnection = {
  __typename: "ModelGlobalSettingsConnection",
  items:  Array<GlobalSettings | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelSubscriptionTenantFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  slug?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTenantFilterInput | null > | null,
  or?: Array< ModelSubscriptionTenantFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  ownerUserId?: ModelStringInput | null,
};

export type ModelSubscriptionIDInput = {
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
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
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
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionTenantUserFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  tenantId?: ModelSubscriptionIDInput | null,
  role?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTenantUserFilterInput | null > | null,
  or?: Array< ModelSubscriptionTenantUserFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  userId?: ModelStringInput | null,
};

export type ModelSubscriptionStoreFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  address?: ModelSubscriptionStringInput | null,
  city?: ModelSubscriptionStringInput | null,
  state?: ModelSubscriptionStringInput | null,
  zipCode?: ModelSubscriptionStringInput | null,
  country?: ModelSubscriptionStringInput | null,
  phone?: ModelSubscriptionStringInput | null,
  fax?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  disclaimer?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionStoreFilterInput | null > | null,
  or?: Array< ModelSubscriptionStoreFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionBrandFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionBrandFilterInput | null > | null,
  or?: Array< ModelSubscriptionBrandFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionCategoryFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  code?: ModelSubscriptionStringInput | null,
  color?: ModelSubscriptionStringInput | null,
  picture?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionCategoryFilterInput | null > | null,
  or?: Array< ModelSubscriptionCategoryFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionCustomerFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  firstName?: ModelSubscriptionStringInput | null,
  lastName?: ModelSubscriptionStringInput | null,
  middleName?: ModelSubscriptionStringInput | null,
  dob?: ModelSubscriptionStringInput | null,
  phone?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionCustomerFilterInput | null > | null,
  or?: Array< ModelSubscriptionCustomerFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionEmployeeFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  code?: ModelSubscriptionStringInput | null,
  firstName?: ModelSubscriptionStringInput | null,
  lastName?: ModelSubscriptionStringInput | null,
  middleName?: ModelSubscriptionStringInput | null,
  dob?: ModelSubscriptionStringInput | null,
  phone?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  pin?: ModelSubscriptionStringInput | null,
  roles?: ModelSubscriptionStringInput | null,
  active?: ModelSubscriptionBooleanInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionEmployeeFilterInput | null > | null,
  or?: Array< ModelSubscriptionEmployeeFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionOrderFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  orderNo?: ModelSubscriptionStringInput | null,
  orderDate?: ModelSubscriptionStringInput | null,
  subtotal?: ModelSubscriptionFloatInput | null,
  tax?: ModelSubscriptionFloatInput | null,
  total?: ModelSubscriptionFloatInput | null,
  status?: ModelSubscriptionStringInput | null,
  employeeId?: ModelSubscriptionStringInput | null,
  employeeName?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionOrderFilterInput | null > | null,
  or?: Array< ModelSubscriptionOrderFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  orderCustomerId?: ModelSubscriptionIDInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionProductFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  price?: ModelSubscriptionFloatInput | null,
  tags?: ModelSubscriptionStringInput | null,
  cost?: ModelSubscriptionFloatInput | null,
  barcode?: ModelSubscriptionStringInput | null,
  sku?: ModelSubscriptionStringInput | null,
  plu?: ModelSubscriptionStringInput | null,
  quantity?: ModelSubscriptionFloatInput | null,
  unitOfMeasure?: ModelSubscriptionStringInput | null,
  trackStock?: ModelSubscriptionBooleanInput | null,
  reorderPoint?: ModelSubscriptionFloatInput | null,
  reorderQuantity?: ModelSubscriptionFloatInput | null,
  picture?: ModelSubscriptionStringInput | null,
  isActive?: ModelSubscriptionBooleanInput | null,
  isEBTEligible?: ModelSubscriptionBooleanInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionProductFilterInput | null > | null,
  or?: Array< ModelSubscriptionProductFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  productCategoryId?: ModelSubscriptionIDInput | null,
  productBrandId?: ModelSubscriptionIDInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionUnitOfMeasureFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUnitOfMeasureFilterInput | null > | null,
  or?: Array< ModelSubscriptionUnitOfMeasureFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionInventoryChangesFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  timestamp?: ModelSubscriptionStringInput | null,
  type?: ModelSubscriptionStringInput | null,
  typeId?: ModelSubscriptionStringInput | null,
  quantityIn?: ModelSubscriptionIntInput | null,
  quantityOut?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionInventoryChangesFilterInput | null > | null,
  or?: Array< ModelSubscriptionInventoryChangesFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  inventoryChangesProductId?: ModelSubscriptionIDInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionInventoryCountFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  comments?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionInventoryCountFilterInput | null > | null,
  or?: Array< ModelSubscriptionInventoryCountFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionInventoryCountLineFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  productId?: ModelSubscriptionStringInput | null,
  productName?: ModelSubscriptionStringInput | null,
  unitOfMeasure?: ModelSubscriptionStringInput | null,
  current?: ModelSubscriptionFloatInput | null,
  newCount?: ModelSubscriptionFloatInput | null,
  comments?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionInventoryCountLineFilterInput | null > | null,
  or?: Array< ModelSubscriptionInventoryCountLineFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  inventoryCountLineInventoryCountId?: ModelSubscriptionIDInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionInventoryReceiveFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  comments?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionInventoryReceiveFilterInput | null > | null,
  or?: Array< ModelSubscriptionInventoryReceiveFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionInventoryReceiveLineFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  productId?: ModelSubscriptionStringInput | null,
  productName?: ModelSubscriptionStringInput | null,
  unitOfMeasure?: ModelSubscriptionStringInput | null,
  received?: ModelSubscriptionFloatInput | null,
  comments?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionInventoryReceiveLineFilterInput | null > | null,
  or?: Array< ModelSubscriptionInventoryReceiveLineFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  inventoryReceiveLineInventoryReceiveId?: ModelSubscriptionIDInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionPrinterFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  deviceId?: ModelSubscriptionStringInput | null,
  identifier?: ModelSubscriptionStringInput | null,
  interfaceType?: ModelSubscriptionStringInput | null,
  ip?: ModelSubscriptionStringInput | null,
  model?: ModelSubscriptionStringInput | null,
  alias?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionPrinterFilterInput | null > | null,
  or?: Array< ModelSubscriptionPrinterFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionStationFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  deviceId?: ModelSubscriptionStringInput | null,
  alias?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionStationFilterInput | null > | null,
  or?: Array< ModelSubscriptionStationFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type ModelSubscriptionGlobalSettingsFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  enforceSalesBasedOnInventory?: ModelSubscriptionBooleanInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionGlobalSettingsFilterInput | null > | null,
  or?: Array< ModelSubscriptionGlobalSettingsFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
  tenantId?: ModelStringInput | null,
};

export type CreateTenantMutationVariables = {
  input: CreateTenantInput,
  condition?: ModelTenantConditionInput | null,
};

export type CreateTenantMutation = {
  createTenant?:  {
    __typename: "Tenant",
    id: string,
    name: string,
    slug: string,
    ownerUserId: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateTenantMutationVariables = {
  input: UpdateTenantInput,
  condition?: ModelTenantConditionInput | null,
};

export type UpdateTenantMutation = {
  updateTenant?:  {
    __typename: "Tenant",
    id: string,
    name: string,
    slug: string,
    ownerUserId: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteTenantMutationVariables = {
  input: DeleteTenantInput,
  condition?: ModelTenantConditionInput | null,
};

export type DeleteTenantMutation = {
  deleteTenant?:  {
    __typename: "Tenant",
    id: string,
    name: string,
    slug: string,
    ownerUserId: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateTenantUserMutationVariables = {
  input: CreateTenantUserInput,
  condition?: ModelTenantUserConditionInput | null,
};

export type CreateTenantUserMutation = {
  createTenantUser?:  {
    __typename: "TenantUser",
    id: string,
    tenantId: string,
    userId: string,
    role: TenantUserRole,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateTenantUserMutationVariables = {
  input: UpdateTenantUserInput,
  condition?: ModelTenantUserConditionInput | null,
};

export type UpdateTenantUserMutation = {
  updateTenantUser?:  {
    __typename: "TenantUser",
    id: string,
    tenantId: string,
    userId: string,
    role: TenantUserRole,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteTenantUserMutationVariables = {
  input: DeleteTenantUserInput,
  condition?: ModelTenantUserConditionInput | null,
};

export type DeleteTenantUserMutation = {
  deleteTenantUser?:  {
    __typename: "TenantUser",
    id: string,
    tenantId: string,
    userId: string,
    role: TenantUserRole,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateStoreMutationVariables = {
  input: CreateStoreInput,
  condition?: ModelStoreConditionInput | null,
};

export type CreateStoreMutation = {
  createStore?:  {
    __typename: "Store",
    id: string,
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
      isEBTEligible?: boolean | null,
      ebtPaidAmount?: number | null,
      nonEbtPaidAmount?: number | null,
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
      tenantId: string,
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
    tenantId: string,
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
      isEBTEligible?: boolean | null,
      ebtPaidAmount?: number | null,
      nonEbtPaidAmount?: number | null,
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
      tenantId: string,
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
    tenantId: string,
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
      isEBTEligible?: boolean | null,
      ebtPaidAmount?: number | null,
      nonEbtPaidAmount?: number | null,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive: boolean,
    isEBTEligible?: boolean | null,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive: boolean,
    isEBTEligible?: boolean | null,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive: boolean,
    isEBTEligible?: boolean | null,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      tenantId: string,
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
      isActive: boolean,
      isEBTEligible?: boolean | null,
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
    tenantId: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      tenantId: string,
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
      isActive: boolean,
      isEBTEligible?: boolean | null,
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
    tenantId: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      tenantId: string,
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
      isActive: boolean,
      isEBTEligible?: boolean | null,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      tenantId: string,
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
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      tenantId: string,
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
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      tenantId: string,
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
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      tenantId: string,
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
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
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
    tenantId: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateGlobalSettingsMutationVariables = {
  input: CreateGlobalSettingsInput,
  condition?: ModelGlobalSettingsConditionInput | null,
};

export type CreateGlobalSettingsMutation = {
  createGlobalSettings?:  {
    __typename: "GlobalSettings",
    id: string,
    tenantId: string,
    enforceSalesBasedOnInventory: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateGlobalSettingsMutationVariables = {
  input: UpdateGlobalSettingsInput,
  condition?: ModelGlobalSettingsConditionInput | null,
};

export type UpdateGlobalSettingsMutation = {
  updateGlobalSettings?:  {
    __typename: "GlobalSettings",
    id: string,
    tenantId: string,
    enforceSalesBasedOnInventory: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteGlobalSettingsMutationVariables = {
  input: DeleteGlobalSettingsInput,
  condition?: ModelGlobalSettingsConditionInput | null,
};

export type DeleteGlobalSettingsMutation = {
  deleteGlobalSettings?:  {
    __typename: "GlobalSettings",
    id: string,
    tenantId: string,
    enforceSalesBasedOnInventory: boolean,
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
    tenantId: string,
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
      isEBTEligible?: boolean | null,
      ebtPaidAmount?: number | null,
      nonEbtPaidAmount?: number | null,
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
      tenantId: string,
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

export type GetTenantQueryVariables = {
  id: string,
};

export type GetTenantQuery = {
  getTenant?:  {
    __typename: "Tenant",
    id: string,
    name: string,
    slug: string,
    ownerUserId: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListTenantsQueryVariables = {
  filter?: ModelTenantFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTenantsQuery = {
  listTenants?:  {
    __typename: "ModelTenantConnection",
    items:  Array< {
      __typename: "Tenant",
      id: string,
      name: string,
      slug: string,
      ownerUserId: string,
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

export type SyncTenantsQueryVariables = {
  filter?: ModelTenantFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncTenantsQuery = {
  syncTenants?:  {
    __typename: "ModelTenantConnection",
    items:  Array< {
      __typename: "Tenant",
      id: string,
      name: string,
      slug: string,
      ownerUserId: string,
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

export type GetTenantUserQueryVariables = {
  id: string,
};

export type GetTenantUserQuery = {
  getTenantUser?:  {
    __typename: "TenantUser",
    id: string,
    tenantId: string,
    userId: string,
    role: TenantUserRole,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListTenantUsersQueryVariables = {
  filter?: ModelTenantUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTenantUsersQuery = {
  listTenantUsers?:  {
    __typename: "ModelTenantUserConnection",
    items:  Array< {
      __typename: "TenantUser",
      id: string,
      tenantId: string,
      userId: string,
      role: TenantUserRole,
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

export type SyncTenantUsersQueryVariables = {
  filter?: ModelTenantUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncTenantUsersQuery = {
  syncTenantUsers?:  {
    __typename: "ModelTenantUserConnection",
    items:  Array< {
      __typename: "TenantUser",
      id: string,
      tenantId: string,
      userId: string,
      role: TenantUserRole,
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

export type GetStoreQueryVariables = {
  id: string,
};

export type GetStoreQuery = {
  getStore?:  {
    __typename: "Store",
    id: string,
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      isEBTEligible?: boolean | null,
      ebtPaidAmount?: number | null,
      nonEbtPaidAmount?: number | null,
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
      tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive: boolean,
    isEBTEligible?: boolean | null,
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
      tenantId: string,
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
      isActive: boolean,
      isEBTEligible?: boolean | null,
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
      tenantId: string,
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
      isActive: boolean,
      isEBTEligible?: boolean | null,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      tenantId: string,
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
      isActive: boolean,
      isEBTEligible?: boolean | null,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
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

export type GetGlobalSettingsQueryVariables = {
  id: string,
};

export type GetGlobalSettingsQuery = {
  getGlobalSettings?:  {
    __typename: "GlobalSettings",
    id: string,
    tenantId: string,
    enforceSalesBasedOnInventory: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListGlobalSettingsQueryVariables = {
  filter?: ModelGlobalSettingsFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListGlobalSettingsQuery = {
  listGlobalSettings?:  {
    __typename: "ModelGlobalSettingsConnection",
    items:  Array< {
      __typename: "GlobalSettings",
      id: string,
      tenantId: string,
      enforceSalesBasedOnInventory: boolean,
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

export type SyncGlobalSettingsQueryVariables = {
  filter?: ModelGlobalSettingsFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncGlobalSettingsQuery = {
  syncGlobalSettings?:  {
    __typename: "ModelGlobalSettingsConnection",
    items:  Array< {
      __typename: "GlobalSettings",
      id: string,
      tenantId: string,
      enforceSalesBasedOnInventory: boolean,
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

export type TenantBySlugQueryVariables = {
  slug: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTenantFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type TenantBySlugQuery = {
  tenantBySlug?:  {
    __typename: "ModelTenantConnection",
    items:  Array< {
      __typename: "Tenant",
      id: string,
      name: string,
      slug: string,
      ownerUserId: string,
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

export type TenantUsersByTenantQueryVariables = {
  tenantId: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTenantUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type TenantUsersByTenantQuery = {
  tenantUsersByTenant?:  {
    __typename: "ModelTenantUserConnection",
    items:  Array< {
      __typename: "TenantUser",
      id: string,
      tenantId: string,
      userId: string,
      role: TenantUserRole,
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

export type TenantUsersByUserQueryVariables = {
  userId: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTenantUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type TenantUsersByUserQuery = {
  tenantUsersByUser?:  {
    __typename: "ModelTenantUserConnection",
    items:  Array< {
      __typename: "TenantUser",
      id: string,
      tenantId: string,
      userId: string,
      role: TenantUserRole,
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

export type OnCreateTenantSubscriptionVariables = {
  filter?: ModelSubscriptionTenantFilterInput | null,
  ownerUserId?: string | null,
};

export type OnCreateTenantSubscription = {
  onCreateTenant?:  {
    __typename: "Tenant",
    id: string,
    name: string,
    slug: string,
    ownerUserId: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateTenantSubscriptionVariables = {
  filter?: ModelSubscriptionTenantFilterInput | null,
  ownerUserId?: string | null,
};

export type OnUpdateTenantSubscription = {
  onUpdateTenant?:  {
    __typename: "Tenant",
    id: string,
    name: string,
    slug: string,
    ownerUserId: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteTenantSubscriptionVariables = {
  filter?: ModelSubscriptionTenantFilterInput | null,
  ownerUserId?: string | null,
};

export type OnDeleteTenantSubscription = {
  onDeleteTenant?:  {
    __typename: "Tenant",
    id: string,
    name: string,
    slug: string,
    ownerUserId: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateTenantUserSubscriptionVariables = {
  filter?: ModelSubscriptionTenantUserFilterInput | null,
  userId?: string | null,
};

export type OnCreateTenantUserSubscription = {
  onCreateTenantUser?:  {
    __typename: "TenantUser",
    id: string,
    tenantId: string,
    userId: string,
    role: TenantUserRole,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateTenantUserSubscriptionVariables = {
  filter?: ModelSubscriptionTenantUserFilterInput | null,
  userId?: string | null,
};

export type OnUpdateTenantUserSubscription = {
  onUpdateTenantUser?:  {
    __typename: "TenantUser",
    id: string,
    tenantId: string,
    userId: string,
    role: TenantUserRole,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteTenantUserSubscriptionVariables = {
  filter?: ModelSubscriptionTenantUserFilterInput | null,
  userId?: string | null,
};

export type OnDeleteTenantUserSubscription = {
  onDeleteTenantUser?:  {
    __typename: "TenantUser",
    id: string,
    tenantId: string,
    userId: string,
    role: TenantUserRole,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateStoreSubscriptionVariables = {
  filter?: ModelSubscriptionStoreFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateStoreSubscription = {
  onCreateStore?:  {
    __typename: "Store",
    id: string,
    tenantId: string,
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

export type OnUpdateStoreSubscriptionVariables = {
  filter?: ModelSubscriptionStoreFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateStoreSubscription = {
  onUpdateStore?:  {
    __typename: "Store",
    id: string,
    tenantId: string,
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

export type OnDeleteStoreSubscriptionVariables = {
  filter?: ModelSubscriptionStoreFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteStoreSubscription = {
  onDeleteStore?:  {
    __typename: "Store",
    id: string,
    tenantId: string,
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

export type OnCreateBrandSubscriptionVariables = {
  filter?: ModelSubscriptionBrandFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateBrandSubscription = {
  onCreateBrand?:  {
    __typename: "Brand",
    id: string,
    tenantId: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateBrandSubscriptionVariables = {
  filter?: ModelSubscriptionBrandFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateBrandSubscription = {
  onUpdateBrand?:  {
    __typename: "Brand",
    id: string,
    tenantId: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteBrandSubscriptionVariables = {
  filter?: ModelSubscriptionBrandFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteBrandSubscription = {
  onDeleteBrand?:  {
    __typename: "Brand",
    id: string,
    tenantId: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateCategorySubscriptionVariables = {
  filter?: ModelSubscriptionCategoryFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateCategorySubscription = {
  onCreateCategory?:  {
    __typename: "Category",
    id: string,
    tenantId: string,
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

export type OnUpdateCategorySubscriptionVariables = {
  filter?: ModelSubscriptionCategoryFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateCategorySubscription = {
  onUpdateCategory?:  {
    __typename: "Category",
    id: string,
    tenantId: string,
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

export type OnDeleteCategorySubscriptionVariables = {
  filter?: ModelSubscriptionCategoryFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteCategorySubscription = {
  onDeleteCategory?:  {
    __typename: "Category",
    id: string,
    tenantId: string,
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

export type OnCreateCustomerSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateCustomerSubscription = {
  onCreateCustomer?:  {
    __typename: "Customer",
    id: string,
    tenantId: string,
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

export type OnUpdateCustomerSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateCustomerSubscription = {
  onUpdateCustomer?:  {
    __typename: "Customer",
    id: string,
    tenantId: string,
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

export type OnDeleteCustomerSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteCustomerSubscription = {
  onDeleteCustomer?:  {
    __typename: "Customer",
    id: string,
    tenantId: string,
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

export type OnCreateEmployeeSubscriptionVariables = {
  filter?: ModelSubscriptionEmployeeFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateEmployeeSubscription = {
  onCreateEmployee?:  {
    __typename: "Employee",
    id: string,
    tenantId: string,
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

export type OnUpdateEmployeeSubscriptionVariables = {
  filter?: ModelSubscriptionEmployeeFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateEmployeeSubscription = {
  onUpdateEmployee?:  {
    __typename: "Employee",
    id: string,
    tenantId: string,
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

export type OnDeleteEmployeeSubscriptionVariables = {
  filter?: ModelSubscriptionEmployeeFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteEmployeeSubscription = {
  onDeleteEmployee?:  {
    __typename: "Employee",
    id: string,
    tenantId: string,
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

export type OnCreateOrderSubscriptionVariables = {
  filter?: ModelSubscriptionOrderFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateOrderSubscription = {
  onCreateOrder?:  {
    __typename: "Order",
    id: string,
    tenantId: string,
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
      isEBTEligible?: boolean | null,
      ebtPaidAmount?: number | null,
      nonEbtPaidAmount?: number | null,
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
      tenantId: string,
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

export type OnUpdateOrderSubscriptionVariables = {
  filter?: ModelSubscriptionOrderFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateOrderSubscription = {
  onUpdateOrder?:  {
    __typename: "Order",
    id: string,
    tenantId: string,
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
      isEBTEligible?: boolean | null,
      ebtPaidAmount?: number | null,
      nonEbtPaidAmount?: number | null,
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
      tenantId: string,
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

export type OnDeleteOrderSubscriptionVariables = {
  filter?: ModelSubscriptionOrderFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteOrderSubscription = {
  onDeleteOrder?:  {
    __typename: "Order",
    id: string,
    tenantId: string,
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
      isEBTEligible?: boolean | null,
      ebtPaidAmount?: number | null,
      nonEbtPaidAmount?: number | null,
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
      tenantId: string,
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

export type OnCreateProductSubscriptionVariables = {
  filter?: ModelSubscriptionProductFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateProductSubscription = {
  onCreateProduct?:  {
    __typename: "Product",
    id: string,
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive: boolean,
    isEBTEligible?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type OnUpdateProductSubscriptionVariables = {
  filter?: ModelSubscriptionProductFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateProductSubscription = {
  onUpdateProduct?:  {
    __typename: "Product",
    id: string,
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive: boolean,
    isEBTEligible?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type OnDeleteProductSubscriptionVariables = {
  filter?: ModelSubscriptionProductFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteProductSubscription = {
  onDeleteProduct?:  {
    __typename: "Product",
    id: string,
    tenantId: string,
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
      tenantId: string,
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
      tenantId: string,
      name: string,
      description?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    isActive: boolean,
    isEBTEligible?: boolean | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    productCategoryId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type OnCreateUnitOfMeasureSubscriptionVariables = {
  filter?: ModelSubscriptionUnitOfMeasureFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateUnitOfMeasureSubscription = {
  onCreateUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    tenantId: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateUnitOfMeasureSubscriptionVariables = {
  filter?: ModelSubscriptionUnitOfMeasureFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateUnitOfMeasureSubscription = {
  onUpdateUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    tenantId: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteUnitOfMeasureSubscriptionVariables = {
  filter?: ModelSubscriptionUnitOfMeasureFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteUnitOfMeasureSubscription = {
  onDeleteUnitOfMeasure?:  {
    __typename: "UnitOfMeasure",
    id: string,
    tenantId: string,
    name: string,
    description?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateInventoryChangesSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryChangesFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateInventoryChangesSubscription = {
  onCreateInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    tenantId: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      tenantId: string,
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
      isActive: boolean,
      isEBTEligible?: boolean | null,
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

export type OnUpdateInventoryChangesSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryChangesFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateInventoryChangesSubscription = {
  onUpdateInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    tenantId: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      tenantId: string,
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
      isActive: boolean,
      isEBTEligible?: boolean | null,
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

export type OnDeleteInventoryChangesSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryChangesFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteInventoryChangesSubscription = {
  onDeleteInventoryChanges?:  {
    __typename: "InventoryChanges",
    id: string,
    tenantId: string,
    timestamp: string,
    type: string,
    typeId?: string | null,
    quantityIn: number,
    quantityOut: number,
    Product?:  {
      __typename: "Product",
      id: string,
      tenantId: string,
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
      isActive: boolean,
      isEBTEligible?: boolean | null,
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

export type OnCreateInventoryCountSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryCountFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateInventoryCountSubscription = {
  onCreateInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    tenantId: string,
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

export type OnUpdateInventoryCountSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryCountFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateInventoryCountSubscription = {
  onUpdateInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    tenantId: string,
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

export type OnDeleteInventoryCountSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryCountFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteInventoryCountSubscription = {
  onDeleteInventoryCount?:  {
    __typename: "InventoryCount",
    id: string,
    tenantId: string,
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

export type OnCreateInventoryCountLineSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryCountLineFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateInventoryCountLineSubscription = {
  onCreateInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      tenantId: string,
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

export type OnUpdateInventoryCountLineSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryCountLineFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateInventoryCountLineSubscription = {
  onUpdateInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      tenantId: string,
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

export type OnDeleteInventoryCountLineSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryCountLineFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteInventoryCountLineSubscription = {
  onDeleteInventoryCountLine?:  {
    __typename: "InventoryCountLine",
    id: string,
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    current: number,
    newCount: number,
    comments?: string | null,
    InventoryCount?:  {
      __typename: "InventoryCount",
      id: string,
      tenantId: string,
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

export type OnCreateInventoryReceiveSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryReceiveFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateInventoryReceiveSubscription = {
  onCreateInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    tenantId: string,
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

export type OnUpdateInventoryReceiveSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryReceiveFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateInventoryReceiveSubscription = {
  onUpdateInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    tenantId: string,
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

export type OnDeleteInventoryReceiveSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryReceiveFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteInventoryReceiveSubscription = {
  onDeleteInventoryReceive?:  {
    __typename: "InventoryReceive",
    id: string,
    tenantId: string,
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

export type OnCreateInventoryReceiveLineSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryReceiveLineFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateInventoryReceiveLineSubscription = {
  onCreateInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      tenantId: string,
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

export type OnUpdateInventoryReceiveLineSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryReceiveLineFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateInventoryReceiveLineSubscription = {
  onUpdateInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      tenantId: string,
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

export type OnDeleteInventoryReceiveLineSubscriptionVariables = {
  filter?: ModelSubscriptionInventoryReceiveLineFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteInventoryReceiveLineSubscription = {
  onDeleteInventoryReceiveLine?:  {
    __typename: "InventoryReceiveLine",
    id: string,
    tenantId: string,
    productId: string,
    productName: string,
    unitOfMeasure: string,
    received: number,
    comments?: string | null,
    InventoryReceive?:  {
      __typename: "InventoryReceive",
      id: string,
      tenantId: string,
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

export type OnCreatePrinterSubscriptionVariables = {
  filter?: ModelSubscriptionPrinterFilterInput | null,
  tenantId?: string | null,
};

export type OnCreatePrinterSubscription = {
  onCreatePrinter?:  {
    __typename: "Printer",
    id: string,
    tenantId: string,
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

export type OnUpdatePrinterSubscriptionVariables = {
  filter?: ModelSubscriptionPrinterFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdatePrinterSubscription = {
  onUpdatePrinter?:  {
    __typename: "Printer",
    id: string,
    tenantId: string,
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

export type OnDeletePrinterSubscriptionVariables = {
  filter?: ModelSubscriptionPrinterFilterInput | null,
  tenantId?: string | null,
};

export type OnDeletePrinterSubscription = {
  onDeletePrinter?:  {
    __typename: "Printer",
    id: string,
    tenantId: string,
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

export type OnCreateStationSubscriptionVariables = {
  filter?: ModelSubscriptionStationFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateStationSubscription = {
  onCreateStation?:  {
    __typename: "Station",
    id: string,
    tenantId: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateStationSubscriptionVariables = {
  filter?: ModelSubscriptionStationFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateStationSubscription = {
  onUpdateStation?:  {
    __typename: "Station",
    id: string,
    tenantId: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteStationSubscriptionVariables = {
  filter?: ModelSubscriptionStationFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteStationSubscription = {
  onDeleteStation?:  {
    __typename: "Station",
    id: string,
    tenantId: string,
    deviceId: string,
    alias: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateGlobalSettingsSubscriptionVariables = {
  filter?: ModelSubscriptionGlobalSettingsFilterInput | null,
  tenantId?: string | null,
};

export type OnCreateGlobalSettingsSubscription = {
  onCreateGlobalSettings?:  {
    __typename: "GlobalSettings",
    id: string,
    tenantId: string,
    enforceSalesBasedOnInventory: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateGlobalSettingsSubscriptionVariables = {
  filter?: ModelSubscriptionGlobalSettingsFilterInput | null,
  tenantId?: string | null,
};

export type OnUpdateGlobalSettingsSubscription = {
  onUpdateGlobalSettings?:  {
    __typename: "GlobalSettings",
    id: string,
    tenantId: string,
    enforceSalesBasedOnInventory: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteGlobalSettingsSubscriptionVariables = {
  filter?: ModelSubscriptionGlobalSettingsFilterInput | null,
  tenantId?: string | null,
};

export type OnDeleteGlobalSettingsSubscription = {
  onDeleteGlobalSettings?:  {
    __typename: "GlobalSettings",
    id: string,
    tenantId: string,
    enforceSalesBasedOnInventory: boolean,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};
