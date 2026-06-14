/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateTenant = /* GraphQL */ `subscription OnCreateTenant(
  $filter: ModelSubscriptionTenantFilterInput
  $ownerUserId: String
) {
  onCreateTenant(filter: $filter, ownerUserId: $ownerUserId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTenantSubscriptionVariables,
  APITypes.OnCreateTenantSubscription
>;
export const onUpdateTenant = /* GraphQL */ `subscription OnUpdateTenant(
  $filter: ModelSubscriptionTenantFilterInput
  $ownerUserId: String
) {
  onUpdateTenant(filter: $filter, ownerUserId: $ownerUserId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTenantSubscriptionVariables,
  APITypes.OnUpdateTenantSubscription
>;
export const onDeleteTenant = /* GraphQL */ `subscription OnDeleteTenant(
  $filter: ModelSubscriptionTenantFilterInput
  $ownerUserId: String
) {
  onDeleteTenant(filter: $filter, ownerUserId: $ownerUserId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTenantSubscriptionVariables,
  APITypes.OnDeleteTenantSubscription
>;
export const onCreateTenantUser = /* GraphQL */ `subscription OnCreateTenantUser(
  $filter: ModelSubscriptionTenantUserFilterInput
  $userId: String
) {
  onCreateTenantUser(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTenantUserSubscriptionVariables,
  APITypes.OnCreateTenantUserSubscription
>;
export const onUpdateTenantUser = /* GraphQL */ `subscription OnUpdateTenantUser(
  $filter: ModelSubscriptionTenantUserFilterInput
  $userId: String
) {
  onUpdateTenantUser(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTenantUserSubscriptionVariables,
  APITypes.OnUpdateTenantUserSubscription
>;
export const onDeleteTenantUser = /* GraphQL */ `subscription OnDeleteTenantUser(
  $filter: ModelSubscriptionTenantUserFilterInput
  $userId: String
) {
  onDeleteTenantUser(filter: $filter, userId: $userId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTenantUserSubscriptionVariables,
  APITypes.OnDeleteTenantUserSubscription
>;
export const onCreateStore = /* GraphQL */ `subscription OnCreateStore(
  $filter: ModelSubscriptionStoreFilterInput
  $tenantId: String
) {
  onCreateStore(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateStoreSubscriptionVariables,
  APITypes.OnCreateStoreSubscription
>;
export const onUpdateStore = /* GraphQL */ `subscription OnUpdateStore(
  $filter: ModelSubscriptionStoreFilterInput
  $tenantId: String
) {
  onUpdateStore(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateStoreSubscriptionVariables,
  APITypes.OnUpdateStoreSubscription
>;
export const onDeleteStore = /* GraphQL */ `subscription OnDeleteStore(
  $filter: ModelSubscriptionStoreFilterInput
  $tenantId: String
) {
  onDeleteStore(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteStoreSubscriptionVariables,
  APITypes.OnDeleteStoreSubscription
>;
export const onCreateBrand = /* GraphQL */ `subscription OnCreateBrand(
  $filter: ModelSubscriptionBrandFilterInput
  $tenantId: String
) {
  onCreateBrand(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateBrandSubscriptionVariables,
  APITypes.OnCreateBrandSubscription
>;
export const onUpdateBrand = /* GraphQL */ `subscription OnUpdateBrand(
  $filter: ModelSubscriptionBrandFilterInput
  $tenantId: String
) {
  onUpdateBrand(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateBrandSubscriptionVariables,
  APITypes.OnUpdateBrandSubscription
>;
export const onDeleteBrand = /* GraphQL */ `subscription OnDeleteBrand(
  $filter: ModelSubscriptionBrandFilterInput
  $tenantId: String
) {
  onDeleteBrand(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteBrandSubscriptionVariables,
  APITypes.OnDeleteBrandSubscription
>;
export const onCreateCategory = /* GraphQL */ `subscription OnCreateCategory(
  $filter: ModelSubscriptionCategoryFilterInput
  $tenantId: String
) {
  onCreateCategory(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCategorySubscriptionVariables,
  APITypes.OnCreateCategorySubscription
>;
export const onUpdateCategory = /* GraphQL */ `subscription OnUpdateCategory(
  $filter: ModelSubscriptionCategoryFilterInput
  $tenantId: String
) {
  onUpdateCategory(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCategorySubscriptionVariables,
  APITypes.OnUpdateCategorySubscription
>;
export const onDeleteCategory = /* GraphQL */ `subscription OnDeleteCategory(
  $filter: ModelSubscriptionCategoryFilterInput
  $tenantId: String
) {
  onDeleteCategory(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCategorySubscriptionVariables,
  APITypes.OnDeleteCategorySubscription
>;
export const onCreateCustomer = /* GraphQL */ `subscription OnCreateCustomer(
  $filter: ModelSubscriptionCustomerFilterInput
  $tenantId: String
) {
  onCreateCustomer(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCustomerSubscriptionVariables,
  APITypes.OnCreateCustomerSubscription
>;
export const onUpdateCustomer = /* GraphQL */ `subscription OnUpdateCustomer(
  $filter: ModelSubscriptionCustomerFilterInput
  $tenantId: String
) {
  onUpdateCustomer(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCustomerSubscriptionVariables,
  APITypes.OnUpdateCustomerSubscription
>;
export const onDeleteCustomer = /* GraphQL */ `subscription OnDeleteCustomer(
  $filter: ModelSubscriptionCustomerFilterInput
  $tenantId: String
) {
  onDeleteCustomer(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCustomerSubscriptionVariables,
  APITypes.OnDeleteCustomerSubscription
>;
export const onCreateEmployee = /* GraphQL */ `subscription OnCreateEmployee(
  $filter: ModelSubscriptionEmployeeFilterInput
  $tenantId: String
) {
  onCreateEmployee(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateEmployeeSubscriptionVariables,
  APITypes.OnCreateEmployeeSubscription
>;
export const onUpdateEmployee = /* GraphQL */ `subscription OnUpdateEmployee(
  $filter: ModelSubscriptionEmployeeFilterInput
  $tenantId: String
) {
  onUpdateEmployee(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateEmployeeSubscriptionVariables,
  APITypes.OnUpdateEmployeeSubscription
>;
export const onDeleteEmployee = /* GraphQL */ `subscription OnDeleteEmployee(
  $filter: ModelSubscriptionEmployeeFilterInput
  $tenantId: String
) {
  onDeleteEmployee(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteEmployeeSubscriptionVariables,
  APITypes.OnDeleteEmployeeSubscription
>;
export const onCreateOrder = /* GraphQL */ `subscription OnCreateOrder(
  $filter: ModelSubscriptionOrderFilterInput
  $tenantId: String
) {
  onCreateOrder(filter: $filter, tenantId: $tenantId) {
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
      taxable
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
      payments {
        type
        amount
        baseAmount
        surchargeRate
        surchargeAmount
        __typename
      }
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
` as GeneratedSubscription<
  APITypes.OnCreateOrderSubscriptionVariables,
  APITypes.OnCreateOrderSubscription
>;
export const onUpdateOrder = /* GraphQL */ `subscription OnUpdateOrder(
  $filter: ModelSubscriptionOrderFilterInput
  $tenantId: String
) {
  onUpdateOrder(filter: $filter, tenantId: $tenantId) {
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
      taxable
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
      payments {
        type
        amount
        baseAmount
        surchargeRate
        surchargeAmount
        __typename
      }
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
` as GeneratedSubscription<
  APITypes.OnUpdateOrderSubscriptionVariables,
  APITypes.OnUpdateOrderSubscription
>;
export const onDeleteOrder = /* GraphQL */ `subscription OnDeleteOrder(
  $filter: ModelSubscriptionOrderFilterInput
  $tenantId: String
) {
  onDeleteOrder(filter: $filter, tenantId: $tenantId) {
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
      taxable
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
      payments {
        type
        amount
        baseAmount
        surchargeRate
        surchargeAmount
        __typename
      }
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
` as GeneratedSubscription<
  APITypes.OnDeleteOrderSubscriptionVariables,
  APITypes.OnDeleteOrderSubscription
>;
export const onCreateOrderRefund = /* GraphQL */ `subscription OnCreateOrderRefund(
  $filter: ModelSubscriptionOrderRefundFilterInput
  $tenantId: String
) {
  onCreateOrderRefund(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateOrderRefundSubscriptionVariables,
  APITypes.OnCreateOrderRefundSubscription
>;
export const onUpdateOrderRefund = /* GraphQL */ `subscription OnUpdateOrderRefund(
  $filter: ModelSubscriptionOrderRefundFilterInput
  $tenantId: String
) {
  onUpdateOrderRefund(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateOrderRefundSubscriptionVariables,
  APITypes.OnUpdateOrderRefundSubscription
>;
export const onDeleteOrderRefund = /* GraphQL */ `subscription OnDeleteOrderRefund(
  $filter: ModelSubscriptionOrderRefundFilterInput
  $tenantId: String
) {
  onDeleteOrderRefund(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteOrderRefundSubscriptionVariables,
  APITypes.OnDeleteOrderRefundSubscription
>;
export const onCreateOrderRefundLine = /* GraphQL */ `subscription OnCreateOrderRefundLine(
  $filter: ModelSubscriptionOrderRefundLineFilterInput
  $tenantId: String
) {
  onCreateOrderRefundLine(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateOrderRefundLineSubscriptionVariables,
  APITypes.OnCreateOrderRefundLineSubscription
>;
export const onUpdateOrderRefundLine = /* GraphQL */ `subscription OnUpdateOrderRefundLine(
  $filter: ModelSubscriptionOrderRefundLineFilterInput
  $tenantId: String
) {
  onUpdateOrderRefundLine(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateOrderRefundLineSubscriptionVariables,
  APITypes.OnUpdateOrderRefundLineSubscription
>;
export const onDeleteOrderRefundLine = /* GraphQL */ `subscription OnDeleteOrderRefundLine(
  $filter: ModelSubscriptionOrderRefundLineFilterInput
  $tenantId: String
) {
  onDeleteOrderRefundLine(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteOrderRefundLineSubscriptionVariables,
  APITypes.OnDeleteOrderRefundLineSubscription
>;
export const onCreateOrderDiscountDefinitionSnapshot = /* GraphQL */ `subscription OnCreateOrderDiscountDefinitionSnapshot(
  $filter: ModelSubscriptionOrderDiscountDefinitionSnapshotFilterInput
  $tenantId: String
) {
  onCreateOrderDiscountDefinitionSnapshot(
    filter: $filter
    tenantId: $tenantId
  ) {
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
` as GeneratedSubscription<
  APITypes.OnCreateOrderDiscountDefinitionSnapshotSubscriptionVariables,
  APITypes.OnCreateOrderDiscountDefinitionSnapshotSubscription
>;
export const onUpdateOrderDiscountDefinitionSnapshot = /* GraphQL */ `subscription OnUpdateOrderDiscountDefinitionSnapshot(
  $filter: ModelSubscriptionOrderDiscountDefinitionSnapshotFilterInput
  $tenantId: String
) {
  onUpdateOrderDiscountDefinitionSnapshot(
    filter: $filter
    tenantId: $tenantId
  ) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateOrderDiscountDefinitionSnapshotSubscriptionVariables,
  APITypes.OnUpdateOrderDiscountDefinitionSnapshotSubscription
>;
export const onDeleteOrderDiscountDefinitionSnapshot = /* GraphQL */ `subscription OnDeleteOrderDiscountDefinitionSnapshot(
  $filter: ModelSubscriptionOrderDiscountDefinitionSnapshotFilterInput
  $tenantId: String
) {
  onDeleteOrderDiscountDefinitionSnapshot(
    filter: $filter
    tenantId: $tenantId
  ) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteOrderDiscountDefinitionSnapshotSubscriptionVariables,
  APITypes.OnDeleteOrderDiscountDefinitionSnapshotSubscription
>;
export const onCreateProduct = /* GraphQL */ `subscription OnCreateProduct(
  $filter: ModelSubscriptionProductFilterInput
  $tenantId: String
) {
  onCreateProduct(filter: $filter, tenantId: $tenantId) {
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
    taxable
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
` as GeneratedSubscription<
  APITypes.OnCreateProductSubscriptionVariables,
  APITypes.OnCreateProductSubscription
>;
export const onUpdateProduct = /* GraphQL */ `subscription OnUpdateProduct(
  $filter: ModelSubscriptionProductFilterInput
  $tenantId: String
) {
  onUpdateProduct(filter: $filter, tenantId: $tenantId) {
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
    taxable
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
` as GeneratedSubscription<
  APITypes.OnUpdateProductSubscriptionVariables,
  APITypes.OnUpdateProductSubscription
>;
export const onDeleteProduct = /* GraphQL */ `subscription OnDeleteProduct(
  $filter: ModelSubscriptionProductFilterInput
  $tenantId: String
) {
  onDeleteProduct(filter: $filter, tenantId: $tenantId) {
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
    taxable
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
` as GeneratedSubscription<
  APITypes.OnDeleteProductSubscriptionVariables,
  APITypes.OnDeleteProductSubscription
>;
export const onCreateUnitOfMeasure = /* GraphQL */ `subscription OnCreateUnitOfMeasure(
  $filter: ModelSubscriptionUnitOfMeasureFilterInput
  $tenantId: String
) {
  onCreateUnitOfMeasure(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUnitOfMeasureSubscriptionVariables,
  APITypes.OnCreateUnitOfMeasureSubscription
>;
export const onUpdateUnitOfMeasure = /* GraphQL */ `subscription OnUpdateUnitOfMeasure(
  $filter: ModelSubscriptionUnitOfMeasureFilterInput
  $tenantId: String
) {
  onUpdateUnitOfMeasure(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUnitOfMeasureSubscriptionVariables,
  APITypes.OnUpdateUnitOfMeasureSubscription
>;
export const onDeleteUnitOfMeasure = /* GraphQL */ `subscription OnDeleteUnitOfMeasure(
  $filter: ModelSubscriptionUnitOfMeasureFilterInput
  $tenantId: String
) {
  onDeleteUnitOfMeasure(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUnitOfMeasureSubscriptionVariables,
  APITypes.OnDeleteUnitOfMeasureSubscription
>;
export const onCreateInventoryChanges = /* GraphQL */ `subscription OnCreateInventoryChanges(
  $filter: ModelSubscriptionInventoryChangesFilterInput
  $tenantId: String
) {
  onCreateInventoryChanges(filter: $filter, tenantId: $tenantId) {
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
      taxable
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryChangesSubscriptionVariables,
  APITypes.OnCreateInventoryChangesSubscription
>;
export const onUpdateInventoryChanges = /* GraphQL */ `subscription OnUpdateInventoryChanges(
  $filter: ModelSubscriptionInventoryChangesFilterInput
  $tenantId: String
) {
  onUpdateInventoryChanges(filter: $filter, tenantId: $tenantId) {
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
      taxable
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryChangesSubscriptionVariables,
  APITypes.OnUpdateInventoryChangesSubscription
>;
export const onDeleteInventoryChanges = /* GraphQL */ `subscription OnDeleteInventoryChanges(
  $filter: ModelSubscriptionInventoryChangesFilterInput
  $tenantId: String
) {
  onDeleteInventoryChanges(filter: $filter, tenantId: $tenantId) {
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
      taxable
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryChangesSubscriptionVariables,
  APITypes.OnDeleteInventoryChangesSubscription
>;
export const onCreateInventoryCount = /* GraphQL */ `subscription OnCreateInventoryCount(
  $filter: ModelSubscriptionInventoryCountFilterInput
  $tenantId: String
) {
  onCreateInventoryCount(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryCountSubscriptionVariables,
  APITypes.OnCreateInventoryCountSubscription
>;
export const onUpdateInventoryCount = /* GraphQL */ `subscription OnUpdateInventoryCount(
  $filter: ModelSubscriptionInventoryCountFilterInput
  $tenantId: String
) {
  onUpdateInventoryCount(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryCountSubscriptionVariables,
  APITypes.OnUpdateInventoryCountSubscription
>;
export const onDeleteInventoryCount = /* GraphQL */ `subscription OnDeleteInventoryCount(
  $filter: ModelSubscriptionInventoryCountFilterInput
  $tenantId: String
) {
  onDeleteInventoryCount(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryCountSubscriptionVariables,
  APITypes.OnDeleteInventoryCountSubscription
>;
export const onCreateInventoryCountLine = /* GraphQL */ `subscription OnCreateInventoryCountLine(
  $filter: ModelSubscriptionInventoryCountLineFilterInput
  $tenantId: String
) {
  onCreateInventoryCountLine(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryCountLineSubscriptionVariables,
  APITypes.OnCreateInventoryCountLineSubscription
>;
export const onUpdateInventoryCountLine = /* GraphQL */ `subscription OnUpdateInventoryCountLine(
  $filter: ModelSubscriptionInventoryCountLineFilterInput
  $tenantId: String
) {
  onUpdateInventoryCountLine(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryCountLineSubscriptionVariables,
  APITypes.OnUpdateInventoryCountLineSubscription
>;
export const onDeleteInventoryCountLine = /* GraphQL */ `subscription OnDeleteInventoryCountLine(
  $filter: ModelSubscriptionInventoryCountLineFilterInput
  $tenantId: String
) {
  onDeleteInventoryCountLine(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryCountLineSubscriptionVariables,
  APITypes.OnDeleteInventoryCountLineSubscription
>;
export const onCreateInventoryReceive = /* GraphQL */ `subscription OnCreateInventoryReceive(
  $filter: ModelSubscriptionInventoryReceiveFilterInput
  $tenantId: String
) {
  onCreateInventoryReceive(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryReceiveSubscriptionVariables,
  APITypes.OnCreateInventoryReceiveSubscription
>;
export const onUpdateInventoryReceive = /* GraphQL */ `subscription OnUpdateInventoryReceive(
  $filter: ModelSubscriptionInventoryReceiveFilterInput
  $tenantId: String
) {
  onUpdateInventoryReceive(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryReceiveSubscriptionVariables,
  APITypes.OnUpdateInventoryReceiveSubscription
>;
export const onDeleteInventoryReceive = /* GraphQL */ `subscription OnDeleteInventoryReceive(
  $filter: ModelSubscriptionInventoryReceiveFilterInput
  $tenantId: String
) {
  onDeleteInventoryReceive(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryReceiveSubscriptionVariables,
  APITypes.OnDeleteInventoryReceiveSubscription
>;
export const onCreateInventoryReceiveLine = /* GraphQL */ `subscription OnCreateInventoryReceiveLine(
  $filter: ModelSubscriptionInventoryReceiveLineFilterInput
  $tenantId: String
) {
  onCreateInventoryReceiveLine(filter: $filter, tenantId: $tenantId) {
    id
    tenantId
    productId
    productName
    unitOfMeasure
    current
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryReceiveLineSubscriptionVariables,
  APITypes.OnCreateInventoryReceiveLineSubscription
>;
export const onUpdateInventoryReceiveLine = /* GraphQL */ `subscription OnUpdateInventoryReceiveLine(
  $filter: ModelSubscriptionInventoryReceiveLineFilterInput
  $tenantId: String
) {
  onUpdateInventoryReceiveLine(filter: $filter, tenantId: $tenantId) {
    id
    tenantId
    productId
    productName
    unitOfMeasure
    current
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryReceiveLineSubscriptionVariables,
  APITypes.OnUpdateInventoryReceiveLineSubscription
>;
export const onDeleteInventoryReceiveLine = /* GraphQL */ `subscription OnDeleteInventoryReceiveLine(
  $filter: ModelSubscriptionInventoryReceiveLineFilterInput
  $tenantId: String
) {
  onDeleteInventoryReceiveLine(filter: $filter, tenantId: $tenantId) {
    id
    tenantId
    productId
    productName
    unitOfMeasure
    current
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryReceiveLineSubscriptionVariables,
  APITypes.OnDeleteInventoryReceiveLineSubscription
>;
export const onCreatePrinter = /* GraphQL */ `subscription OnCreatePrinter(
  $filter: ModelSubscriptionPrinterFilterInput
  $tenantId: String
) {
  onCreatePrinter(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreatePrinterSubscriptionVariables,
  APITypes.OnCreatePrinterSubscription
>;
export const onUpdatePrinter = /* GraphQL */ `subscription OnUpdatePrinter(
  $filter: ModelSubscriptionPrinterFilterInput
  $tenantId: String
) {
  onUpdatePrinter(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdatePrinterSubscriptionVariables,
  APITypes.OnUpdatePrinterSubscription
>;
export const onDeletePrinter = /* GraphQL */ `subscription OnDeletePrinter(
  $filter: ModelSubscriptionPrinterFilterInput
  $tenantId: String
) {
  onDeletePrinter(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeletePrinterSubscriptionVariables,
  APITypes.OnDeletePrinterSubscription
>;
export const onCreateStation = /* GraphQL */ `subscription OnCreateStation(
  $filter: ModelSubscriptionStationFilterInput
  $tenantId: String
) {
  onCreateStation(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateStationSubscriptionVariables,
  APITypes.OnCreateStationSubscription
>;
export const onUpdateStation = /* GraphQL */ `subscription OnUpdateStation(
  $filter: ModelSubscriptionStationFilterInput
  $tenantId: String
) {
  onUpdateStation(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateStationSubscriptionVariables,
  APITypes.OnUpdateStationSubscription
>;
export const onDeleteStation = /* GraphQL */ `subscription OnDeleteStation(
  $filter: ModelSubscriptionStationFilterInput
  $tenantId: String
) {
  onDeleteStation(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteStationSubscriptionVariables,
  APITypes.OnDeleteStationSubscription
>;
export const onCreateGlobalSettings = /* GraphQL */ `subscription OnCreateGlobalSettings(
  $filter: ModelSubscriptionGlobalSettingsFilterInput
  $tenantId: String
) {
  onCreateGlobalSettings(filter: $filter, tenantId: $tenantId) {
    id
    tenantId
    enforceSalesBasedOnInventory
    timezone
    taxValue
    creditCardSurchargePercent
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
  $tenantId: String
) {
  onUpdateGlobalSettings(filter: $filter, tenantId: $tenantId) {
    id
    tenantId
    enforceSalesBasedOnInventory
    timezone
    taxValue
    creditCardSurchargePercent
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
  $tenantId: String
) {
  onDeleteGlobalSettings(filter: $filter, tenantId: $tenantId) {
    id
    tenantId
    enforceSalesBasedOnInventory
    timezone
    taxValue
    creditCardSurchargePercent
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
export const onCreateDiscountDefinition = /* GraphQL */ `subscription OnCreateDiscountDefinition(
  $filter: ModelSubscriptionDiscountDefinitionFilterInput
  $tenantId: String
) {
  onCreateDiscountDefinition(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDiscountDefinitionSubscriptionVariables,
  APITypes.OnCreateDiscountDefinitionSubscription
>;
export const onUpdateDiscountDefinition = /* GraphQL */ `subscription OnUpdateDiscountDefinition(
  $filter: ModelSubscriptionDiscountDefinitionFilterInput
  $tenantId: String
) {
  onUpdateDiscountDefinition(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDiscountDefinitionSubscriptionVariables,
  APITypes.OnUpdateDiscountDefinitionSubscription
>;
export const onDeleteDiscountDefinition = /* GraphQL */ `subscription OnDeleteDiscountDefinition(
  $filter: ModelSubscriptionDiscountDefinitionFilterInput
  $tenantId: String
) {
  onDeleteDiscountDefinition(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDiscountDefinitionSubscriptionVariables,
  APITypes.OnDeleteDiscountDefinitionSubscription
>;
export const onCreateDiscountReasonCode = /* GraphQL */ `subscription OnCreateDiscountReasonCode(
  $filter: ModelSubscriptionDiscountReasonCodeFilterInput
  $tenantId: String
) {
  onCreateDiscountReasonCode(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDiscountReasonCodeSubscriptionVariables,
  APITypes.OnCreateDiscountReasonCodeSubscription
>;
export const onUpdateDiscountReasonCode = /* GraphQL */ `subscription OnUpdateDiscountReasonCode(
  $filter: ModelSubscriptionDiscountReasonCodeFilterInput
  $tenantId: String
) {
  onUpdateDiscountReasonCode(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDiscountReasonCodeSubscriptionVariables,
  APITypes.OnUpdateDiscountReasonCodeSubscription
>;
export const onDeleteDiscountReasonCode = /* GraphQL */ `subscription OnDeleteDiscountReasonCode(
  $filter: ModelSubscriptionDiscountReasonCodeFilterInput
  $tenantId: String
) {
  onDeleteDiscountReasonCode(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDiscountReasonCodeSubscriptionVariables,
  APITypes.OnDeleteDiscountReasonCodeSubscription
>;
export const onCreateEmployeeDiscountPolicy = /* GraphQL */ `subscription OnCreateEmployeeDiscountPolicy(
  $filter: ModelSubscriptionEmployeeDiscountPolicyFilterInput
  $tenantId: String
) {
  onCreateEmployeeDiscountPolicy(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateEmployeeDiscountPolicySubscriptionVariables,
  APITypes.OnCreateEmployeeDiscountPolicySubscription
>;
export const onUpdateEmployeeDiscountPolicy = /* GraphQL */ `subscription OnUpdateEmployeeDiscountPolicy(
  $filter: ModelSubscriptionEmployeeDiscountPolicyFilterInput
  $tenantId: String
) {
  onUpdateEmployeeDiscountPolicy(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateEmployeeDiscountPolicySubscriptionVariables,
  APITypes.OnUpdateEmployeeDiscountPolicySubscription
>;
export const onDeleteEmployeeDiscountPolicy = /* GraphQL */ `subscription OnDeleteEmployeeDiscountPolicy(
  $filter: ModelSubscriptionEmployeeDiscountPolicyFilterInput
  $tenantId: String
) {
  onDeleteEmployeeDiscountPolicy(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteEmployeeDiscountPolicySubscriptionVariables,
  APITypes.OnDeleteEmployeeDiscountPolicySubscription
>;
export const onCreateDiscountPreset = /* GraphQL */ `subscription OnCreateDiscountPreset(
  $filter: ModelSubscriptionDiscountPresetFilterInput
  $tenantId: String
) {
  onCreateDiscountPreset(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDiscountPresetSubscriptionVariables,
  APITypes.OnCreateDiscountPresetSubscription
>;
export const onUpdateDiscountPreset = /* GraphQL */ `subscription OnUpdateDiscountPreset(
  $filter: ModelSubscriptionDiscountPresetFilterInput
  $tenantId: String
) {
  onUpdateDiscountPreset(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDiscountPresetSubscriptionVariables,
  APITypes.OnUpdateDiscountPresetSubscription
>;
export const onDeleteDiscountPreset = /* GraphQL */ `subscription OnDeleteDiscountPreset(
  $filter: ModelSubscriptionDiscountPresetFilterInput
  $tenantId: String
) {
  onDeleteDiscountPreset(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDiscountPresetSubscriptionVariables,
  APITypes.OnDeleteDiscountPresetSubscription
>;
export const onCreateDiscountApplication = /* GraphQL */ `subscription OnCreateDiscountApplication(
  $filter: ModelSubscriptionDiscountApplicationFilterInput
  $tenantId: String
) {
  onCreateDiscountApplication(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDiscountApplicationSubscriptionVariables,
  APITypes.OnCreateDiscountApplicationSubscription
>;
export const onUpdateDiscountApplication = /* GraphQL */ `subscription OnUpdateDiscountApplication(
  $filter: ModelSubscriptionDiscountApplicationFilterInput
  $tenantId: String
) {
  onUpdateDiscountApplication(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDiscountApplicationSubscriptionVariables,
  APITypes.OnUpdateDiscountApplicationSubscription
>;
export const onDeleteDiscountApplication = /* GraphQL */ `subscription OnDeleteDiscountApplication(
  $filter: ModelSubscriptionDiscountApplicationFilterInput
  $tenantId: String
) {
  onDeleteDiscountApplication(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDiscountApplicationSubscriptionVariables,
  APITypes.OnDeleteDiscountApplicationSubscription
>;
export const onCreateApprovalEvent = /* GraphQL */ `subscription OnCreateApprovalEvent(
  $filter: ModelSubscriptionApprovalEventFilterInput
  $tenantId: String
) {
  onCreateApprovalEvent(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnCreateApprovalEventSubscriptionVariables,
  APITypes.OnCreateApprovalEventSubscription
>;
export const onUpdateApprovalEvent = /* GraphQL */ `subscription OnUpdateApprovalEvent(
  $filter: ModelSubscriptionApprovalEventFilterInput
  $tenantId: String
) {
  onUpdateApprovalEvent(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateApprovalEventSubscriptionVariables,
  APITypes.OnUpdateApprovalEventSubscription
>;
export const onDeleteApprovalEvent = /* GraphQL */ `subscription OnDeleteApprovalEvent(
  $filter: ModelSubscriptionApprovalEventFilterInput
  $tenantId: String
) {
  onDeleteApprovalEvent(filter: $filter, tenantId: $tenantId) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteApprovalEventSubscriptionVariables,
  APITypes.OnDeleteApprovalEventSubscription
>;
export const onCreateDiscountReconciliationException = /* GraphQL */ `subscription OnCreateDiscountReconciliationException(
  $filter: ModelSubscriptionDiscountReconciliationExceptionFilterInput
  $tenantId: String
) {
  onCreateDiscountReconciliationException(
    filter: $filter
    tenantId: $tenantId
  ) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDiscountReconciliationExceptionSubscriptionVariables,
  APITypes.OnCreateDiscountReconciliationExceptionSubscription
>;
export const onUpdateDiscountReconciliationException = /* GraphQL */ `subscription OnUpdateDiscountReconciliationException(
  $filter: ModelSubscriptionDiscountReconciliationExceptionFilterInput
  $tenantId: String
) {
  onUpdateDiscountReconciliationException(
    filter: $filter
    tenantId: $tenantId
  ) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDiscountReconciliationExceptionSubscriptionVariables,
  APITypes.OnUpdateDiscountReconciliationExceptionSubscription
>;
export const onDeleteDiscountReconciliationException = /* GraphQL */ `subscription OnDeleteDiscountReconciliationException(
  $filter: ModelSubscriptionDiscountReconciliationExceptionFilterInput
  $tenantId: String
) {
  onDeleteDiscountReconciliationException(
    filter: $filter
    tenantId: $tenantId
  ) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDiscountReconciliationExceptionSubscriptionVariables,
  APITypes.OnDeleteDiscountReconciliationExceptionSubscription
>;
