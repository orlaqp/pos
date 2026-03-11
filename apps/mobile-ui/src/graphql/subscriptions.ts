/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateStore = /* GraphQL */ `subscription OnCreateStore($filter: ModelSubscriptionStoreFilterInput) {
  onCreateStore(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateStoreSubscriptionVariables,
  APITypes.OnCreateStoreSubscription
>;
export const onUpdateStore = /* GraphQL */ `subscription OnUpdateStore($filter: ModelSubscriptionStoreFilterInput) {
  onUpdateStore(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateStoreSubscriptionVariables,
  APITypes.OnUpdateStoreSubscription
>;
export const onDeleteStore = /* GraphQL */ `subscription OnDeleteStore($filter: ModelSubscriptionStoreFilterInput) {
  onDeleteStore(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteStoreSubscriptionVariables,
  APITypes.OnDeleteStoreSubscription
>;
export const onCreateBrand = /* GraphQL */ `subscription OnCreateBrand($filter: ModelSubscriptionBrandFilterInput) {
  onCreateBrand(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateBrandSubscriptionVariables,
  APITypes.OnCreateBrandSubscription
>;
export const onUpdateBrand = /* GraphQL */ `subscription OnUpdateBrand($filter: ModelSubscriptionBrandFilterInput) {
  onUpdateBrand(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateBrandSubscriptionVariables,
  APITypes.OnUpdateBrandSubscription
>;
export const onDeleteBrand = /* GraphQL */ `subscription OnDeleteBrand($filter: ModelSubscriptionBrandFilterInput) {
  onDeleteBrand(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteBrandSubscriptionVariables,
  APITypes.OnDeleteBrandSubscription
>;
export const onCreateCategory = /* GraphQL */ `subscription OnCreateCategory($filter: ModelSubscriptionCategoryFilterInput) {
  onCreateCategory(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCategorySubscriptionVariables,
  APITypes.OnCreateCategorySubscription
>;
export const onUpdateCategory = /* GraphQL */ `subscription OnUpdateCategory($filter: ModelSubscriptionCategoryFilterInput) {
  onUpdateCategory(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCategorySubscriptionVariables,
  APITypes.OnUpdateCategorySubscription
>;
export const onDeleteCategory = /* GraphQL */ `subscription OnDeleteCategory($filter: ModelSubscriptionCategoryFilterInput) {
  onDeleteCategory(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCategorySubscriptionVariables,
  APITypes.OnDeleteCategorySubscription
>;
export const onCreateCustomer = /* GraphQL */ `subscription OnCreateCustomer($filter: ModelSubscriptionCustomerFilterInput) {
  onCreateCustomer(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCustomerSubscriptionVariables,
  APITypes.OnCreateCustomerSubscription
>;
export const onUpdateCustomer = /* GraphQL */ `subscription OnUpdateCustomer($filter: ModelSubscriptionCustomerFilterInput) {
  onUpdateCustomer(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCustomerSubscriptionVariables,
  APITypes.OnUpdateCustomerSubscription
>;
export const onDeleteCustomer = /* GraphQL */ `subscription OnDeleteCustomer($filter: ModelSubscriptionCustomerFilterInput) {
  onDeleteCustomer(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCustomerSubscriptionVariables,
  APITypes.OnDeleteCustomerSubscription
>;
export const onCreateEmployee = /* GraphQL */ `subscription OnCreateEmployee($filter: ModelSubscriptionEmployeeFilterInput) {
  onCreateEmployee(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateEmployeeSubscriptionVariables,
  APITypes.OnCreateEmployeeSubscription
>;
export const onUpdateEmployee = /* GraphQL */ `subscription OnUpdateEmployee($filter: ModelSubscriptionEmployeeFilterInput) {
  onUpdateEmployee(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateEmployeeSubscriptionVariables,
  APITypes.OnUpdateEmployeeSubscription
>;
export const onDeleteEmployee = /* GraphQL */ `subscription OnDeleteEmployee($filter: ModelSubscriptionEmployeeFilterInput) {
  onDeleteEmployee(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteEmployeeSubscriptionVariables,
  APITypes.OnDeleteEmployeeSubscription
>;
export const onCreateOrder = /* GraphQL */ `subscription OnCreateOrder($filter: ModelSubscriptionOrderFilterInput) {
  onCreateOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateOrderSubscriptionVariables,
  APITypes.OnCreateOrderSubscription
>;
export const onUpdateOrder = /* GraphQL */ `subscription OnUpdateOrder($filter: ModelSubscriptionOrderFilterInput) {
  onUpdateOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateOrderSubscriptionVariables,
  APITypes.OnUpdateOrderSubscription
>;
export const onDeleteOrder = /* GraphQL */ `subscription OnDeleteOrder($filter: ModelSubscriptionOrderFilterInput) {
  onDeleteOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteOrderSubscriptionVariables,
  APITypes.OnDeleteOrderSubscription
>;
export const onCreateProduct = /* GraphQL */ `subscription OnCreateProduct($filter: ModelSubscriptionProductFilterInput) {
  onCreateProduct(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateProductSubscriptionVariables,
  APITypes.OnCreateProductSubscription
>;
export const onUpdateProduct = /* GraphQL */ `subscription OnUpdateProduct($filter: ModelSubscriptionProductFilterInput) {
  onUpdateProduct(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateProductSubscriptionVariables,
  APITypes.OnUpdateProductSubscription
>;
export const onDeleteProduct = /* GraphQL */ `subscription OnDeleteProduct($filter: ModelSubscriptionProductFilterInput) {
  onDeleteProduct(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteProductSubscriptionVariables,
  APITypes.OnDeleteProductSubscription
>;
export const onCreateUnitOfMeasure = /* GraphQL */ `subscription OnCreateUnitOfMeasure(
  $filter: ModelSubscriptionUnitOfMeasureFilterInput
) {
  onCreateUnitOfMeasure(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUnitOfMeasureSubscriptionVariables,
  APITypes.OnCreateUnitOfMeasureSubscription
>;
export const onUpdateUnitOfMeasure = /* GraphQL */ `subscription OnUpdateUnitOfMeasure(
  $filter: ModelSubscriptionUnitOfMeasureFilterInput
) {
  onUpdateUnitOfMeasure(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUnitOfMeasureSubscriptionVariables,
  APITypes.OnUpdateUnitOfMeasureSubscription
>;
export const onDeleteUnitOfMeasure = /* GraphQL */ `subscription OnDeleteUnitOfMeasure(
  $filter: ModelSubscriptionUnitOfMeasureFilterInput
) {
  onDeleteUnitOfMeasure(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUnitOfMeasureSubscriptionVariables,
  APITypes.OnDeleteUnitOfMeasureSubscription
>;
export const onCreateInventoryChanges = /* GraphQL */ `subscription OnCreateInventoryChanges(
  $filter: ModelSubscriptionInventoryChangesFilterInput
) {
  onCreateInventoryChanges(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryChangesSubscriptionVariables,
  APITypes.OnCreateInventoryChangesSubscription
>;
export const onUpdateInventoryChanges = /* GraphQL */ `subscription OnUpdateInventoryChanges(
  $filter: ModelSubscriptionInventoryChangesFilterInput
) {
  onUpdateInventoryChanges(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryChangesSubscriptionVariables,
  APITypes.OnUpdateInventoryChangesSubscription
>;
export const onDeleteInventoryChanges = /* GraphQL */ `subscription OnDeleteInventoryChanges(
  $filter: ModelSubscriptionInventoryChangesFilterInput
) {
  onDeleteInventoryChanges(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryChangesSubscriptionVariables,
  APITypes.OnDeleteInventoryChangesSubscription
>;
export const onCreateInventoryCount = /* GraphQL */ `subscription OnCreateInventoryCount(
  $filter: ModelSubscriptionInventoryCountFilterInput
) {
  onCreateInventoryCount(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryCountSubscriptionVariables,
  APITypes.OnCreateInventoryCountSubscription
>;
export const onUpdateInventoryCount = /* GraphQL */ `subscription OnUpdateInventoryCount(
  $filter: ModelSubscriptionInventoryCountFilterInput
) {
  onUpdateInventoryCount(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryCountSubscriptionVariables,
  APITypes.OnUpdateInventoryCountSubscription
>;
export const onDeleteInventoryCount = /* GraphQL */ `subscription OnDeleteInventoryCount(
  $filter: ModelSubscriptionInventoryCountFilterInput
) {
  onDeleteInventoryCount(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryCountSubscriptionVariables,
  APITypes.OnDeleteInventoryCountSubscription
>;
export const onCreateInventoryCountLine = /* GraphQL */ `subscription OnCreateInventoryCountLine(
  $filter: ModelSubscriptionInventoryCountLineFilterInput
) {
  onCreateInventoryCountLine(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryCountLineSubscriptionVariables,
  APITypes.OnCreateInventoryCountLineSubscription
>;
export const onUpdateInventoryCountLine = /* GraphQL */ `subscription OnUpdateInventoryCountLine(
  $filter: ModelSubscriptionInventoryCountLineFilterInput
) {
  onUpdateInventoryCountLine(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryCountLineSubscriptionVariables,
  APITypes.OnUpdateInventoryCountLineSubscription
>;
export const onDeleteInventoryCountLine = /* GraphQL */ `subscription OnDeleteInventoryCountLine(
  $filter: ModelSubscriptionInventoryCountLineFilterInput
) {
  onDeleteInventoryCountLine(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryCountLineSubscriptionVariables,
  APITypes.OnDeleteInventoryCountLineSubscription
>;
export const onCreateInventoryReceive = /* GraphQL */ `subscription OnCreateInventoryReceive(
  $filter: ModelSubscriptionInventoryReceiveFilterInput
) {
  onCreateInventoryReceive(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryReceiveSubscriptionVariables,
  APITypes.OnCreateInventoryReceiveSubscription
>;
export const onUpdateInventoryReceive = /* GraphQL */ `subscription OnUpdateInventoryReceive(
  $filter: ModelSubscriptionInventoryReceiveFilterInput
) {
  onUpdateInventoryReceive(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryReceiveSubscriptionVariables,
  APITypes.OnUpdateInventoryReceiveSubscription
>;
export const onDeleteInventoryReceive = /* GraphQL */ `subscription OnDeleteInventoryReceive(
  $filter: ModelSubscriptionInventoryReceiveFilterInput
) {
  onDeleteInventoryReceive(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryReceiveSubscriptionVariables,
  APITypes.OnDeleteInventoryReceiveSubscription
>;
export const onCreateInventoryReceiveLine = /* GraphQL */ `subscription OnCreateInventoryReceiveLine(
  $filter: ModelSubscriptionInventoryReceiveLineFilterInput
) {
  onCreateInventoryReceiveLine(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryReceiveLineSubscriptionVariables,
  APITypes.OnCreateInventoryReceiveLineSubscription
>;
export const onUpdateInventoryReceiveLine = /* GraphQL */ `subscription OnUpdateInventoryReceiveLine(
  $filter: ModelSubscriptionInventoryReceiveLineFilterInput
) {
  onUpdateInventoryReceiveLine(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryReceiveLineSubscriptionVariables,
  APITypes.OnUpdateInventoryReceiveLineSubscription
>;
export const onDeleteInventoryReceiveLine = /* GraphQL */ `subscription OnDeleteInventoryReceiveLine(
  $filter: ModelSubscriptionInventoryReceiveLineFilterInput
) {
  onDeleteInventoryReceiveLine(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryReceiveLineSubscriptionVariables,
  APITypes.OnDeleteInventoryReceiveLineSubscription
>;
export const onCreatePrinter = /* GraphQL */ `subscription OnCreatePrinter($filter: ModelSubscriptionPrinterFilterInput) {
  onCreatePrinter(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreatePrinterSubscriptionVariables,
  APITypes.OnCreatePrinterSubscription
>;
export const onUpdatePrinter = /* GraphQL */ `subscription OnUpdatePrinter($filter: ModelSubscriptionPrinterFilterInput) {
  onUpdatePrinter(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdatePrinterSubscriptionVariables,
  APITypes.OnUpdatePrinterSubscription
>;
export const onDeletePrinter = /* GraphQL */ `subscription OnDeletePrinter($filter: ModelSubscriptionPrinterFilterInput) {
  onDeletePrinter(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeletePrinterSubscriptionVariables,
  APITypes.OnDeletePrinterSubscription
>;
export const onCreateStation = /* GraphQL */ `subscription OnCreateStation($filter: ModelSubscriptionStationFilterInput) {
  onCreateStation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateStationSubscriptionVariables,
  APITypes.OnCreateStationSubscription
>;
export const onUpdateStation = /* GraphQL */ `subscription OnUpdateStation($filter: ModelSubscriptionStationFilterInput) {
  onUpdateStation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateStationSubscriptionVariables,
  APITypes.OnUpdateStationSubscription
>;
export const onDeleteStation = /* GraphQL */ `subscription OnDeleteStation($filter: ModelSubscriptionStationFilterInput) {
  onDeleteStation(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteStationSubscriptionVariables,
  APITypes.OnDeleteStationSubscription
>;
export const onCreateGlobalSettings = /* GraphQL */ `subscription OnCreateGlobalSettings(
  $filter: ModelSubscriptionGlobalSettingsFilterInput
) {
  onCreateGlobalSettings(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateGlobalSettingsSubscriptionVariables,
  APITypes.OnCreateGlobalSettingsSubscription
>;
export const onUpdateGlobalSettings = /* GraphQL */ `subscription OnUpdateGlobalSettings(
  $filter: ModelSubscriptionGlobalSettingsFilterInput
) {
  onUpdateGlobalSettings(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateGlobalSettingsSubscriptionVariables,
  APITypes.OnUpdateGlobalSettingsSubscription
>;
export const onDeleteGlobalSettings = /* GraphQL */ `subscription OnDeleteGlobalSettings(
  $filter: ModelSubscriptionGlobalSettingsFilterInput
) {
  onDeleteGlobalSettings(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteGlobalSettingsSubscriptionVariables,
  APITypes.OnDeleteGlobalSettingsSubscription
>;
