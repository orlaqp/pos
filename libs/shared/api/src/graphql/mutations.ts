/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createTenant = /* GraphQL */ `mutation CreateTenant(
  $input: CreateTenantInput!
  $condition: ModelTenantConditionInput
) {
  createTenant(input: $input, condition: $condition) {
    id
    name
    slug
    ownerUserId
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateTenantMutationVariables,
  APITypes.CreateTenantMutation
>;
export const updateTenant = /* GraphQL */ `mutation UpdateTenant(
  $input: UpdateTenantInput!
  $condition: ModelTenantConditionInput
) {
  updateTenant(input: $input, condition: $condition) {
    id
    name
    slug
    ownerUserId
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTenantMutationVariables,
  APITypes.UpdateTenantMutation
>;
export const deleteTenant = /* GraphQL */ `mutation DeleteTenant(
  $input: DeleteTenantInput!
  $condition: ModelTenantConditionInput
) {
  deleteTenant(input: $input, condition: $condition) {
    id
    name
    slug
    ownerUserId
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteTenantMutationVariables,
  APITypes.DeleteTenantMutation
>;
export const createTenantUser = /* GraphQL */ `mutation CreateTenantUser(
  $input: CreateTenantUserInput!
  $condition: ModelTenantUserConditionInput
) {
  createTenantUser(input: $input, condition: $condition) {
    id
    tenantId
    userId
    role
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateTenantUserMutationVariables,
  APITypes.CreateTenantUserMutation
>;
export const updateTenantUser = /* GraphQL */ `mutation UpdateTenantUser(
  $input: UpdateTenantUserInput!
  $condition: ModelTenantUserConditionInput
) {
  updateTenantUser(input: $input, condition: $condition) {
    id
    tenantId
    userId
    role
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTenantUserMutationVariables,
  APITypes.UpdateTenantUserMutation
>;
export const deleteTenantUser = /* GraphQL */ `mutation DeleteTenantUser(
  $input: DeleteTenantUserInput!
  $condition: ModelTenantUserConditionInput
) {
  deleteTenantUser(input: $input, condition: $condition) {
    id
    tenantId
    userId
    role
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteTenantUserMutationVariables,
  APITypes.DeleteTenantUserMutation
>;
export const createStore = /* GraphQL */ `mutation CreateStore(
  $input: CreateStoreInput!
  $condition: ModelStoreConditionInput
) {
  createStore(input: $input, condition: $condition) {
    id
    tenantId
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
    timezone
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
    tenantId
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
    timezone
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
    tenantId
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
    timezone
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
    tenantId
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
    tenantId
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
    tenantId
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
    tenantId
    name
    description
    code
    color
    picture
    discountable
    discountPolicyMode
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
    tenantId
    name
    description
    code
    color
    picture
    discountable
    discountPolicyMode
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
    tenantId
    name
    description
    code
    color
    picture
    discountable
    discountPolicyMode
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
    tenantId
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
    tenantId
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
    tenantId
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
    tenantId
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
    discountPolicyId
    policyProfileKey
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
    tenantId
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
    discountPolicyId
    policyProfileKey
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
    tenantId
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
    discountPolicyId
    policyProfileKey
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
    tenantId
    orderNo
    orderDate
    baseSubtotal
    subtotal
    lineDiscountTotal
    orderDiscountTotal
    discountTotal
    savingsTotal
    tax
    total
    currentSubtotal
    currentDiscountTotal
    currentTax
    currentTotal
    promoCodes
    pricingVersion
    pricingSnapshotHash
    pricingSource
    reconciliationStatus
    appliedDiscountSummary {
      warnings
      pricingGeneratedAt
      __typename
    }
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
      basePrice
      overridePrice
      netUnitPrice
      lineSubtotalBeforeOrderDiscount
      lineDiscountTotal
      allocatedOrderDiscountTotal
      lineTotalBeforeTax
      lineTotalAfterTax
      categoryId
      discountable
      minAllowedPrice
      maxManualDiscountPercent
      maxManualDiscountAmount
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
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
    Customer {
      id
      tenantId
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
    tenantId
    orderNo
    orderDate
    baseSubtotal
    subtotal
    lineDiscountTotal
    orderDiscountTotal
    discountTotal
    savingsTotal
    tax
    total
    currentSubtotal
    currentDiscountTotal
    currentTax
    currentTotal
    promoCodes
    pricingVersion
    pricingSnapshotHash
    pricingSource
    reconciliationStatus
    appliedDiscountSummary {
      warnings
      pricingGeneratedAt
      __typename
    }
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
      basePrice
      overridePrice
      netUnitPrice
      lineSubtotalBeforeOrderDiscount
      lineDiscountTotal
      allocatedOrderDiscountTotal
      lineTotalBeforeTax
      lineTotalAfterTax
      categoryId
      discountable
      minAllowedPrice
      maxManualDiscountPercent
      maxManualDiscountAmount
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
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
    Customer {
      id
      tenantId
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
    tenantId
    orderNo
    orderDate
    baseSubtotal
    subtotal
    lineDiscountTotal
    orderDiscountTotal
    discountTotal
    savingsTotal
    tax
    total
    currentSubtotal
    currentDiscountTotal
    currentTax
    currentTotal
    promoCodes
    pricingVersion
    pricingSnapshotHash
    pricingSource
    reconciliationStatus
    appliedDiscountSummary {
      warnings
      pricingGeneratedAt
      __typename
    }
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
      basePrice
      overridePrice
      netUnitPrice
      lineSubtotalBeforeOrderDiscount
      lineDiscountTotal
      allocatedOrderDiscountTotal
      lineTotalBeforeTax
      lineTotalAfterTax
      categoryId
      discountable
      minAllowedPrice
      maxManualDiscountPercent
      maxManualDiscountAmount
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
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
    Customer {
      id
      tenantId
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
export const createOrderRefund = /* GraphQL */ `mutation CreateOrderRefund(
  $input: CreateOrderRefundInput!
  $condition: ModelOrderRefundConditionInput
) {
  createOrderRefund(input: $input, condition: $condition) {
    id
    tenantId
    orderId
    orderNo
    refundDate
    refundType
    status
    refundAmount
    refundReason
    refundPayments {
      type
      amount
      __typename
    }
    createdByEmployeeId
    createdByEmployeeName
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateOrderRefundMutationVariables,
  APITypes.CreateOrderRefundMutation
>;
export const updateOrderRefund = /* GraphQL */ `mutation UpdateOrderRefund(
  $input: UpdateOrderRefundInput!
  $condition: ModelOrderRefundConditionInput
) {
  updateOrderRefund(input: $input, condition: $condition) {
    id
    tenantId
    orderId
    orderNo
    refundDate
    refundType
    status
    refundAmount
    refundReason
    refundPayments {
      type
      amount
      __typename
    }
    createdByEmployeeId
    createdByEmployeeName
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateOrderRefundMutationVariables,
  APITypes.UpdateOrderRefundMutation
>;
export const deleteOrderRefund = /* GraphQL */ `mutation DeleteOrderRefund(
  $input: DeleteOrderRefundInput!
  $condition: ModelOrderRefundConditionInput
) {
  deleteOrderRefund(input: $input, condition: $condition) {
    id
    tenantId
    orderId
    orderNo
    refundDate
    refundType
    status
    refundAmount
    refundReason
    refundPayments {
      type
      amount
      __typename
    }
    createdByEmployeeId
    createdByEmployeeName
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteOrderRefundMutationVariables,
  APITypes.DeleteOrderRefundMutation
>;
export const createOrderRefundLine = /* GraphQL */ `mutation CreateOrderRefundLine(
  $input: CreateOrderRefundLineInput!
  $condition: ModelOrderRefundLineConditionInput
) {
  createOrderRefundLine(input: $input, condition: $condition) {
    id
    tenantId
    refundId
    orderId
    refundDate
    orderLineIdentifier
    productId
    productName
    unitOfMeasure
    categoryId
    quantityRefunded
    unitRefundAmount
    lineRefundAmount
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateOrderRefundLineMutationVariables,
  APITypes.CreateOrderRefundLineMutation
>;
export const updateOrderRefundLine = /* GraphQL */ `mutation UpdateOrderRefundLine(
  $input: UpdateOrderRefundLineInput!
  $condition: ModelOrderRefundLineConditionInput
) {
  updateOrderRefundLine(input: $input, condition: $condition) {
    id
    tenantId
    refundId
    orderId
    refundDate
    orderLineIdentifier
    productId
    productName
    unitOfMeasure
    categoryId
    quantityRefunded
    unitRefundAmount
    lineRefundAmount
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateOrderRefundLineMutationVariables,
  APITypes.UpdateOrderRefundLineMutation
>;
export const deleteOrderRefundLine = /* GraphQL */ `mutation DeleteOrderRefundLine(
  $input: DeleteOrderRefundLineInput!
  $condition: ModelOrderRefundLineConditionInput
) {
  deleteOrderRefundLine(input: $input, condition: $condition) {
    id
    tenantId
    refundId
    orderId
    refundDate
    orderLineIdentifier
    productId
    productName
    unitOfMeasure
    categoryId
    quantityRefunded
    unitRefundAmount
    lineRefundAmount
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteOrderRefundLineMutationVariables,
  APITypes.DeleteOrderRefundLineMutation
>;
export const createOrderDiscountDefinitionSnapshot = /* GraphQL */ `mutation CreateOrderDiscountDefinitionSnapshot(
  $input: CreateOrderDiscountDefinitionSnapshotInput!
  $condition: ModelOrderDiscountDefinitionSnapshotConditionInput
) {
  createOrderDiscountDefinitionSnapshot(input: $input, condition: $condition) {
    id
    tenantId
    orderId
    discountDefinitionId
    name
    code
    description
    status
    type
    method
    scope
    value
    priority
    stackMode
    approvalRequired
    reasonRequired
    startDate
    endDate
    daysOfWeek
    startTime
    endTime
    minSubtotal
    minQuantity
    usageLimitTotal
    usageCountTotal
    applicableProductIds
    applicableCategoryIds
    excludedProductIds
    excludedCategoryIds
    excludeAlreadyDiscountedItems
    appliesToAllProducts
    stationIds
    active
    pricingGeneratedAt
    pricingTimezone
    pricingStoreId
    pricingStationId
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateOrderDiscountDefinitionSnapshotMutationVariables,
  APITypes.CreateOrderDiscountDefinitionSnapshotMutation
>;
export const updateOrderDiscountDefinitionSnapshot = /* GraphQL */ `mutation UpdateOrderDiscountDefinitionSnapshot(
  $input: UpdateOrderDiscountDefinitionSnapshotInput!
  $condition: ModelOrderDiscountDefinitionSnapshotConditionInput
) {
  updateOrderDiscountDefinitionSnapshot(input: $input, condition: $condition) {
    id
    tenantId
    orderId
    discountDefinitionId
    name
    code
    description
    status
    type
    method
    scope
    value
    priority
    stackMode
    approvalRequired
    reasonRequired
    startDate
    endDate
    daysOfWeek
    startTime
    endTime
    minSubtotal
    minQuantity
    usageLimitTotal
    usageCountTotal
    applicableProductIds
    applicableCategoryIds
    excludedProductIds
    excludedCategoryIds
    excludeAlreadyDiscountedItems
    appliesToAllProducts
    stationIds
    active
    pricingGeneratedAt
    pricingTimezone
    pricingStoreId
    pricingStationId
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateOrderDiscountDefinitionSnapshotMutationVariables,
  APITypes.UpdateOrderDiscountDefinitionSnapshotMutation
>;
export const deleteOrderDiscountDefinitionSnapshot = /* GraphQL */ `mutation DeleteOrderDiscountDefinitionSnapshot(
  $input: DeleteOrderDiscountDefinitionSnapshotInput!
  $condition: ModelOrderDiscountDefinitionSnapshotConditionInput
) {
  deleteOrderDiscountDefinitionSnapshot(input: $input, condition: $condition) {
    id
    tenantId
    orderId
    discountDefinitionId
    name
    code
    description
    status
    type
    method
    scope
    value
    priority
    stackMode
    approvalRequired
    reasonRequired
    startDate
    endDate
    daysOfWeek
    startTime
    endTime
    minSubtotal
    minQuantity
    usageLimitTotal
    usageCountTotal
    applicableProductIds
    applicableCategoryIds
    excludedProductIds
    excludedCategoryIds
    excludeAlreadyDiscountedItems
    appliesToAllProducts
    stationIds
    active
    pricingGeneratedAt
    pricingTimezone
    pricingStoreId
    pricingStationId
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteOrderDiscountDefinitionSnapshotMutationVariables,
  APITypes.DeleteOrderDiscountDefinitionSnapshotMutation
>;
export const createProduct = /* GraphQL */ `mutation CreateProduct(
  $input: CreateProductInput!
  $condition: ModelProductConditionInput
) {
  createProduct(input: $input, condition: $condition) {
    id
    tenantId
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
      tenantId
      name
      description
      code
      color
      picture
      discountable
      discountPolicyMode
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    Brand {
      id
      tenantId
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
    discountable
    minAllowedPrice
    maxManualDiscountPercent
    maxManualDiscountAmount
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
    tenantId
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
      tenantId
      name
      description
      code
      color
      picture
      discountable
      discountPolicyMode
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    Brand {
      id
      tenantId
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
    discountable
    minAllowedPrice
    maxManualDiscountPercent
    maxManualDiscountAmount
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
    tenantId
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
      tenantId
      name
      description
      code
      color
      picture
      discountable
      discountPolicyMode
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    Brand {
      id
      tenantId
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
    discountable
    minAllowedPrice
    maxManualDiscountPercent
    maxManualDiscountAmount
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
    tenantId
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
    tenantId
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
    tenantId
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
    tenantId
    timestamp
    type
    typeId
    quantityIn
    quantityOut
    Product {
      id
      tenantId
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
      discountable
      minAllowedPrice
      maxManualDiscountPercent
      maxManualDiscountAmount
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
    tenantId
    timestamp
    type
    typeId
    quantityIn
    quantityOut
    Product {
      id
      tenantId
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
      discountable
      minAllowedPrice
      maxManualDiscountPercent
      maxManualDiscountAmount
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
    tenantId
    timestamp
    type
    typeId
    quantityIn
    quantityOut
    Product {
      id
      tenantId
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
      discountable
      minAllowedPrice
      maxManualDiscountPercent
      maxManualDiscountAmount
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
    tenantId
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
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
    tenantId
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
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
    tenantId
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
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
    tenantId
    productId
    productName
    unitOfMeasure
    current
    newCount
    comments
    InventoryCount {
      id
      tenantId
      comments
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
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
    tenantId
    productId
    productName
    unitOfMeasure
    current
    newCount
    comments
    InventoryCount {
      id
      tenantId
      comments
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
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
    tenantId
    productId
    productName
    unitOfMeasure
    current
    newCount
    comments
    InventoryCount {
      id
      tenantId
      comments
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
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
    tenantId
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
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
    tenantId
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
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
    tenantId
    comments
    status
    createdBy {
      id
      name
      __typename
    }
    inventoryApplyState
    inventoryAppliedAt
    inventoryApplyOperationId
    inventoryApplyError
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
    tenantId
    productId
    productName
    unitOfMeasure
    received
    comments
    InventoryReceive {
      id
      tenantId
      comments
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
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
    tenantId
    productId
    productName
    unitOfMeasure
    received
    comments
    InventoryReceive {
      id
      tenantId
      comments
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
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
    tenantId
    productId
    productName
    unitOfMeasure
    received
    comments
    InventoryReceive {
      id
      tenantId
      comments
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
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
    tenantId
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
    tenantId
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
    tenantId
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
    tenantId
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
    tenantId
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
    tenantId
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
    id
    tenantId
    enforceSalesBasedOnInventory
    timezone
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
    id
    tenantId
    enforceSalesBasedOnInventory
    timezone
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
    id
    tenantId
    enforceSalesBasedOnInventory
    timezone
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
export const createDiscountDefinition = /* GraphQL */ `mutation CreateDiscountDefinition(
  $input: CreateDiscountDefinitionInput!
  $condition: ModelDiscountDefinitionConditionInput
) {
  createDiscountDefinition(input: $input, condition: $condition) {
    id
    tenantId
    name
    code
    description
    status
    type
    method
    scope
    value
    priority
    stackMode
    approvalRequired
    reasonRequired
    startDate
    endDate
    daysOfWeek
    startTime
    endTime
    minSubtotal
    minQuantity
    usageLimitTotal
    usageCountTotal
    applicableProductIds
    applicableCategoryIds
    excludedProductIds
    excludedCategoryIds
    excludeAlreadyDiscountedItems
    appliesToAllProducts
    storeIds
    stationIds
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
  APITypes.CreateDiscountDefinitionMutationVariables,
  APITypes.CreateDiscountDefinitionMutation
>;
export const updateDiscountDefinition = /* GraphQL */ `mutation UpdateDiscountDefinition(
  $input: UpdateDiscountDefinitionInput!
  $condition: ModelDiscountDefinitionConditionInput
) {
  updateDiscountDefinition(input: $input, condition: $condition) {
    id
    tenantId
    name
    code
    description
    status
    type
    method
    scope
    value
    priority
    stackMode
    approvalRequired
    reasonRequired
    startDate
    endDate
    daysOfWeek
    startTime
    endTime
    minSubtotal
    minQuantity
    usageLimitTotal
    usageCountTotal
    applicableProductIds
    applicableCategoryIds
    excludedProductIds
    excludedCategoryIds
    excludeAlreadyDiscountedItems
    appliesToAllProducts
    storeIds
    stationIds
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
  APITypes.UpdateDiscountDefinitionMutationVariables,
  APITypes.UpdateDiscountDefinitionMutation
>;
export const deleteDiscountDefinition = /* GraphQL */ `mutation DeleteDiscountDefinition(
  $input: DeleteDiscountDefinitionInput!
  $condition: ModelDiscountDefinitionConditionInput
) {
  deleteDiscountDefinition(input: $input, condition: $condition) {
    id
    tenantId
    name
    code
    description
    status
    type
    method
    scope
    value
    priority
    stackMode
    approvalRequired
    reasonRequired
    startDate
    endDate
    daysOfWeek
    startTime
    endTime
    minSubtotal
    minQuantity
    usageLimitTotal
    usageCountTotal
    applicableProductIds
    applicableCategoryIds
    excludedProductIds
    excludedCategoryIds
    excludeAlreadyDiscountedItems
    appliesToAllProducts
    storeIds
    stationIds
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
  APITypes.DeleteDiscountDefinitionMutationVariables,
  APITypes.DeleteDiscountDefinitionMutation
>;
export const createDiscountReasonCode = /* GraphQL */ `mutation CreateDiscountReasonCode(
  $input: CreateDiscountReasonCodeInput!
  $condition: ModelDiscountReasonCodeConditionInput
) {
  createDiscountReasonCode(input: $input, condition: $condition) {
    id
    tenantId
    code
    label
    description
    active
    requiresNote
    appliesTo
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateDiscountReasonCodeMutationVariables,
  APITypes.CreateDiscountReasonCodeMutation
>;
export const updateDiscountReasonCode = /* GraphQL */ `mutation UpdateDiscountReasonCode(
  $input: UpdateDiscountReasonCodeInput!
  $condition: ModelDiscountReasonCodeConditionInput
) {
  updateDiscountReasonCode(input: $input, condition: $condition) {
    id
    tenantId
    code
    label
    description
    active
    requiresNote
    appliesTo
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateDiscountReasonCodeMutationVariables,
  APITypes.UpdateDiscountReasonCodeMutation
>;
export const deleteDiscountReasonCode = /* GraphQL */ `mutation DeleteDiscountReasonCode(
  $input: DeleteDiscountReasonCodeInput!
  $condition: ModelDiscountReasonCodeConditionInput
) {
  deleteDiscountReasonCode(input: $input, condition: $condition) {
    id
    tenantId
    code
    label
    description
    active
    requiresNote
    appliesTo
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteDiscountReasonCodeMutationVariables,
  APITypes.DeleteDiscountReasonCodeMutation
>;
export const createEmployeeDiscountPolicy = /* GraphQL */ `mutation CreateEmployeeDiscountPolicy(
  $input: CreateEmployeeDiscountPolicyInput!
  $condition: ModelEmployeeDiscountPolicyConditionInput
) {
  createEmployeeDiscountPolicy(input: $input, condition: $condition) {
    id
    tenantId
    employeeId
    roleKey
    maxManualPercentDiscount
    maxManualAmountDiscount
    maxPriceOverrideAmount
    maxPriceOverridePercentBelowBase
    canApplyOrderDiscount
    canOverridePrice
    canApproveDiscounts
    canApprovePriceOverrides
    canUsePromoCodes
    requireReasonForManualDiscounts
    requireReasonForOverrides
    requireApprovalForOrderDiscount
    requireApprovalForAnyPriceOverride
    allowExclusiveDiscountOverride
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
  APITypes.CreateEmployeeDiscountPolicyMutationVariables,
  APITypes.CreateEmployeeDiscountPolicyMutation
>;
export const updateEmployeeDiscountPolicy = /* GraphQL */ `mutation UpdateEmployeeDiscountPolicy(
  $input: UpdateEmployeeDiscountPolicyInput!
  $condition: ModelEmployeeDiscountPolicyConditionInput
) {
  updateEmployeeDiscountPolicy(input: $input, condition: $condition) {
    id
    tenantId
    employeeId
    roleKey
    maxManualPercentDiscount
    maxManualAmountDiscount
    maxPriceOverrideAmount
    maxPriceOverridePercentBelowBase
    canApplyOrderDiscount
    canOverridePrice
    canApproveDiscounts
    canApprovePriceOverrides
    canUsePromoCodes
    requireReasonForManualDiscounts
    requireReasonForOverrides
    requireApprovalForOrderDiscount
    requireApprovalForAnyPriceOverride
    allowExclusiveDiscountOverride
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
  APITypes.UpdateEmployeeDiscountPolicyMutationVariables,
  APITypes.UpdateEmployeeDiscountPolicyMutation
>;
export const deleteEmployeeDiscountPolicy = /* GraphQL */ `mutation DeleteEmployeeDiscountPolicy(
  $input: DeleteEmployeeDiscountPolicyInput!
  $condition: ModelEmployeeDiscountPolicyConditionInput
) {
  deleteEmployeeDiscountPolicy(input: $input, condition: $condition) {
    id
    tenantId
    employeeId
    roleKey
    maxManualPercentDiscount
    maxManualAmountDiscount
    maxPriceOverrideAmount
    maxPriceOverridePercentBelowBase
    canApplyOrderDiscount
    canOverridePrice
    canApproveDiscounts
    canApprovePriceOverrides
    canUsePromoCodes
    requireReasonForManualDiscounts
    requireReasonForOverrides
    requireApprovalForOrderDiscount
    requireApprovalForAnyPriceOverride
    allowExclusiveDiscountOverride
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
  APITypes.DeleteEmployeeDiscountPolicyMutationVariables,
  APITypes.DeleteEmployeeDiscountPolicyMutation
>;
export const createDiscountPreset = /* GraphQL */ `mutation CreateDiscountPreset(
  $input: CreateDiscountPresetInput!
  $condition: ModelDiscountPresetConditionInput
) {
  createDiscountPreset(input: $input, condition: $condition) {
    id
    tenantId
    name
    scope
    method
    value
    promptForCustomValue
    active
    sortOrder
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateDiscountPresetMutationVariables,
  APITypes.CreateDiscountPresetMutation
>;
export const updateDiscountPreset = /* GraphQL */ `mutation UpdateDiscountPreset(
  $input: UpdateDiscountPresetInput!
  $condition: ModelDiscountPresetConditionInput
) {
  updateDiscountPreset(input: $input, condition: $condition) {
    id
    tenantId
    name
    scope
    method
    value
    promptForCustomValue
    active
    sortOrder
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateDiscountPresetMutationVariables,
  APITypes.UpdateDiscountPresetMutation
>;
export const deleteDiscountPreset = /* GraphQL */ `mutation DeleteDiscountPreset(
  $input: DeleteDiscountPresetInput!
  $condition: ModelDiscountPresetConditionInput
) {
  deleteDiscountPreset(input: $input, condition: $condition) {
    id
    tenantId
    name
    scope
    method
    value
    promptForCustomValue
    active
    sortOrder
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteDiscountPresetMutationVariables,
  APITypes.DeleteDiscountPresetMutation
>;
export const createDiscountApplication = /* GraphQL */ `mutation CreateDiscountApplication(
  $input: CreateDiscountApplicationInput!
  $condition: ModelDiscountApplicationConditionInput
) {
  createDiscountApplication(input: $input, condition: $condition) {
    id
    tenantId
    transactionId
    lineId
    discountDefinitionId
    applicationType
    scope
    method
    name
    code
    stackMode
    originalAmount
    discountAmount
    finalAmount
    quantityBasis
    reasonCode
    reasonNote
    appliedByEmployeeId
    appliedByEmployeeName
    approvedByEmployeeId
    approvedByEmployeeName
    approvalRequired
    approvalStatus
    approvalReference
    sourceSnapshot
    appliedAt
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateDiscountApplicationMutationVariables,
  APITypes.CreateDiscountApplicationMutation
>;
export const updateDiscountApplication = /* GraphQL */ `mutation UpdateDiscountApplication(
  $input: UpdateDiscountApplicationInput!
  $condition: ModelDiscountApplicationConditionInput
) {
  updateDiscountApplication(input: $input, condition: $condition) {
    id
    tenantId
    transactionId
    lineId
    discountDefinitionId
    applicationType
    scope
    method
    name
    code
    stackMode
    originalAmount
    discountAmount
    finalAmount
    quantityBasis
    reasonCode
    reasonNote
    appliedByEmployeeId
    appliedByEmployeeName
    approvedByEmployeeId
    approvedByEmployeeName
    approvalRequired
    approvalStatus
    approvalReference
    sourceSnapshot
    appliedAt
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateDiscountApplicationMutationVariables,
  APITypes.UpdateDiscountApplicationMutation
>;
export const deleteDiscountApplication = /* GraphQL */ `mutation DeleteDiscountApplication(
  $input: DeleteDiscountApplicationInput!
  $condition: ModelDiscountApplicationConditionInput
) {
  deleteDiscountApplication(input: $input, condition: $condition) {
    id
    tenantId
    transactionId
    lineId
    discountDefinitionId
    applicationType
    scope
    method
    name
    code
    stackMode
    originalAmount
    discountAmount
    finalAmount
    quantityBasis
    reasonCode
    reasonNote
    appliedByEmployeeId
    appliedByEmployeeName
    approvedByEmployeeId
    approvedByEmployeeName
    approvalRequired
    approvalStatus
    approvalReference
    sourceSnapshot
    appliedAt
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteDiscountApplicationMutationVariables,
  APITypes.DeleteDiscountApplicationMutation
>;
export const createApprovalEvent = /* GraphQL */ `mutation CreateApprovalEvent(
  $input: CreateApprovalEventInput!
  $condition: ModelApprovalEventConditionInput
) {
  createApprovalEvent(input: $input, condition: $condition) {
    id
    tenantId
    transactionId
    lineId
    approvalType
    requestingEmployeeId
    approvingEmployeeId
    requestedAction
    reasonCode
    reasonNote
    policySnapshot
    status
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateApprovalEventMutationVariables,
  APITypes.CreateApprovalEventMutation
>;
export const updateApprovalEvent = /* GraphQL */ `mutation UpdateApprovalEvent(
  $input: UpdateApprovalEventInput!
  $condition: ModelApprovalEventConditionInput
) {
  updateApprovalEvent(input: $input, condition: $condition) {
    id
    tenantId
    transactionId
    lineId
    approvalType
    requestingEmployeeId
    approvingEmployeeId
    requestedAction
    reasonCode
    reasonNote
    policySnapshot
    status
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateApprovalEventMutationVariables,
  APITypes.UpdateApprovalEventMutation
>;
export const deleteApprovalEvent = /* GraphQL */ `mutation DeleteApprovalEvent(
  $input: DeleteApprovalEventInput!
  $condition: ModelApprovalEventConditionInput
) {
  deleteApprovalEvent(input: $input, condition: $condition) {
    id
    tenantId
    transactionId
    lineId
    approvalType
    requestingEmployeeId
    approvingEmployeeId
    requestedAction
    reasonCode
    reasonNote
    policySnapshot
    status
    syncStatus
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteApprovalEventMutationVariables,
  APITypes.DeleteApprovalEventMutation
>;
export const createDiscountReconciliationException = /* GraphQL */ `mutation CreateDiscountReconciliationException(
  $input: CreateDiscountReconciliationExceptionInput!
  $condition: ModelDiscountReconciliationExceptionConditionInput
) {
  createDiscountReconciliationException(input: $input, condition: $condition) {
    id
    tenantId
    transactionId
    discountApplicationId
    exceptionType
    severity
    message
    backendSnapshot
    resolved
    resolvedByEmployeeId
    resolvedAt
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateDiscountReconciliationExceptionMutationVariables,
  APITypes.CreateDiscountReconciliationExceptionMutation
>;
export const updateDiscountReconciliationException = /* GraphQL */ `mutation UpdateDiscountReconciliationException(
  $input: UpdateDiscountReconciliationExceptionInput!
  $condition: ModelDiscountReconciliationExceptionConditionInput
) {
  updateDiscountReconciliationException(input: $input, condition: $condition) {
    id
    tenantId
    transactionId
    discountApplicationId
    exceptionType
    severity
    message
    backendSnapshot
    resolved
    resolvedByEmployeeId
    resolvedAt
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateDiscountReconciliationExceptionMutationVariables,
  APITypes.UpdateDiscountReconciliationExceptionMutation
>;
export const deleteDiscountReconciliationException = /* GraphQL */ `mutation DeleteDiscountReconciliationException(
  $input: DeleteDiscountReconciliationExceptionInput!
  $condition: ModelDiscountReconciliationExceptionConditionInput
) {
  deleteDiscountReconciliationException(input: $input, condition: $condition) {
    id
    tenantId
    transactionId
    discountApplicationId
    exceptionType
    severity
    message
    backendSnapshot
    resolved
    resolvedByEmployeeId
    resolvedAt
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteDiscountReconciliationExceptionMutationVariables,
  APITypes.DeleteDiscountReconciliationExceptionMutation
>;
