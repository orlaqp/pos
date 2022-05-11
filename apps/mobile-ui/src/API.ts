/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

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

export type CreateOrderInput = {
  id?: string | null,
  orderNo: string,
  subtotal: number,
  tax: number,
  total: number,
  status: OrderStatus,
  _version?: number | null,
  orderCustomerId?: string | null,
};

export enum OrderStatus {
  CREATED = "CREATED",
  CANCELLED = "CANCELLED",
  PAID = "PAID",
  ONHOLD = "ONHOLD",
}


export type ModelOrderConditionInput = {
  orderNo?: ModelStringInput | null,
  subtotal?: ModelFloatInput | null,
  tax?: ModelFloatInput | null,
  total?: ModelFloatInput | null,
  status?: ModelOrderStatusInput | null,
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
  subtotal: number,
  tax: number,
  total: number,
  status: OrderStatus,
  OrderItems?: ModelOrderLineConnection | null,
  Customer?: Customer | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  orderCustomerId?: string | null,
};

export type ModelOrderLineConnection = {
  __typename: "ModelOrderLineConnection",
  items:  Array<OrderLine | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type OrderLine = {
  __typename: "OrderLine",
  id: string,
  Product?: Product | null,
  quantity: number,
  tax: number,
  discountType?: string | null,
  discountValue?: number | null,
  orderID: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  orderLineProductId?: string | null,
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
  trackStock: boolean,
  Category?: Category | null,
  UnitOfMeasure?: UnitOfMeasure | null,
  Brand?: Brand | null,
  isActive?: boolean | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  productCategoryId?: string | null,
  productUnitOfMeasureId?: string | null,
  productBrandId?: string | null,
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

export type UpdateOrderInput = {
  id: string,
  orderNo?: string | null,
  subtotal?: number | null,
  tax?: number | null,
  total?: number | null,
  status?: OrderStatus | null,
  _version?: number | null,
  orderCustomerId?: string | null,
};

export type DeleteOrderInput = {
  id: string,
  _version?: number | null,
};

export type CreateOrderLineInput = {
  id?: string | null,
  quantity: number,
  tax: number,
  discountType?: string | null,
  discountValue?: number | null,
  orderID: string,
  _version?: number | null,
  orderLineProductId?: string | null,
};

export type ModelOrderLineConditionInput = {
  quantity?: ModelFloatInput | null,
  tax?: ModelFloatInput | null,
  discountType?: ModelStringInput | null,
  discountValue?: ModelFloatInput | null,
  orderID?: ModelIDInput | null,
  and?: Array< ModelOrderLineConditionInput | null > | null,
  or?: Array< ModelOrderLineConditionInput | null > | null,
  not?: ModelOrderLineConditionInput | null,
  orderLineProductId?: ModelIDInput | null,
};

export type UpdateOrderLineInput = {
  id: string,
  quantity?: number | null,
  tax?: number | null,
  discountType?: string | null,
  discountValue?: number | null,
  orderID?: string | null,
  _version?: number | null,
  orderLineProductId?: string | null,
};

export type DeleteOrderLineInput = {
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
  trackStock: boolean,
  isActive?: boolean | null,
  _version?: number | null,
  productCategoryId?: string | null,
  productUnitOfMeasureId?: string | null,
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
  trackStock?: ModelBooleanInput | null,
  isActive?: ModelBooleanInput | null,
  and?: Array< ModelProductConditionInput | null > | null,
  or?: Array< ModelProductConditionInput | null > | null,
  not?: ModelProductConditionInput | null,
  productCategoryId?: ModelIDInput | null,
  productUnitOfMeasureId?: ModelIDInput | null,
  productBrandId?: ModelIDInput | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
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
  trackStock?: boolean | null,
  isActive?: boolean | null,
  _version?: number | null,
  productCategoryId?: string | null,
  productUnitOfMeasureId?: string | null,
  productBrandId?: string | null,
};

export type DeleteProductInput = {
  id: string,
  _version?: number | null,
};

export type CreatePurchaseOrderInput = {
  id?: string | null,
  purchaseDate?: string | null,
  amount?: number | null,
  _version?: number | null,
  purchaseOrderSupplierId?: string | null,
};

export type ModelPurchaseOrderConditionInput = {
  purchaseDate?: ModelStringInput | null,
  amount?: ModelFloatInput | null,
  and?: Array< ModelPurchaseOrderConditionInput | null > | null,
  or?: Array< ModelPurchaseOrderConditionInput | null > | null,
  not?: ModelPurchaseOrderConditionInput | null,
  purchaseOrderSupplierId?: ModelIDInput | null,
};

export type PurchaseOrder = {
  __typename: "PurchaseOrder",
  id: string,
  Supplier?: Supplier | null,
  purchaseDate?: string | null,
  amount?: number | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  purchaseOrderSupplierId?: string | null,
};

export type Supplier = {
  __typename: "Supplier",
  id: string,
  code?: string | null,
  name: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdatePurchaseOrderInput = {
  id: string,
  purchaseDate?: string | null,
  amount?: number | null,
  _version?: number | null,
  purchaseOrderSupplierId?: string | null,
};

export type DeletePurchaseOrderInput = {
  id: string,
  _version?: number | null,
};

export type CreatePurchaseOrderLineInput = {
  id?: string | null,
  unitPrice?: number | null,
  quantity?: number | null,
  _version?: number | null,
  purchaseOrderLineProductId?: string | null,
};

export type ModelPurchaseOrderLineConditionInput = {
  unitPrice?: ModelFloatInput | null,
  quantity?: ModelFloatInput | null,
  and?: Array< ModelPurchaseOrderLineConditionInput | null > | null,
  or?: Array< ModelPurchaseOrderLineConditionInput | null > | null,
  not?: ModelPurchaseOrderLineConditionInput | null,
  purchaseOrderLineProductId?: ModelIDInput | null,
};

export type PurchaseOrderLine = {
  __typename: "PurchaseOrderLine",
  id: string,
  Product?: Product | null,
  unitPrice?: number | null,
  quantity?: number | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  purchaseOrderLineProductId?: string | null,
};

export type UpdatePurchaseOrderLineInput = {
  id: string,
  unitPrice?: number | null,
  quantity?: number | null,
  _version?: number | null,
  purchaseOrderLineProductId?: string | null,
};

export type DeletePurchaseOrderLineInput = {
  id: string,
  _version?: number | null,
};

export type CreateStoreInput = {
  id?: string | null,
  name: string,
  address: string,
  city: string,
  state: string,
  country: string,
  phone: string,
  email: string,
  _version?: number | null,
};

export type ModelStoreConditionInput = {
  name?: ModelStringInput | null,
  address?: ModelStringInput | null,
  city?: ModelStringInput | null,
  state?: ModelStringInput | null,
  country?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  email?: ModelStringInput | null,
  and?: Array< ModelStoreConditionInput | null > | null,
  or?: Array< ModelStoreConditionInput | null > | null,
  not?: ModelStoreConditionInput | null,
};

export type Store = {
  __typename: "Store",
  id: string,
  name: string,
  address: string,
  city: string,
  state: string,
  country: string,
  phone: string,
  email: string,
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
  country?: string | null,
  phone?: string | null,
  email?: string | null,
  _version?: number | null,
};

export type DeleteStoreInput = {
  id: string,
  _version?: number | null,
};

export type CreateSupplierInput = {
  id?: string | null,
  code?: string | null,
  name: string,
  _version?: number | null,
};

export type ModelSupplierConditionInput = {
  code?: ModelStringInput | null,
  name?: ModelStringInput | null,
  and?: Array< ModelSupplierConditionInput | null > | null,
  or?: Array< ModelSupplierConditionInput | null > | null,
  not?: ModelSupplierConditionInput | null,
};

export type UpdateSupplierInput = {
  id: string,
  code?: string | null,
  name?: string | null,
  _version?: number | null,
};

export type DeleteSupplierInput = {
  id: string,
  _version?: number | null,
};

export type CreateStockInput = {
  id?: string | null,
  quantity: number,
  updatedAt?: string | null,
  _version?: number | null,
  stockProductId?: string | null,
};

export type ModelStockConditionInput = {
  quantity?: ModelFloatInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelStockConditionInput | null > | null,
  or?: Array< ModelStockConditionInput | null > | null,
  not?: ModelStockConditionInput | null,
  stockProductId?: ModelIDInput | null,
};

export type Stock = {
  __typename: "Stock",
  id: string,
  Product?: Product | null,
  quantity: number,
  updatedAt?: string | null,
  createdAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  stockProductId?: string | null,
};

export type UpdateStockInput = {
  id: string,
  quantity?: number | null,
  updatedAt?: string | null,
  _version?: number | null,
  stockProductId?: string | null,
};

export type DeleteStockInput = {
  id: string,
  _version?: number | null,
};

export type CreateTagInput = {
  id?: string | null,
  name: string,
  _version?: number | null,
};

export type ModelTagConditionInput = {
  name?: ModelStringInput | null,
  and?: Array< ModelTagConditionInput | null > | null,
  or?: Array< ModelTagConditionInput | null > | null,
  not?: ModelTagConditionInput | null,
};

export type Tag = {
  __typename: "Tag",
  id: string,
  name: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdateTagInput = {
  id: string,
  name?: string | null,
  _version?: number | null,
};

export type DeleteTagInput = {
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

export type ModelOrderFilterInput = {
  id?: ModelIDInput | null,
  orderNo?: ModelStringInput | null,
  subtotal?: ModelFloatInput | null,
  tax?: ModelFloatInput | null,
  total?: ModelFloatInput | null,
  status?: ModelOrderStatusInput | null,
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

export type ModelOrderLineFilterInput = {
  id?: ModelIDInput | null,
  quantity?: ModelFloatInput | null,
  tax?: ModelFloatInput | null,
  discountType?: ModelStringInput | null,
  discountValue?: ModelFloatInput | null,
  orderID?: ModelIDInput | null,
  and?: Array< ModelOrderLineFilterInput | null > | null,
  or?: Array< ModelOrderLineFilterInput | null > | null,
  not?: ModelOrderLineFilterInput | null,
  orderLineProductId?: ModelIDInput | null,
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
  trackStock?: ModelBooleanInput | null,
  isActive?: ModelBooleanInput | null,
  and?: Array< ModelProductFilterInput | null > | null,
  or?: Array< ModelProductFilterInput | null > | null,
  not?: ModelProductFilterInput | null,
  productCategoryId?: ModelIDInput | null,
  productUnitOfMeasureId?: ModelIDInput | null,
  productBrandId?: ModelIDInput | null,
};

export type ModelProductConnection = {
  __typename: "ModelProductConnection",
  items:  Array<Product | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelPurchaseOrderFilterInput = {
  id?: ModelIDInput | null,
  purchaseDate?: ModelStringInput | null,
  amount?: ModelFloatInput | null,
  and?: Array< ModelPurchaseOrderFilterInput | null > | null,
  or?: Array< ModelPurchaseOrderFilterInput | null > | null,
  not?: ModelPurchaseOrderFilterInput | null,
  purchaseOrderSupplierId?: ModelIDInput | null,
};

export type ModelPurchaseOrderConnection = {
  __typename: "ModelPurchaseOrderConnection",
  items:  Array<PurchaseOrder | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelPurchaseOrderLineFilterInput = {
  id?: ModelIDInput | null,
  unitPrice?: ModelFloatInput | null,
  quantity?: ModelFloatInput | null,
  and?: Array< ModelPurchaseOrderLineFilterInput | null > | null,
  or?: Array< ModelPurchaseOrderLineFilterInput | null > | null,
  not?: ModelPurchaseOrderLineFilterInput | null,
  purchaseOrderLineProductId?: ModelIDInput | null,
};

export type ModelPurchaseOrderLineConnection = {
  __typename: "ModelPurchaseOrderLineConnection",
  items:  Array<PurchaseOrderLine | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelStoreFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  address?: ModelStringInput | null,
  city?: ModelStringInput | null,
  state?: ModelStringInput | null,
  country?: ModelStringInput | null,
  phone?: ModelStringInput | null,
  email?: ModelStringInput | null,
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

export type ModelSupplierFilterInput = {
  id?: ModelIDInput | null,
  code?: ModelStringInput | null,
  name?: ModelStringInput | null,
  and?: Array< ModelSupplierFilterInput | null > | null,
  or?: Array< ModelSupplierFilterInput | null > | null,
  not?: ModelSupplierFilterInput | null,
};

export type ModelSupplierConnection = {
  __typename: "ModelSupplierConnection",
  items:  Array<Supplier | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelStockFilterInput = {
  id?: ModelIDInput | null,
  quantity?: ModelFloatInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelStockFilterInput | null > | null,
  or?: Array< ModelStockFilterInput | null > | null,
  not?: ModelStockFilterInput | null,
  stockProductId?: ModelIDInput | null,
};

export type ModelStockConnection = {
  __typename: "ModelStockConnection",
  items:  Array<Stock | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelTagFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  and?: Array< ModelTagFilterInput | null > | null,
  or?: Array< ModelTagFilterInput | null > | null,
  not?: ModelTagFilterInput | null,
};

export type ModelTagConnection = {
  __typename: "ModelTagConnection",
  items:  Array<Tag | null >,
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

export type CreateOrderMutationVariables = {
  input: CreateOrderInput,
  condition?: ModelOrderConditionInput | null,
};

export type CreateOrderMutation = {
  createOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    OrderItems?:  {
      __typename: "ModelOrderLineConnection",
      nextToken?: string | null,
      startedAt?: number | null,
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
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    OrderItems?:  {
      __typename: "ModelOrderLineConnection",
      nextToken?: string | null,
      startedAt?: number | null,
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
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    OrderItems?:  {
      __typename: "ModelOrderLineConnection",
      nextToken?: string | null,
      startedAt?: number | null,
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

export type CreateOrderLineMutationVariables = {
  input: CreateOrderLineInput,
  condition?: ModelOrderLineConditionInput | null,
};

export type CreateOrderLineMutation = {
  createOrderLine?:  {
    __typename: "OrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    tax: number,
    discountType?: string | null,
    discountValue?: number | null,
    orderID: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderLineProductId?: string | null,
  } | null,
};

export type UpdateOrderLineMutationVariables = {
  input: UpdateOrderLineInput,
  condition?: ModelOrderLineConditionInput | null,
};

export type UpdateOrderLineMutation = {
  updateOrderLine?:  {
    __typename: "OrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    tax: number,
    discountType?: string | null,
    discountValue?: number | null,
    orderID: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderLineProductId?: string | null,
  } | null,
};

export type DeleteOrderLineMutationVariables = {
  input: DeleteOrderLineInput,
  condition?: ModelOrderLineConditionInput | null,
};

export type DeleteOrderLineMutation = {
  deleteOrderLine?:  {
    __typename: "OrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    tax: number,
    discountType?: string | null,
    discountValue?: number | null,
    orderID: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderLineProductId?: string | null,
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
    trackStock: boolean,
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
    UnitOfMeasure?:  {
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
    productUnitOfMeasureId?: string | null,
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
    trackStock: boolean,
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
    UnitOfMeasure?:  {
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
    productUnitOfMeasureId?: string | null,
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
    trackStock: boolean,
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
    UnitOfMeasure?:  {
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
    productUnitOfMeasureId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type CreatePurchaseOrderMutationVariables = {
  input: CreatePurchaseOrderInput,
  condition?: ModelPurchaseOrderConditionInput | null,
};

export type CreatePurchaseOrderMutation = {
  createPurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    Supplier?:  {
      __typename: "Supplier",
      id: string,
      code?: string | null,
      name: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    purchaseDate?: string | null,
    amount?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderSupplierId?: string | null,
  } | null,
};

export type UpdatePurchaseOrderMutationVariables = {
  input: UpdatePurchaseOrderInput,
  condition?: ModelPurchaseOrderConditionInput | null,
};

export type UpdatePurchaseOrderMutation = {
  updatePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    Supplier?:  {
      __typename: "Supplier",
      id: string,
      code?: string | null,
      name: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    purchaseDate?: string | null,
    amount?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderSupplierId?: string | null,
  } | null,
};

export type DeletePurchaseOrderMutationVariables = {
  input: DeletePurchaseOrderInput,
  condition?: ModelPurchaseOrderConditionInput | null,
};

export type DeletePurchaseOrderMutation = {
  deletePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    Supplier?:  {
      __typename: "Supplier",
      id: string,
      code?: string | null,
      name: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    purchaseDate?: string | null,
    amount?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderSupplierId?: string | null,
  } | null,
};

export type CreatePurchaseOrderLineMutationVariables = {
  input: CreatePurchaseOrderLineInput,
  condition?: ModelPurchaseOrderLineConditionInput | null,
};

export type CreatePurchaseOrderLineMutation = {
  createPurchaseOrderLine?:  {
    __typename: "PurchaseOrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    unitPrice?: number | null,
    quantity?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderLineProductId?: string | null,
  } | null,
};

export type UpdatePurchaseOrderLineMutationVariables = {
  input: UpdatePurchaseOrderLineInput,
  condition?: ModelPurchaseOrderLineConditionInput | null,
};

export type UpdatePurchaseOrderLineMutation = {
  updatePurchaseOrderLine?:  {
    __typename: "PurchaseOrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    unitPrice?: number | null,
    quantity?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderLineProductId?: string | null,
  } | null,
};

export type DeletePurchaseOrderLineMutationVariables = {
  input: DeletePurchaseOrderLineInput,
  condition?: ModelPurchaseOrderLineConditionInput | null,
};

export type DeletePurchaseOrderLineMutation = {
  deletePurchaseOrderLine?:  {
    __typename: "PurchaseOrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    unitPrice?: number | null,
    quantity?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderLineProductId?: string | null,
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
    name: string,
    address: string,
    city: string,
    state: string,
    country: string,
    phone: string,
    email: string,
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
    country: string,
    phone: string,
    email: string,
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
    country: string,
    phone: string,
    email: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateSupplierMutationVariables = {
  input: CreateSupplierInput,
  condition?: ModelSupplierConditionInput | null,
};

export type CreateSupplierMutation = {
  createSupplier?:  {
    __typename: "Supplier",
    id: string,
    code?: string | null,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateSupplierMutationVariables = {
  input: UpdateSupplierInput,
  condition?: ModelSupplierConditionInput | null,
};

export type UpdateSupplierMutation = {
  updateSupplier?:  {
    __typename: "Supplier",
    id: string,
    code?: string | null,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteSupplierMutationVariables = {
  input: DeleteSupplierInput,
  condition?: ModelSupplierConditionInput | null,
};

export type DeleteSupplierMutation = {
  deleteSupplier?:  {
    __typename: "Supplier",
    id: string,
    code?: string | null,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type CreateStockMutationVariables = {
  input: CreateStockInput,
  condition?: ModelStockConditionInput | null,
};

export type CreateStockMutation = {
  createStock?:  {
    __typename: "Stock",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    updatedAt?: string | null,
    createdAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    stockProductId?: string | null,
  } | null,
};

export type UpdateStockMutationVariables = {
  input: UpdateStockInput,
  condition?: ModelStockConditionInput | null,
};

export type UpdateStockMutation = {
  updateStock?:  {
    __typename: "Stock",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    updatedAt?: string | null,
    createdAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    stockProductId?: string | null,
  } | null,
};

export type DeleteStockMutationVariables = {
  input: DeleteStockInput,
  condition?: ModelStockConditionInput | null,
};

export type DeleteStockMutation = {
  deleteStock?:  {
    __typename: "Stock",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    updatedAt?: string | null,
    createdAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    stockProductId?: string | null,
  } | null,
};

export type CreateTagMutationVariables = {
  input: CreateTagInput,
  condition?: ModelTagConditionInput | null,
};

export type CreateTagMutation = {
  createTag?:  {
    __typename: "Tag",
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdateTagMutationVariables = {
  input: UpdateTagInput,
  condition?: ModelTagConditionInput | null,
};

export type UpdateTagMutation = {
  updateTag?:  {
    __typename: "Tag",
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeleteTagMutationVariables = {
  input: DeleteTagInput,
  condition?: ModelTagConditionInput | null,
};

export type DeleteTagMutation = {
  deleteTag?:  {
    __typename: "Tag",
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
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

export type GetOrderQueryVariables = {
  id: string,
};

export type GetOrderQuery = {
  getOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    OrderItems?:  {
      __typename: "ModelOrderLineConnection",
      nextToken?: string | null,
      startedAt?: number | null,
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
      subtotal: number,
      tax: number,
      total: number,
      status: OrderStatus,
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
      subtotal: number,
      tax: number,
      total: number,
      status: OrderStatus,
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

export type GetOrderLineQueryVariables = {
  id: string,
};

export type GetOrderLineQuery = {
  getOrderLine?:  {
    __typename: "OrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    tax: number,
    discountType?: string | null,
    discountValue?: number | null,
    orderID: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderLineProductId?: string | null,
  } | null,
};

export type ListOrderLinesQueryVariables = {
  filter?: ModelOrderLineFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListOrderLinesQuery = {
  listOrderLines?:  {
    __typename: "ModelOrderLineConnection",
    items:  Array< {
      __typename: "OrderLine",
      id: string,
      quantity: number,
      tax: number,
      discountType?: string | null,
      discountValue?: number | null,
      orderID: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      orderLineProductId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncOrderLinesQueryVariables = {
  filter?: ModelOrderLineFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncOrderLinesQuery = {
  syncOrderLines?:  {
    __typename: "ModelOrderLineConnection",
    items:  Array< {
      __typename: "OrderLine",
      id: string,
      quantity: number,
      tax: number,
      discountType?: string | null,
      discountValue?: number | null,
      orderID: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      orderLineProductId?: string | null,
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
    trackStock: boolean,
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
    UnitOfMeasure?:  {
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
    productUnitOfMeasureId?: string | null,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetPurchaseOrderQueryVariables = {
  id: string,
};

export type GetPurchaseOrderQuery = {
  getPurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    Supplier?:  {
      __typename: "Supplier",
      id: string,
      code?: string | null,
      name: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    purchaseDate?: string | null,
    amount?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderSupplierId?: string | null,
  } | null,
};

export type ListPurchaseOrdersQueryVariables = {
  filter?: ModelPurchaseOrderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPurchaseOrdersQuery = {
  listPurchaseOrders?:  {
    __typename: "ModelPurchaseOrderConnection",
    items:  Array< {
      __typename: "PurchaseOrder",
      id: string,
      purchaseDate?: string | null,
      amount?: number | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      purchaseOrderSupplierId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncPurchaseOrdersQueryVariables = {
  filter?: ModelPurchaseOrderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncPurchaseOrdersQuery = {
  syncPurchaseOrders?:  {
    __typename: "ModelPurchaseOrderConnection",
    items:  Array< {
      __typename: "PurchaseOrder",
      id: string,
      purchaseDate?: string | null,
      amount?: number | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      purchaseOrderSupplierId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetPurchaseOrderLineQueryVariables = {
  id: string,
};

export type GetPurchaseOrderLineQuery = {
  getPurchaseOrderLine?:  {
    __typename: "PurchaseOrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    unitPrice?: number | null,
    quantity?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderLineProductId?: string | null,
  } | null,
};

export type ListPurchaseOrderLinesQueryVariables = {
  filter?: ModelPurchaseOrderLineFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPurchaseOrderLinesQuery = {
  listPurchaseOrderLines?:  {
    __typename: "ModelPurchaseOrderLineConnection",
    items:  Array< {
      __typename: "PurchaseOrderLine",
      id: string,
      unitPrice?: number | null,
      quantity?: number | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      purchaseOrderLineProductId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncPurchaseOrderLinesQueryVariables = {
  filter?: ModelPurchaseOrderLineFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncPurchaseOrderLinesQuery = {
  syncPurchaseOrderLines?:  {
    __typename: "ModelPurchaseOrderLineConnection",
    items:  Array< {
      __typename: "PurchaseOrderLine",
      id: string,
      unitPrice?: number | null,
      quantity?: number | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      purchaseOrderLineProductId?: string | null,
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
    name: string,
    address: string,
    city: string,
    state: string,
    country: string,
    phone: string,
    email: string,
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
      country: string,
      phone: string,
      email: string,
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
      country: string,
      phone: string,
      email: string,
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

export type GetSupplierQueryVariables = {
  id: string,
};

export type GetSupplierQuery = {
  getSupplier?:  {
    __typename: "Supplier",
    id: string,
    code?: string | null,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListSuppliersQueryVariables = {
  filter?: ModelSupplierFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSuppliersQuery = {
  listSuppliers?:  {
    __typename: "ModelSupplierConnection",
    items:  Array< {
      __typename: "Supplier",
      id: string,
      code?: string | null,
      name: string,
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

export type SyncSuppliersQueryVariables = {
  filter?: ModelSupplierFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncSuppliersQuery = {
  syncSuppliers?:  {
    __typename: "ModelSupplierConnection",
    items:  Array< {
      __typename: "Supplier",
      id: string,
      code?: string | null,
      name: string,
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

export type GetStockQueryVariables = {
  id: string,
};

export type GetStockQuery = {
  getStock?:  {
    __typename: "Stock",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    updatedAt?: string | null,
    createdAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    stockProductId?: string | null,
  } | null,
};

export type ListStocksQueryVariables = {
  filter?: ModelStockFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListStocksQuery = {
  listStocks?:  {
    __typename: "ModelStockConnection",
    items:  Array< {
      __typename: "Stock",
      id: string,
      quantity: number,
      updatedAt?: string | null,
      createdAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      stockProductId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncStocksQueryVariables = {
  filter?: ModelStockFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncStocksQuery = {
  syncStocks?:  {
    __typename: "ModelStockConnection",
    items:  Array< {
      __typename: "Stock",
      id: string,
      quantity: number,
      updatedAt?: string | null,
      createdAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      stockProductId?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetTagQueryVariables = {
  id: string,
};

export type GetTagQuery = {
  getTag?:  {
    __typename: "Tag",
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListTagsQueryVariables = {
  filter?: ModelTagFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTagsQuery = {
  listTags?:  {
    __typename: "ModelTagConnection",
    items:  Array< {
      __typename: "Tag",
      id: string,
      name: string,
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

export type SyncTagsQueryVariables = {
  filter?: ModelTagFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncTagsQuery = {
  syncTags?:  {
    __typename: "ModelTagConnection",
    items:  Array< {
      __typename: "Tag",
      id: string,
      name: string,
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

export type OnCreateOrderSubscription = {
  onCreateOrder?:  {
    __typename: "Order",
    id: string,
    orderNo: string,
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    OrderItems?:  {
      __typename: "ModelOrderLineConnection",
      nextToken?: string | null,
      startedAt?: number | null,
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
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    OrderItems?:  {
      __typename: "ModelOrderLineConnection",
      nextToken?: string | null,
      startedAt?: number | null,
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
    subtotal: number,
    tax: number,
    total: number,
    status: OrderStatus,
    OrderItems?:  {
      __typename: "ModelOrderLineConnection",
      nextToken?: string | null,
      startedAt?: number | null,
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

export type OnCreateOrderLineSubscription = {
  onCreateOrderLine?:  {
    __typename: "OrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    tax: number,
    discountType?: string | null,
    discountValue?: number | null,
    orderID: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderLineProductId?: string | null,
  } | null,
};

export type OnUpdateOrderLineSubscription = {
  onUpdateOrderLine?:  {
    __typename: "OrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    tax: number,
    discountType?: string | null,
    discountValue?: number | null,
    orderID: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderLineProductId?: string | null,
  } | null,
};

export type OnDeleteOrderLineSubscription = {
  onDeleteOrderLine?:  {
    __typename: "OrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    tax: number,
    discountType?: string | null,
    discountValue?: number | null,
    orderID: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    orderLineProductId?: string | null,
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
    trackStock: boolean,
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
    UnitOfMeasure?:  {
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
    productUnitOfMeasureId?: string | null,
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
    trackStock: boolean,
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
    UnitOfMeasure?:  {
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
    productUnitOfMeasureId?: string | null,
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
    trackStock: boolean,
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
    UnitOfMeasure?:  {
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
    productUnitOfMeasureId?: string | null,
    productBrandId?: string | null,
  } | null,
};

export type OnCreatePurchaseOrderSubscription = {
  onCreatePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    Supplier?:  {
      __typename: "Supplier",
      id: string,
      code?: string | null,
      name: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    purchaseDate?: string | null,
    amount?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderSupplierId?: string | null,
  } | null,
};

export type OnUpdatePurchaseOrderSubscription = {
  onUpdatePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    Supplier?:  {
      __typename: "Supplier",
      id: string,
      code?: string | null,
      name: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    purchaseDate?: string | null,
    amount?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderSupplierId?: string | null,
  } | null,
};

export type OnDeletePurchaseOrderSubscription = {
  onDeletePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    Supplier?:  {
      __typename: "Supplier",
      id: string,
      code?: string | null,
      name: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null,
    purchaseDate?: string | null,
    amount?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderSupplierId?: string | null,
  } | null,
};

export type OnCreatePurchaseOrderLineSubscription = {
  onCreatePurchaseOrderLine?:  {
    __typename: "PurchaseOrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    unitPrice?: number | null,
    quantity?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderLineProductId?: string | null,
  } | null,
};

export type OnUpdatePurchaseOrderLineSubscription = {
  onUpdatePurchaseOrderLine?:  {
    __typename: "PurchaseOrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    unitPrice?: number | null,
    quantity?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderLineProductId?: string | null,
  } | null,
};

export type OnDeletePurchaseOrderLineSubscription = {
  onDeletePurchaseOrderLine?:  {
    __typename: "PurchaseOrderLine",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    unitPrice?: number | null,
    quantity?: number | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    purchaseOrderLineProductId?: string | null,
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
    country: string,
    phone: string,
    email: string,
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
    country: string,
    phone: string,
    email: string,
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
    country: string,
    phone: string,
    email: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateSupplierSubscription = {
  onCreateSupplier?:  {
    __typename: "Supplier",
    id: string,
    code?: string | null,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateSupplierSubscription = {
  onUpdateSupplier?:  {
    __typename: "Supplier",
    id: string,
    code?: string | null,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteSupplierSubscription = {
  onDeleteSupplier?:  {
    __typename: "Supplier",
    id: string,
    code?: string | null,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnCreateStockSubscription = {
  onCreateStock?:  {
    __typename: "Stock",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    updatedAt?: string | null,
    createdAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    stockProductId?: string | null,
  } | null,
};

export type OnUpdateStockSubscription = {
  onUpdateStock?:  {
    __typename: "Stock",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    updatedAt?: string | null,
    createdAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    stockProductId?: string | null,
  } | null,
};

export type OnDeleteStockSubscription = {
  onDeleteStock?:  {
    __typename: "Stock",
    id: string,
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
      trackStock: boolean,
      isActive?: boolean | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      productCategoryId?: string | null,
      productUnitOfMeasureId?: string | null,
      productBrandId?: string | null,
    } | null,
    quantity: number,
    updatedAt?: string | null,
    createdAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    stockProductId?: string | null,
  } | null,
};

export type OnCreateTagSubscription = {
  onCreateTag?:  {
    __typename: "Tag",
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdateTagSubscription = {
  onUpdateTag?:  {
    __typename: "Tag",
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeleteTagSubscription = {
  onDeleteTag?:  {
    __typename: "Tag",
    id: string,
    name: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
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
