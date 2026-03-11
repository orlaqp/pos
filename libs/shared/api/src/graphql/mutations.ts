/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createStore = /* GraphQL */ `mutation CreateStore(
  $input: CreateStoreInput!
  $condition: ModelStoreConditionInput
) {
  createStore(input: $input, condition: $condition) {
    id
    name
    address
    city
    state
    zipCode
    country
    phone
    fax
    email
    disclaimer
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateStoreMutationVariables,
  APITypes.CreateStoreMutation
>;
export const updateStore = /* GraphQL */ `mutation UpdateStore(
  $input: UpdateStoreInput!
  $condition: ModelStoreConditionInput
) {
  updateStore(input: $input, condition: $condition) {
    id
    name
    address
    city
    state
    zipCode
    country
    phone
    fax
    email
    disclaimer
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateStoreMutationVariables,
  APITypes.UpdateStoreMutation
>;
export const deleteStore = /* GraphQL */ `mutation DeleteStore(
  $input: DeleteStoreInput!
  $condition: ModelStoreConditionInput
) {
  deleteStore(input: $input, condition: $condition) {
    id
    name
    address
    city
    state
    zipCode
    country
    phone
    fax
    email
    disclaimer
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteStoreMutationVariables,
  APITypes.DeleteStoreMutation
>;
export const createBrand = /* GraphQL */ `mutation CreateBrand(
  $input: CreateBrandInput!
  $condition: ModelBrandConditionInput
) {
  createBrand(input: $input, condition: $condition) {
    id
    name
    description
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateBrandMutationVariables,
  APITypes.CreateBrandMutation
>;
export const updateBrand = /* GraphQL */ `mutation UpdateBrand(
  $input: UpdateBrandInput!
  $condition: ModelBrandConditionInput
) {
  updateBrand(input: $input, condition: $condition) {
    id
    name
    description
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateBrandMutationVariables,
  APITypes.UpdateBrandMutation
>;
export const deleteBrand = /* GraphQL */ `mutation DeleteBrand(
  $input: DeleteBrandInput!
  $condition: ModelBrandConditionInput
) {
  deleteBrand(input: $input, condition: $condition) {
    id
    name
    description
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteBrandMutationVariables,
  APITypes.DeleteBrandMutation
>;
export const createCategory = /* GraphQL */ `mutation CreateCategory(
  $input: CreateCategoryInput!
  $condition: ModelCategoryConditionInput
) {
  createCategory(input: $input, condition: $condition) {
    id
    name
    description
    code
    color
    picture
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateCategoryMutationVariables,
  APITypes.CreateCategoryMutation
>;
export const updateCategory = /* GraphQL */ `mutation UpdateCategory(
  $input: UpdateCategoryInput!
  $condition: ModelCategoryConditionInput
) {
  updateCategory(input: $input, condition: $condition) {
    id
    name
    description
    code
    color
    picture
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateCategoryMutationVariables,
  APITypes.UpdateCategoryMutation
>;
export const deleteCategory = /* GraphQL */ `mutation DeleteCategory(
  $input: DeleteCategoryInput!
  $condition: ModelCategoryConditionInput
) {
  deleteCategory(input: $input, condition: $condition) {
    id
    name
    description
    code
    color
    picture
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteCategoryMutationVariables,
  APITypes.DeleteCategoryMutation
>;
export const createCustomer = /* GraphQL */ `mutation CreateCustomer(
  $input: CreateCustomerInput!
  $condition: ModelCustomerConditionInput
) {
  createCustomer(input: $input, condition: $condition) {
    id
    firstName
    lastName
    middleName
    dob
    phone
    email
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateCustomerMutationVariables,
  APITypes.CreateCustomerMutation
>;
export const updateCustomer = /* GraphQL */ `mutation UpdateCustomer(
  $input: UpdateCustomerInput!
  $condition: ModelCustomerConditionInput
) {
  updateCustomer(input: $input, condition: $condition) {
    id
    firstName
    lastName
    middleName
    dob
    phone
    email
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateCustomerMutationVariables,
  APITypes.UpdateCustomerMutation
>;
export const deleteCustomer = /* GraphQL */ `mutation DeleteCustomer(
  $input: DeleteCustomerInput!
  $condition: ModelCustomerConditionInput
) {
  deleteCustomer(input: $input, condition: $condition) {
    id
    firstName
    lastName
    middleName
    dob
    phone
    email
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteCustomerMutationVariables,
  APITypes.DeleteCustomerMutation
>;
export const createEmployee = /* GraphQL */ `mutation CreateEmployee(
  $input: CreateEmployeeInput!
  $condition: ModelEmployeeConditionInput
) {
  createEmployee(input: $input, condition: $condition) {
    id
    code
    firstName
    lastName
    middleName
    dob
    phone
    email
    pin
    roles
    active
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateEmployeeMutationVariables,
  APITypes.CreateEmployeeMutation
>;
export const updateEmployee = /* GraphQL */ `mutation UpdateEmployee(
  $input: UpdateEmployeeInput!
  $condition: ModelEmployeeConditionInput
) {
  updateEmployee(input: $input, condition: $condition) {
    id
    code
    firstName
    lastName
    middleName
    dob
    phone
    email
    pin
    roles
    active
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateEmployeeMutationVariables,
  APITypes.UpdateEmployeeMutation
>;
export const deleteEmployee = /* GraphQL */ `mutation DeleteEmployee(
  $input: DeleteEmployeeInput!
  $condition: ModelEmployeeConditionInput
) {
  deleteEmployee(input: $input, condition: $condition) {
    id
    code
    firstName
    lastName
    middleName
    dob
    phone
    email
    pin
    roles
    active
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteEmployeeMutationVariables,
  APITypes.DeleteEmployeeMutation
>;
export const createOrder = /* GraphQL */ `mutation CreateOrder(
  $input: CreateOrderInput!
  $condition: ModelOrderConditionInput
) {
  createOrder(input: $input, condition: $condition) {
    id
    orderNo
    orderDate
    subtotal
    tax
    total
    status
    employeeId
    employeeName
    lines {
      identifier
      productId
      productName
      unitOfMeasure
      barcode
      sku
      quantity
      tax
      price
      isEBTEligible
      ebtPaidAmount
      nonEbtPaidAmount
      __typename
    }
    paymentInfo {
      employeeId
      employeeName
      __typename
    }
    refundInfo {
      employeeId
      employeeName
      comments
      __typename
    }
    createdBy {
      id
      name
      __typename
    }
    updatedBy {
      id
      name
      __typename
    }
    Customer {
      id
      firstName
      lastName
      middleName
      dob
      phone
      email
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    orderCustomerId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateOrderMutationVariables,
  APITypes.CreateOrderMutation
>;
export const updateOrder = /* GraphQL */ `mutation UpdateOrder(
  $input: UpdateOrderInput!
  $condition: ModelOrderConditionInput
) {
  updateOrder(input: $input, condition: $condition) {
    id
    orderNo
    orderDate
    subtotal
    tax
    total
    status
    employeeId
    employeeName
    lines {
      identifier
      productId
      productName
      unitOfMeasure
      barcode
      sku
      quantity
      tax
      price
      isEBTEligible
      ebtPaidAmount
      nonEbtPaidAmount
      __typename
    }
    paymentInfo {
      employeeId
      employeeName
      __typename
    }
    refundInfo {
      employeeId
      employeeName
      comments
      __typename
    }
    createdBy {
      id
      name
      __typename
    }
    updatedBy {
      id
      name
      __typename
    }
    Customer {
      id
      firstName
      lastName
      middleName
      dob
      phone
      email
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    orderCustomerId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateOrderMutationVariables,
  APITypes.UpdateOrderMutation
>;
export const deleteOrder = /* GraphQL */ `mutation DeleteOrder(
  $input: DeleteOrderInput!
  $condition: ModelOrderConditionInput
) {
  deleteOrder(input: $input, condition: $condition) {
    id
    orderNo
    orderDate
    subtotal
    tax
    total
    status
    employeeId
    employeeName
    lines {
      identifier
      productId
      productName
      unitOfMeasure
      barcode
      sku
      quantity
      tax
      price
      isEBTEligible
      ebtPaidAmount
      nonEbtPaidAmount
      __typename
    }
    paymentInfo {
      employeeId
      employeeName
      __typename
    }
    refundInfo {
      employeeId
      employeeName
      comments
      __typename
    }
    createdBy {
      id
      name
      __typename
    }
    updatedBy {
      id
      name
      __typename
    }
    Customer {
      id
      firstName
      lastName
      middleName
      dob
      phone
      email
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    orderCustomerId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteOrderMutationVariables,
  APITypes.DeleteOrderMutation
>;
export const createProduct = /* GraphQL */ `mutation CreateProduct(
  $input: CreateProductInput!
  $condition: ModelProductConditionInput
) {
  createProduct(input: $input, condition: $condition) {
    id
    name
    description
    price
    tags
    cost
    barcode
    sku
    plu
    quantity
    unitOfMeasure
    trackStock
    reorderPoint
    reorderQuantity
    picture
    Category {
      id
      name
      description
      code
      color
      picture
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    Brand {
      id
      name
      description
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    isActive
    isEBTEligible
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    productCategoryId
    productBrandId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateProductMutationVariables,
  APITypes.CreateProductMutation
>;
export const updateProduct = /* GraphQL */ `mutation UpdateProduct(
  $input: UpdateProductInput!
  $condition: ModelProductConditionInput
) {
  updateProduct(input: $input, condition: $condition) {
    id
    name
    description
    price
    tags
    cost
    barcode
    sku
    plu
    quantity
    unitOfMeasure
    trackStock
    reorderPoint
    reorderQuantity
    picture
    Category {
      id
      name
      description
      code
      color
      picture
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    Brand {
      id
      name
      description
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    isActive
    isEBTEligible
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    productCategoryId
    productBrandId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateProductMutationVariables,
  APITypes.UpdateProductMutation
>;
export const deleteProduct = /* GraphQL */ `mutation DeleteProduct(
  $input: DeleteProductInput!
  $condition: ModelProductConditionInput
) {
  deleteProduct(input: $input, condition: $condition) {
    id
    name
    description
    price
    tags
    cost
    barcode
    sku
    plu
    quantity
    unitOfMeasure
    trackStock
    reorderPoint
    reorderQuantity
    picture
    Category {
      id
      name
      description
      code
      color
      picture
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    Brand {
      id
      name
      description
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    isActive
    isEBTEligible
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    productCategoryId
    productBrandId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteProductMutationVariables,
  APITypes.DeleteProductMutation
>;
export const createUnitOfMeasure = /* GraphQL */ `mutation CreateUnitOfMeasure(
  $input: CreateUnitOfMeasureInput!
  $condition: ModelUnitOfMeasureConditionInput
) {
  createUnitOfMeasure(input: $input, condition: $condition) {
    id
    name
    description
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUnitOfMeasureMutationVariables,
  APITypes.CreateUnitOfMeasureMutation
>;
export const updateUnitOfMeasure = /* GraphQL */ `mutation UpdateUnitOfMeasure(
  $input: UpdateUnitOfMeasureInput!
  $condition: ModelUnitOfMeasureConditionInput
) {
  updateUnitOfMeasure(input: $input, condition: $condition) {
    id
    name
    description
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUnitOfMeasureMutationVariables,
  APITypes.UpdateUnitOfMeasureMutation
>;
export const deleteUnitOfMeasure = /* GraphQL */ `mutation DeleteUnitOfMeasure(
  $input: DeleteUnitOfMeasureInput!
  $condition: ModelUnitOfMeasureConditionInput
) {
  deleteUnitOfMeasure(input: $input, condition: $condition) {
    id
    name
    description
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUnitOfMeasureMutationVariables,
  APITypes.DeleteUnitOfMeasureMutation
>;
export const createInventoryChanges = /* GraphQL */ `mutation CreateInventoryChanges(
  $input: CreateInventoryChangesInput!
  $condition: ModelInventoryChangesConditionInput
) {
  createInventoryChanges(input: $input, condition: $condition) {
    id
    timestamp
    type
    typeId
    quantityIn
    quantityOut
    Product {
      id
      name
      description
      price
      tags
      cost
      barcode
      sku
      plu
      quantity
      unitOfMeasure
      trackStock
      reorderPoint
      reorderQuantity
      picture
      isActive
      isEBTEligible
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      productCategoryId
      productBrandId
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    inventoryChangesProductId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateInventoryChangesMutationVariables,
  APITypes.CreateInventoryChangesMutation
>;
export const updateInventoryChanges = /* GraphQL */ `mutation UpdateInventoryChanges(
  $input: UpdateInventoryChangesInput!
  $condition: ModelInventoryChangesConditionInput
) {
  updateInventoryChanges(input: $input, condition: $condition) {
    id
    timestamp
    type
    typeId
    quantityIn
    quantityOut
    Product {
      id
      name
      description
      price
      tags
      cost
      barcode
      sku
      plu
      quantity
      unitOfMeasure
      trackStock
      reorderPoint
      reorderQuantity
      picture
      isActive
      isEBTEligible
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      productCategoryId
      productBrandId
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    inventoryChangesProductId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateInventoryChangesMutationVariables,
  APITypes.UpdateInventoryChangesMutation
>;
export const deleteInventoryChanges = /* GraphQL */ `mutation DeleteInventoryChanges(
  $input: DeleteInventoryChangesInput!
  $condition: ModelInventoryChangesConditionInput
) {
  deleteInventoryChanges(input: $input, condition: $condition) {
    id
    timestamp
    type
    typeId
    quantityIn
    quantityOut
    Product {
      id
      name
      description
      price
      tags
      cost
      barcode
      sku
      plu
      quantity
      unitOfMeasure
      trackStock
      reorderPoint
      reorderQuantity
      picture
      isActive
      isEBTEligible
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      productCategoryId
      productBrandId
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    inventoryChangesProductId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteInventoryChangesMutationVariables,
  APITypes.DeleteInventoryChangesMutation
>;
export const createInventoryCount = /* GraphQL */ `mutation CreateInventoryCount(
  $input: CreateInventoryCountInput!
  $condition: ModelInventoryCountConditionInput
) {
  createInventoryCount(input: $input, condition: $condition) {
    id
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateInventoryCountMutationVariables,
  APITypes.CreateInventoryCountMutation
>;
export const updateInventoryCount = /* GraphQL */ `mutation UpdateInventoryCount(
  $input: UpdateInventoryCountInput!
  $condition: ModelInventoryCountConditionInput
) {
  updateInventoryCount(input: $input, condition: $condition) {
    id
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateInventoryCountMutationVariables,
  APITypes.UpdateInventoryCountMutation
>;
export const deleteInventoryCount = /* GraphQL */ `mutation DeleteInventoryCount(
  $input: DeleteInventoryCountInput!
  $condition: ModelInventoryCountConditionInput
) {
  deleteInventoryCount(input: $input, condition: $condition) {
    id
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteInventoryCountMutationVariables,
  APITypes.DeleteInventoryCountMutation
>;
export const createInventoryCountLine = /* GraphQL */ `mutation CreateInventoryCountLine(
  $input: CreateInventoryCountLineInput!
  $condition: ModelInventoryCountLineConditionInput
) {
  createInventoryCountLine(input: $input, condition: $condition) {
    id
    productId
    productName
    unitOfMeasure
    current
    newCount
    comments
    InventoryCount {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    inventoryCountLineInventoryCountId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateInventoryCountLineMutationVariables,
  APITypes.CreateInventoryCountLineMutation
>;
export const updateInventoryCountLine = /* GraphQL */ `mutation UpdateInventoryCountLine(
  $input: UpdateInventoryCountLineInput!
  $condition: ModelInventoryCountLineConditionInput
) {
  updateInventoryCountLine(input: $input, condition: $condition) {
    id
    productId
    productName
    unitOfMeasure
    current
    newCount
    comments
    InventoryCount {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    inventoryCountLineInventoryCountId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateInventoryCountLineMutationVariables,
  APITypes.UpdateInventoryCountLineMutation
>;
export const deleteInventoryCountLine = /* GraphQL */ `mutation DeleteInventoryCountLine(
  $input: DeleteInventoryCountLineInput!
  $condition: ModelInventoryCountLineConditionInput
) {
  deleteInventoryCountLine(input: $input, condition: $condition) {
    id
    productId
    productName
    unitOfMeasure
    current
    newCount
    comments
    InventoryCount {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    inventoryCountLineInventoryCountId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteInventoryCountLineMutationVariables,
  APITypes.DeleteInventoryCountLineMutation
>;
export const createInventoryReceive = /* GraphQL */ `mutation CreateInventoryReceive(
  $input: CreateInventoryReceiveInput!
  $condition: ModelInventoryReceiveConditionInput
) {
  createInventoryReceive(input: $input, condition: $condition) {
    id
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateInventoryReceiveMutationVariables,
  APITypes.CreateInventoryReceiveMutation
>;
export const updateInventoryReceive = /* GraphQL */ `mutation UpdateInventoryReceive(
  $input: UpdateInventoryReceiveInput!
  $condition: ModelInventoryReceiveConditionInput
) {
  updateInventoryReceive(input: $input, condition: $condition) {
    id
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateInventoryReceiveMutationVariables,
  APITypes.UpdateInventoryReceiveMutation
>;
export const deleteInventoryReceive = /* GraphQL */ `mutation DeleteInventoryReceive(
  $input: DeleteInventoryReceiveInput!
  $condition: ModelInventoryReceiveConditionInput
) {
  deleteInventoryReceive(input: $input, condition: $condition) {
    id
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteInventoryReceiveMutationVariables,
  APITypes.DeleteInventoryReceiveMutation
>;
export const createInventoryReceiveLine = /* GraphQL */ `mutation CreateInventoryReceiveLine(
  $input: CreateInventoryReceiveLineInput!
  $condition: ModelInventoryReceiveLineConditionInput
) {
  createInventoryReceiveLine(input: $input, condition: $condition) {
    id
    productId
    productName
    unitOfMeasure
    received
    comments
    InventoryReceive {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    inventoryReceiveLineInventoryReceiveId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateInventoryReceiveLineMutationVariables,
  APITypes.CreateInventoryReceiveLineMutation
>;
export const updateInventoryReceiveLine = /* GraphQL */ `mutation UpdateInventoryReceiveLine(
  $input: UpdateInventoryReceiveLineInput!
  $condition: ModelInventoryReceiveLineConditionInput
) {
  updateInventoryReceiveLine(input: $input, condition: $condition) {
    id
    productId
    productName
    unitOfMeasure
    received
    comments
    InventoryReceive {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    inventoryReceiveLineInventoryReceiveId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateInventoryReceiveLineMutationVariables,
  APITypes.UpdateInventoryReceiveLineMutation
>;
export const deleteInventoryReceiveLine = /* GraphQL */ `mutation DeleteInventoryReceiveLine(
  $input: DeleteInventoryReceiveLineInput!
  $condition: ModelInventoryReceiveLineConditionInput
) {
  deleteInventoryReceiveLine(input: $input, condition: $condition) {
    id
    productId
    productName
    unitOfMeasure
    received
    comments
    InventoryReceive {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    inventoryReceiveLineInventoryReceiveId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteInventoryReceiveLineMutationVariables,
  APITypes.DeleteInventoryReceiveLineMutation
>;
export const createPrinter = /* GraphQL */ `mutation CreatePrinter(
  $input: CreatePrinterInput!
  $condition: ModelPrinterConditionInput
) {
  createPrinter(input: $input, condition: $condition) {
    id
    deviceId
    identifier
    interfaceType
    ip
    model
    alias
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreatePrinterMutationVariables,
  APITypes.CreatePrinterMutation
>;
export const updatePrinter = /* GraphQL */ `mutation UpdatePrinter(
  $input: UpdatePrinterInput!
  $condition: ModelPrinterConditionInput
) {
  updatePrinter(input: $input, condition: $condition) {
    id
    deviceId
    identifier
    interfaceType
    ip
    model
    alias
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdatePrinterMutationVariables,
  APITypes.UpdatePrinterMutation
>;
export const deletePrinter = /* GraphQL */ `mutation DeletePrinter(
  $input: DeletePrinterInput!
  $condition: ModelPrinterConditionInput
) {
  deletePrinter(input: $input, condition: $condition) {
    id
    deviceId
    identifier
    interfaceType
    ip
    model
    alias
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeletePrinterMutationVariables,
  APITypes.DeletePrinterMutation
>;
export const createStation = /* GraphQL */ `mutation CreateStation(
  $input: CreateStationInput!
  $condition: ModelStationConditionInput
) {
  createStation(input: $input, condition: $condition) {
    id
    deviceId
    alias
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateStationMutationVariables,
  APITypes.CreateStationMutation
>;
export const updateStation = /* GraphQL */ `mutation UpdateStation(
  $input: UpdateStationInput!
  $condition: ModelStationConditionInput
) {
  updateStation(input: $input, condition: $condition) {
    id
    deviceId
    alias
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateStationMutationVariables,
  APITypes.UpdateStationMutation
>;
export const deleteStation = /* GraphQL */ `mutation DeleteStation(
  $input: DeleteStationInput!
  $condition: ModelStationConditionInput
) {
  deleteStation(input: $input, condition: $condition) {
    id
    deviceId
    alias
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteStationMutationVariables,
  APITypes.DeleteStationMutation
>;
export const createGlobalSettings = /* GraphQL */ `mutation CreateGlobalSettings(
  $input: CreateGlobalSettingsInput!
  $condition: ModelGlobalSettingsConditionInput
) {
  createGlobalSettings(input: $input, condition: $condition) {
    enforceSalesBasedOnInventory
    id
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateGlobalSettingsMutationVariables,
  APITypes.CreateGlobalSettingsMutation
>;
export const updateGlobalSettings = /* GraphQL */ `mutation UpdateGlobalSettings(
  $input: UpdateGlobalSettingsInput!
  $condition: ModelGlobalSettingsConditionInput
) {
  updateGlobalSettings(input: $input, condition: $condition) {
    enforceSalesBasedOnInventory
    id
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateGlobalSettingsMutationVariables,
  APITypes.UpdateGlobalSettingsMutation
>;
export const deleteGlobalSettings = /* GraphQL */ `mutation DeleteGlobalSettings(
  $input: DeleteGlobalSettingsInput!
  $condition: ModelGlobalSettingsConditionInput
) {
  deleteGlobalSettings(input: $input, condition: $condition) {
    enforceSalesBasedOnInventory
    id
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteGlobalSettingsMutationVariables,
  APITypes.DeleteGlobalSettingsMutation
>;
