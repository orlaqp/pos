/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getSales = /* GraphQL */ `query GetSales($statuses: [OrderStatus!]!, $from: String!, $to: String!) {
  getSales(statuses: $statuses, from: $from, to: $to) {
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
` as GeneratedQuery<APITypes.GetSalesQueryVariables, APITypes.GetSalesQuery>;
export const getSalesSummary = /* GraphQL */ `query GetSalesSummary(
  $statuses: [OrderStatus!]!
  $from: String!
  $to: String!
) {
  getSalesSummary(statuses: $statuses, from: $from, to: $to) {
    products {
      productId
      productName
      unitOfMeasure
      quantity
      amount
      __typename
    }
    employees {
      employeeId
      employeeName
      orders
      amount
      __typename
    }
    dates {
      datePart
      orders
      amount
      __typename
    }
    totalAmount
    totalOrders
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSalesSummaryQueryVariables,
  APITypes.GetSalesSummaryQuery
>;
export const finalizeInventoryReceive = /* GraphQL */ `query FinalizeInventoryReceive($input: FinalizeInventoryReceiveInput!) {
  finalizeInventoryReceive(input: $input) {
    sourceId
    sourceType
    status
    appliedAt
    error
    affectedProducts {
      productId
      finalQuantity
      appliedDelta
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.FinalizeInventoryReceiveQueryVariables,
  APITypes.FinalizeInventoryReceiveQuery
>;
export const finalizeInventoryCount = /* GraphQL */ `query FinalizeInventoryCount($input: FinalizeInventoryCountInput!) {
  finalizeInventoryCount(input: $input) {
    sourceId
    sourceType
    status
    appliedAt
    error
    affectedProducts {
      productId
      finalQuantity
      appliedDelta
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.FinalizeInventoryCountQueryVariables,
  APITypes.FinalizeInventoryCountQuery
>;
export const getTenant = /* GraphQL */ `query GetTenant($id: ID!) {
  getTenant(id: $id) {
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
` as GeneratedQuery<APITypes.GetTenantQueryVariables, APITypes.GetTenantQuery>;
export const listTenants = /* GraphQL */ `query ListTenants(
  $filter: ModelTenantFilterInput
  $limit: Int
  $nextToken: String
) {
  listTenants(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTenantsQueryVariables,
  APITypes.ListTenantsQuery
>;
export const syncTenants = /* GraphQL */ `query SyncTenants(
  $filter: ModelTenantFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncTenants(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncTenantsQueryVariables,
  APITypes.SyncTenantsQuery
>;
export const tenantBySlug = /* GraphQL */ `query TenantBySlug(
  $slug: String!
  $sortDirection: ModelSortDirection
  $filter: ModelTenantFilterInput
  $limit: Int
  $nextToken: String
) {
  tenantBySlug(
    slug: $slug
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TenantBySlugQueryVariables,
  APITypes.TenantBySlugQuery
>;
export const getTenantUser = /* GraphQL */ `query GetTenantUser($id: ID!) {
  getTenantUser(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetTenantUserQueryVariables,
  APITypes.GetTenantUserQuery
>;
export const listTenantUsers = /* GraphQL */ `query ListTenantUsers(
  $filter: ModelTenantUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listTenantUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTenantUsersQueryVariables,
  APITypes.ListTenantUsersQuery
>;
export const syncTenantUsers = /* GraphQL */ `query SyncTenantUsers(
  $filter: ModelTenantUserFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncTenantUsers(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncTenantUsersQueryVariables,
  APITypes.SyncTenantUsersQuery
>;
export const tenantUsersByTenant = /* GraphQL */ `query TenantUsersByTenant(
  $tenantId: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelTenantUserFilterInput
  $limit: Int
  $nextToken: String
) {
  tenantUsersByTenant(
    tenantId: $tenantId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TenantUsersByTenantQueryVariables,
  APITypes.TenantUsersByTenantQuery
>;
export const tenantUsersByUser = /* GraphQL */ `query TenantUsersByUser(
  $userId: String!
  $sortDirection: ModelSortDirection
  $filter: ModelTenantUserFilterInput
  $limit: Int
  $nextToken: String
) {
  tenantUsersByUser(
    userId: $userId
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TenantUsersByUserQueryVariables,
  APITypes.TenantUsersByUserQuery
>;
export const getStore = /* GraphQL */ `query GetStore($id: ID!) {
  getStore(id: $id) {
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
` as GeneratedQuery<APITypes.GetStoreQueryVariables, APITypes.GetStoreQuery>;
export const listStores = /* GraphQL */ `query ListStores(
  $filter: ModelStoreFilterInput
  $limit: Int
  $nextToken: String
) {
  listStores(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListStoresQueryVariables,
  APITypes.ListStoresQuery
>;
export const syncStores = /* GraphQL */ `query SyncStores(
  $filter: ModelStoreFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncStores(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncStoresQueryVariables,
  APITypes.SyncStoresQuery
>;
export const getBrand = /* GraphQL */ `query GetBrand($id: ID!) {
  getBrand(id: $id) {
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
` as GeneratedQuery<APITypes.GetBrandQueryVariables, APITypes.GetBrandQuery>;
export const listBrands = /* GraphQL */ `query ListBrands(
  $filter: ModelBrandFilterInput
  $limit: Int
  $nextToken: String
) {
  listBrands(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBrandsQueryVariables,
  APITypes.ListBrandsQuery
>;
export const syncBrands = /* GraphQL */ `query SyncBrands(
  $filter: ModelBrandFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncBrands(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncBrandsQueryVariables,
  APITypes.SyncBrandsQuery
>;
export const getCategory = /* GraphQL */ `query GetCategory($id: ID!) {
  getCategory(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetCategoryQueryVariables,
  APITypes.GetCategoryQuery
>;
export const listCategories = /* GraphQL */ `query ListCategories(
  $filter: ModelCategoryFilterInput
  $limit: Int
  $nextToken: String
) {
  listCategories(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCategoriesQueryVariables,
  APITypes.ListCategoriesQuery
>;
export const syncCategories = /* GraphQL */ `query SyncCategories(
  $filter: ModelCategoryFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncCategories(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncCategoriesQueryVariables,
  APITypes.SyncCategoriesQuery
>;
export const getCustomer = /* GraphQL */ `query GetCustomer($id: ID!) {
  getCustomer(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetCustomerQueryVariables,
  APITypes.GetCustomerQuery
>;
export const listCustomers = /* GraphQL */ `query ListCustomers(
  $filter: ModelCustomerFilterInput
  $limit: Int
  $nextToken: String
) {
  listCustomers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCustomersQueryVariables,
  APITypes.ListCustomersQuery
>;
export const syncCustomers = /* GraphQL */ `query SyncCustomers(
  $filter: ModelCustomerFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncCustomers(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncCustomersQueryVariables,
  APITypes.SyncCustomersQuery
>;
export const getEmployee = /* GraphQL */ `query GetEmployee($id: ID!) {
  getEmployee(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetEmployeeQueryVariables,
  APITypes.GetEmployeeQuery
>;
export const listEmployees = /* GraphQL */ `query ListEmployees(
  $filter: ModelEmployeeFilterInput
  $limit: Int
  $nextToken: String
) {
  listEmployees(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEmployeesQueryVariables,
  APITypes.ListEmployeesQuery
>;
export const syncEmployees = /* GraphQL */ `query SyncEmployees(
  $filter: ModelEmployeeFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncEmployees(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncEmployeesQueryVariables,
  APITypes.SyncEmployeesQuery
>;
export const getOrder = /* GraphQL */ `query GetOrder($id: ID!) {
  getOrder(id: $id) {
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
` as GeneratedQuery<APITypes.GetOrderQueryVariables, APITypes.GetOrderQuery>;
export const listOrders = /* GraphQL */ `query ListOrders(
  $filter: ModelOrderFilterInput
  $limit: Int
  $nextToken: String
) {
  listOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
      status
      employeeId
      employeeName
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      orderCustomerId
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrdersQueryVariables,
  APITypes.ListOrdersQuery
>;
export const syncOrders = /* GraphQL */ `query SyncOrders(
  $filter: ModelOrderFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncOrders(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
      status
      employeeId
      employeeName
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      orderCustomerId
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncOrdersQueryVariables,
  APITypes.SyncOrdersQuery
>;
export const getOrderRefund = /* GraphQL */ `query GetOrderRefund($id: ID!) {
  getOrderRefund(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetOrderRefundQueryVariables,
  APITypes.GetOrderRefundQuery
>;
export const listOrderRefunds = /* GraphQL */ `query ListOrderRefunds(
  $filter: ModelOrderRefundFilterInput
  $limit: Int
  $nextToken: String
) {
  listOrderRefunds(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      tenantId
      orderId
      orderNo
      refundDate
      refundType
      status
      refundAmount
      refundReason
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrderRefundsQueryVariables,
  APITypes.ListOrderRefundsQuery
>;
export const syncOrderRefunds = /* GraphQL */ `query SyncOrderRefunds(
  $filter: ModelOrderRefundFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncOrderRefunds(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
      id
      tenantId
      orderId
      orderNo
      refundDate
      refundType
      status
      refundAmount
      refundReason
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncOrderRefundsQueryVariables,
  APITypes.SyncOrderRefundsQuery
>;
export const getOrderRefundLine = /* GraphQL */ `query GetOrderRefundLine($id: ID!) {
  getOrderRefundLine(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetOrderRefundLineQueryVariables,
  APITypes.GetOrderRefundLineQuery
>;
export const listOrderRefundLines = /* GraphQL */ `query ListOrderRefundLines(
  $filter: ModelOrderRefundLineFilterInput
  $limit: Int
  $nextToken: String
) {
  listOrderRefundLines(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrderRefundLinesQueryVariables,
  APITypes.ListOrderRefundLinesQuery
>;
export const syncOrderRefundLines = /* GraphQL */ `query SyncOrderRefundLines(
  $filter: ModelOrderRefundLineFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncOrderRefundLines(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncOrderRefundLinesQueryVariables,
  APITypes.SyncOrderRefundLinesQuery
>;
export const getOrderDiscountDefinitionSnapshot = /* GraphQL */ `query GetOrderDiscountDefinitionSnapshot($id: ID!) {
  getOrderDiscountDefinitionSnapshot(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetOrderDiscountDefinitionSnapshotQueryVariables,
  APITypes.GetOrderDiscountDefinitionSnapshotQuery
>;
export const listOrderDiscountDefinitionSnapshots = /* GraphQL */ `query ListOrderDiscountDefinitionSnapshots(
  $filter: ModelOrderDiscountDefinitionSnapshotFilterInput
  $limit: Int
  $nextToken: String
) {
  listOrderDiscountDefinitionSnapshots(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrderDiscountDefinitionSnapshotsQueryVariables,
  APITypes.ListOrderDiscountDefinitionSnapshotsQuery
>;
export const syncOrderDiscountDefinitionSnapshots = /* GraphQL */ `query SyncOrderDiscountDefinitionSnapshots(
  $filter: ModelOrderDiscountDefinitionSnapshotFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncOrderDiscountDefinitionSnapshots(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncOrderDiscountDefinitionSnapshotsQueryVariables,
  APITypes.SyncOrderDiscountDefinitionSnapshotsQuery
>;
export const getProduct = /* GraphQL */ `query GetProduct($id: ID!) {
  getProduct(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetProductQueryVariables,
  APITypes.GetProductQuery
>;
export const listProducts = /* GraphQL */ `query ListProducts(
  $filter: ModelProductFilterInput
  $limit: Int
  $nextToken: String
) {
  listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProductsQueryVariables,
  APITypes.ListProductsQuery
>;
export const syncProducts = /* GraphQL */ `query SyncProducts(
  $filter: ModelProductFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncProducts(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncProductsQueryVariables,
  APITypes.SyncProductsQuery
>;
export const getUnitOfMeasure = /* GraphQL */ `query GetUnitOfMeasure($id: ID!) {
  getUnitOfMeasure(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetUnitOfMeasureQueryVariables,
  APITypes.GetUnitOfMeasureQuery
>;
export const listUnitOfMeasures = /* GraphQL */ `query ListUnitOfMeasures(
  $filter: ModelUnitOfMeasureFilterInput
  $limit: Int
  $nextToken: String
) {
  listUnitOfMeasures(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUnitOfMeasuresQueryVariables,
  APITypes.ListUnitOfMeasuresQuery
>;
export const syncUnitOfMeasures = /* GraphQL */ `query SyncUnitOfMeasures(
  $filter: ModelUnitOfMeasureFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncUnitOfMeasures(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncUnitOfMeasuresQueryVariables,
  APITypes.SyncUnitOfMeasuresQuery
>;
export const getInventoryChanges = /* GraphQL */ `query GetInventoryChanges($id: ID!) {
  getInventoryChanges(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetInventoryChangesQueryVariables,
  APITypes.GetInventoryChangesQuery
>;
export const listInventoryChanges = /* GraphQL */ `query ListInventoryChanges(
  $filter: ModelInventoryChangesFilterInput
  $limit: Int
  $nextToken: String
) {
  listInventoryChanges(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      tenantId
      timestamp
      type
      typeId
      quantityIn
      quantityOut
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      inventoryChangesProductId
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListInventoryChangesQueryVariables,
  APITypes.ListInventoryChangesQuery
>;
export const syncInventoryChanges = /* GraphQL */ `query SyncInventoryChanges(
  $filter: ModelInventoryChangesFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncInventoryChanges(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
      id
      tenantId
      timestamp
      type
      typeId
      quantityIn
      quantityOut
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      inventoryChangesProductId
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncInventoryChangesQueryVariables,
  APITypes.SyncInventoryChangesQuery
>;
export const getInventoryCount = /* GraphQL */ `query GetInventoryCount($id: ID!) {
  getInventoryCount(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetInventoryCountQueryVariables,
  APITypes.GetInventoryCountQuery
>;
export const listInventoryCounts = /* GraphQL */ `query ListInventoryCounts(
  $filter: ModelInventoryCountFilterInput
  $limit: Int
  $nextToken: String
) {
  listInventoryCounts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListInventoryCountsQueryVariables,
  APITypes.ListInventoryCountsQuery
>;
export const syncInventoryCounts = /* GraphQL */ `query SyncInventoryCounts(
  $filter: ModelInventoryCountFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncInventoryCounts(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncInventoryCountsQueryVariables,
  APITypes.SyncInventoryCountsQuery
>;
export const getInventoryCountLine = /* GraphQL */ `query GetInventoryCountLine($id: ID!) {
  getInventoryCountLine(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetInventoryCountLineQueryVariables,
  APITypes.GetInventoryCountLineQuery
>;
export const listInventoryCountLines = /* GraphQL */ `query ListInventoryCountLines(
  $filter: ModelInventoryCountLineFilterInput
  $limit: Int
  $nextToken: String
) {
  listInventoryCountLines(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      tenantId
      productId
      productName
      unitOfMeasure
      current
      newCount
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      inventoryCountLineInventoryCountId
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListInventoryCountLinesQueryVariables,
  APITypes.ListInventoryCountLinesQuery
>;
export const syncInventoryCountLines = /* GraphQL */ `query SyncInventoryCountLines(
  $filter: ModelInventoryCountLineFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncInventoryCountLines(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
      id
      tenantId
      productId
      productName
      unitOfMeasure
      current
      newCount
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      inventoryCountLineInventoryCountId
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncInventoryCountLinesQueryVariables,
  APITypes.SyncInventoryCountLinesQuery
>;
export const getInventoryReceive = /* GraphQL */ `query GetInventoryReceive($id: ID!) {
  getInventoryReceive(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetInventoryReceiveQueryVariables,
  APITypes.GetInventoryReceiveQuery
>;
export const listInventoryReceives = /* GraphQL */ `query ListInventoryReceives(
  $filter: ModelInventoryReceiveFilterInput
  $limit: Int
  $nextToken: String
) {
  listInventoryReceives(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListInventoryReceivesQueryVariables,
  APITypes.ListInventoryReceivesQuery
>;
export const syncInventoryReceives = /* GraphQL */ `query SyncInventoryReceives(
  $filter: ModelInventoryReceiveFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncInventoryReceives(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncInventoryReceivesQueryVariables,
  APITypes.SyncInventoryReceivesQuery
>;
export const getInventoryReceiveLine = /* GraphQL */ `query GetInventoryReceiveLine($id: ID!) {
  getInventoryReceiveLine(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetInventoryReceiveLineQueryVariables,
  APITypes.GetInventoryReceiveLineQuery
>;
export const listInventoryReceiveLines = /* GraphQL */ `query ListInventoryReceiveLines(
  $filter: ModelInventoryReceiveLineFilterInput
  $limit: Int
  $nextToken: String
) {
  listInventoryReceiveLines(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      tenantId
      productId
      productName
      unitOfMeasure
      current
      received
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      inventoryReceiveLineInventoryReceiveId
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListInventoryReceiveLinesQueryVariables,
  APITypes.ListInventoryReceiveLinesQuery
>;
export const syncInventoryReceiveLines = /* GraphQL */ `query SyncInventoryReceiveLines(
  $filter: ModelInventoryReceiveLineFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncInventoryReceiveLines(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
      id
      tenantId
      productId
      productName
      unitOfMeasure
      current
      received
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      inventoryReceiveLineInventoryReceiveId
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncInventoryReceiveLinesQueryVariables,
  APITypes.SyncInventoryReceiveLinesQuery
>;
export const getPrinter = /* GraphQL */ `query GetPrinter($id: ID!) {
  getPrinter(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetPrinterQueryVariables,
  APITypes.GetPrinterQuery
>;
export const listPrinters = /* GraphQL */ `query ListPrinters(
  $filter: ModelPrinterFilterInput
  $limit: Int
  $nextToken: String
) {
  listPrinters(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPrintersQueryVariables,
  APITypes.ListPrintersQuery
>;
export const syncPrinters = /* GraphQL */ `query SyncPrinters(
  $filter: ModelPrinterFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncPrinters(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncPrintersQueryVariables,
  APITypes.SyncPrintersQuery
>;
export const getStation = /* GraphQL */ `query GetStation($id: ID!) {
  getStation(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetStationQueryVariables,
  APITypes.GetStationQuery
>;
export const listStations = /* GraphQL */ `query ListStations(
  $filter: ModelStationFilterInput
  $limit: Int
  $nextToken: String
) {
  listStations(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListStationsQueryVariables,
  APITypes.ListStationsQuery
>;
export const syncStations = /* GraphQL */ `query SyncStations(
  $filter: ModelStationFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncStations(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncStationsQueryVariables,
  APITypes.SyncStationsQuery
>;
export const getGlobalSettings = /* GraphQL */ `query GetGlobalSettings($id: ID!) {
  getGlobalSettings(id: $id) {
    id
    tenantId
    enforceSalesBasedOnInventory
    timezone
    taxValue
    createdAt
    updatedAt
    _version
    _deleted
    _lastChangedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetGlobalSettingsQueryVariables,
  APITypes.GetGlobalSettingsQuery
>;
export const listGlobalSettings = /* GraphQL */ `query ListGlobalSettings(
  $filter: ModelGlobalSettingsFilterInput
  $limit: Int
  $nextToken: String
) {
  listGlobalSettings(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      tenantId
      enforceSalesBasedOnInventory
      timezone
      taxValue
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListGlobalSettingsQueryVariables,
  APITypes.ListGlobalSettingsQuery
>;
export const syncGlobalSettings = /* GraphQL */ `query SyncGlobalSettings(
  $filter: ModelGlobalSettingsFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncGlobalSettings(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
      id
      tenantId
      enforceSalesBasedOnInventory
      timezone
      taxValue
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncGlobalSettingsQueryVariables,
  APITypes.SyncGlobalSettingsQuery
>;
export const getDiscountDefinition = /* GraphQL */ `query GetDiscountDefinition($id: ID!) {
  getDiscountDefinition(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDiscountDefinitionQueryVariables,
  APITypes.GetDiscountDefinitionQuery
>;
export const listDiscountDefinitions = /* GraphQL */ `query ListDiscountDefinitions(
  $filter: ModelDiscountDefinitionFilterInput
  $limit: Int
  $nextToken: String
) {
  listDiscountDefinitions(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDiscountDefinitionsQueryVariables,
  APITypes.ListDiscountDefinitionsQuery
>;
export const syncDiscountDefinitions = /* GraphQL */ `query SyncDiscountDefinitions(
  $filter: ModelDiscountDefinitionFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncDiscountDefinitions(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncDiscountDefinitionsQueryVariables,
  APITypes.SyncDiscountDefinitionsQuery
>;
export const getDiscountReasonCode = /* GraphQL */ `query GetDiscountReasonCode($id: ID!) {
  getDiscountReasonCode(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDiscountReasonCodeQueryVariables,
  APITypes.GetDiscountReasonCodeQuery
>;
export const listDiscountReasonCodes = /* GraphQL */ `query ListDiscountReasonCodes(
  $filter: ModelDiscountReasonCodeFilterInput
  $limit: Int
  $nextToken: String
) {
  listDiscountReasonCodes(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDiscountReasonCodesQueryVariables,
  APITypes.ListDiscountReasonCodesQuery
>;
export const syncDiscountReasonCodes = /* GraphQL */ `query SyncDiscountReasonCodes(
  $filter: ModelDiscountReasonCodeFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncDiscountReasonCodes(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncDiscountReasonCodesQueryVariables,
  APITypes.SyncDiscountReasonCodesQuery
>;
export const getEmployeeDiscountPolicy = /* GraphQL */ `query GetEmployeeDiscountPolicy($id: ID!) {
  getEmployeeDiscountPolicy(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetEmployeeDiscountPolicyQueryVariables,
  APITypes.GetEmployeeDiscountPolicyQuery
>;
export const listEmployeeDiscountPolicies = /* GraphQL */ `query ListEmployeeDiscountPolicies(
  $filter: ModelEmployeeDiscountPolicyFilterInput
  $limit: Int
  $nextToken: String
) {
  listEmployeeDiscountPolicies(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEmployeeDiscountPoliciesQueryVariables,
  APITypes.ListEmployeeDiscountPoliciesQuery
>;
export const syncEmployeeDiscountPolicies = /* GraphQL */ `query SyncEmployeeDiscountPolicies(
  $filter: ModelEmployeeDiscountPolicyFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncEmployeeDiscountPolicies(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncEmployeeDiscountPoliciesQueryVariables,
  APITypes.SyncEmployeeDiscountPoliciesQuery
>;
export const getDiscountPreset = /* GraphQL */ `query GetDiscountPreset($id: ID!) {
  getDiscountPreset(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDiscountPresetQueryVariables,
  APITypes.GetDiscountPresetQuery
>;
export const listDiscountPresets = /* GraphQL */ `query ListDiscountPresets(
  $filter: ModelDiscountPresetFilterInput
  $limit: Int
  $nextToken: String
) {
  listDiscountPresets(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDiscountPresetsQueryVariables,
  APITypes.ListDiscountPresetsQuery
>;
export const syncDiscountPresets = /* GraphQL */ `query SyncDiscountPresets(
  $filter: ModelDiscountPresetFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncDiscountPresets(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncDiscountPresetsQueryVariables,
  APITypes.SyncDiscountPresetsQuery
>;
export const getDiscountApplication = /* GraphQL */ `query GetDiscountApplication($id: ID!) {
  getDiscountApplication(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDiscountApplicationQueryVariables,
  APITypes.GetDiscountApplicationQuery
>;
export const listDiscountApplications = /* GraphQL */ `query ListDiscountApplications(
  $filter: ModelDiscountApplicationFilterInput
  $limit: Int
  $nextToken: String
) {
  listDiscountApplications(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDiscountApplicationsQueryVariables,
  APITypes.ListDiscountApplicationsQuery
>;
export const syncDiscountApplications = /* GraphQL */ `query SyncDiscountApplications(
  $filter: ModelDiscountApplicationFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncDiscountApplications(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncDiscountApplicationsQueryVariables,
  APITypes.SyncDiscountApplicationsQuery
>;
export const getApprovalEvent = /* GraphQL */ `query GetApprovalEvent($id: ID!) {
  getApprovalEvent(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetApprovalEventQueryVariables,
  APITypes.GetApprovalEventQuery
>;
export const listApprovalEvents = /* GraphQL */ `query ListApprovalEvents(
  $filter: ModelApprovalEventFilterInput
  $limit: Int
  $nextToken: String
) {
  listApprovalEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListApprovalEventsQueryVariables,
  APITypes.ListApprovalEventsQuery
>;
export const syncApprovalEvents = /* GraphQL */ `query SyncApprovalEvents(
  $filter: ModelApprovalEventFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncApprovalEvents(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncApprovalEventsQueryVariables,
  APITypes.SyncApprovalEventsQuery
>;
export const getDiscountReconciliationException = /* GraphQL */ `query GetDiscountReconciliationException($id: ID!) {
  getDiscountReconciliationException(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDiscountReconciliationExceptionQueryVariables,
  APITypes.GetDiscountReconciliationExceptionQuery
>;
export const listDiscountReconciliationExceptions = /* GraphQL */ `query ListDiscountReconciliationExceptions(
  $filter: ModelDiscountReconciliationExceptionFilterInput
  $limit: Int
  $nextToken: String
) {
  listDiscountReconciliationExceptions(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDiscountReconciliationExceptionsQueryVariables,
  APITypes.ListDiscountReconciliationExceptionsQuery
>;
export const syncDiscountReconciliationExceptions = /* GraphQL */ `query SyncDiscountReconciliationExceptions(
  $filter: ModelDiscountReconciliationExceptionFilterInput
  $limit: Int
  $nextToken: String
  $lastSync: AWSTimestamp
) {
  syncDiscountReconciliationExceptions(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    lastSync: $lastSync
  ) {
    items {
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
    nextToken
    startedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.SyncDiscountReconciliationExceptionsQueryVariables,
  APITypes.SyncDiscountReconciliationExceptionsQuery
>;
