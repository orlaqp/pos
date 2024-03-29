/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSales = /* GraphQL */ `
  query GetSales($status: OrderStatus!, $from: String!, $to: String!) {
    getSales(status: $status, from: $from, to: $to) {
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
      }
      paymentInfo {
        employeeId
        employeeName
      }
      refundInfo {
        employeeId
        employeeName
        comments
      }
      createdBy {
        id
        name
      }
      updatedBy {
        id
        name
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
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      orderCustomerId
    }
  }
`;
export const getSalesSummary = /* GraphQL */ `
  query GetSalesSummary($status: OrderStatus!, $from: String!, $to: String!) {
    getSalesSummary(status: $status, from: $from, to: $to) {
      products {
        productId
        productName
        unitOfMeasure
        quantity
        amount
      }
      employees {
        employeeId
        employeeName
        orders
        amount
      }
      dates {
        datePart
        orders
        amount
      }
      totalAmount
      totalOrders
    }
  }
`;
export const getStore = /* GraphQL */ `
  query GetStore($id: ID!) {
    getStore(id: $id) {
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
    }
  }
`;
export const listStores = /* GraphQL */ `
  query ListStores(
    $filter: ModelStoreFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listStores(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      }
      nextToken
      startedAt
    }
  }
`;
export const syncStores = /* GraphQL */ `
  query SyncStores(
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
      }
      nextToken
      startedAt
    }
  }
`;
export const getBrand = /* GraphQL */ `
  query GetBrand($id: ID!) {
    getBrand(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listBrands = /* GraphQL */ `
  query ListBrands(
    $filter: ModelBrandFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBrands(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncBrands = /* GraphQL */ `
  query SyncBrands(
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
        name
        description
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getCategory = /* GraphQL */ `
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
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
    }
  }
`;
export const listCategories = /* GraphQL */ `
  query ListCategories(
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCategories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      }
      nextToken
      startedAt
    }
  }
`;
export const syncCategories = /* GraphQL */ `
  query SyncCategories(
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
      }
      nextToken
      startedAt
    }
  }
`;
export const getCustomer = /* GraphQL */ `
  query GetCustomer($id: ID!) {
    getCustomer(id: $id) {
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
    }
  }
`;
export const listCustomers = /* GraphQL */ `
  query ListCustomers(
    $filter: ModelCustomerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCustomers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      }
      nextToken
      startedAt
    }
  }
`;
export const syncCustomers = /* GraphQL */ `
  query SyncCustomers(
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
      }
      nextToken
      startedAt
    }
  }
`;
export const getEmployee = /* GraphQL */ `
  query GetEmployee($id: ID!) {
    getEmployee(id: $id) {
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
    }
  }
`;
export const listEmployees = /* GraphQL */ `
  query ListEmployees(
    $filter: ModelEmployeeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEmployees(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      }
      nextToken
      startedAt
    }
  }
`;
export const syncEmployees = /* GraphQL */ `
  query SyncEmployees(
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
      }
      nextToken
      startedAt
    }
  }
`;
export const getOrder = /* GraphQL */ `
  query GetOrder($id: ID!) {
    getOrder(id: $id) {
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
      }
      paymentInfo {
        employeeId
        employeeName
      }
      refundInfo {
        employeeId
        employeeName
        comments
      }
      createdBy {
        id
        name
      }
      updatedBy {
        id
        name
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
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      orderCustomerId
    }
  }
`;
export const listOrders = /* GraphQL */ `
  query ListOrders(
    $filter: ModelOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        orderNo
        orderDate
        subtotal
        tax
        total
        status
        employeeId
        employeeName
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        orderCustomerId
      }
      nextToken
      startedAt
    }
  }
`;
export const syncOrders = /* GraphQL */ `
  query SyncOrders(
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
        orderNo
        orderDate
        subtotal
        tax
        total
        status
        employeeId
        employeeName
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        orderCustomerId
      }
      nextToken
      startedAt
    }
  }
`;
export const getProduct = /* GraphQL */ `
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
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
      }
      isActive
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      productCategoryId
      productBrandId
    }
  }
`;
export const listProducts = /* GraphQL */ `
  query ListProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        productCategoryId
        productBrandId
      }
      nextToken
      startedAt
    }
  }
`;
export const syncProducts = /* GraphQL */ `
  query SyncProducts(
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
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        productCategoryId
        productBrandId
      }
      nextToken
      startedAt
    }
  }
`;
export const getUnitOfMeasure = /* GraphQL */ `
  query GetUnitOfMeasure($id: ID!) {
    getUnitOfMeasure(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listUnitOfMeasures = /* GraphQL */ `
  query ListUnitOfMeasures(
    $filter: ModelUnitOfMeasureFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUnitOfMeasures(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncUnitOfMeasures = /* GraphQL */ `
  query SyncUnitOfMeasures(
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
        name
        description
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getInventoryChanges = /* GraphQL */ `
  query GetInventoryChanges($id: ID!) {
    getInventoryChanges(id: $id) {
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
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        productCategoryId
        productBrandId
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      inventoryChangesProductId
    }
  }
`;
export const listInventoryChanges = /* GraphQL */ `
  query ListInventoryChanges(
    $filter: ModelInventoryChangesFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listInventoryChanges(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
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
      }
      nextToken
      startedAt
    }
  }
`;
export const syncInventoryChanges = /* GraphQL */ `
  query SyncInventoryChanges(
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
      }
      nextToken
      startedAt
    }
  }
`;
export const getInventoryCount = /* GraphQL */ `
  query GetInventoryCount($id: ID!) {
    getInventoryCount(id: $id) {
      id
      comments
      status
      createdBy {
        id
        name
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listInventoryCounts = /* GraphQL */ `
  query ListInventoryCounts(
    $filter: ModelInventoryCountFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listInventoryCounts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        comments
        status
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncInventoryCounts = /* GraphQL */ `
  query SyncInventoryCounts(
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
        comments
        status
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getInventoryCountLine = /* GraphQL */ `
  query GetInventoryCountLine($id: ID!) {
    getInventoryCountLine(id: $id) {
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
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      inventoryCountLineInventoryCountId
    }
  }
`;
export const listInventoryCountLines = /* GraphQL */ `
  query ListInventoryCountLines(
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
      }
      nextToken
      startedAt
    }
  }
`;
export const syncInventoryCountLines = /* GraphQL */ `
  query SyncInventoryCountLines(
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
      }
      nextToken
      startedAt
    }
  }
`;
export const getInventoryReceive = /* GraphQL */ `
  query GetInventoryReceive($id: ID!) {
    getInventoryReceive(id: $id) {
      id
      comments
      status
      createdBy {
        id
        name
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listInventoryReceives = /* GraphQL */ `
  query ListInventoryReceives(
    $filter: ModelInventoryReceiveFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listInventoryReceives(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        comments
        status
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncInventoryReceives = /* GraphQL */ `
  query SyncInventoryReceives(
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
        comments
        status
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getInventoryReceiveLine = /* GraphQL */ `
  query GetInventoryReceiveLine($id: ID!) {
    getInventoryReceiveLine(id: $id) {
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
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      inventoryReceiveLineInventoryReceiveId
    }
  }
`;
export const listInventoryReceiveLines = /* GraphQL */ `
  query ListInventoryReceiveLines(
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
        productId
        productName
        unitOfMeasure
        received
        comments
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        inventoryReceiveLineInventoryReceiveId
      }
      nextToken
      startedAt
    }
  }
`;
export const syncInventoryReceiveLines = /* GraphQL */ `
  query SyncInventoryReceiveLines(
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
        productId
        productName
        unitOfMeasure
        received
        comments
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        inventoryReceiveLineInventoryReceiveId
      }
      nextToken
      startedAt
    }
  }
`;
export const getPrinter = /* GraphQL */ `
  query GetPrinter($id: ID!) {
    getPrinter(id: $id) {
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
    }
  }
`;
export const listPrinters = /* GraphQL */ `
  query ListPrinters(
    $filter: ModelPrinterFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPrinters(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      }
      nextToken
      startedAt
    }
  }
`;
export const syncPrinters = /* GraphQL */ `
  query SyncPrinters(
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
      }
      nextToken
      startedAt
    }
  }
`;
export const getStation = /* GraphQL */ `
  query GetStation($id: ID!) {
    getStation(id: $id) {
      id
      deviceId
      alias
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listStations = /* GraphQL */ `
  query ListStations(
    $filter: ModelStationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listStations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        deviceId
        alias
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncStations = /* GraphQL */ `
  query SyncStations(
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
        deviceId
        alias
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const getGlobalSettings = /* GraphQL */ `
  query GetGlobalSettings($id: ID!) {
    getGlobalSettings(id: $id) {
      enforceSalesBasedOnInventory
      id
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listGlobalSettings = /* GraphQL */ `
  query ListGlobalSettings(
    $filter: ModelGlobalSettingsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGlobalSettings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        enforceSalesBasedOnInventory
        id
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
export const syncGlobalSettings = /* GraphQL */ `
  query SyncGlobalSettings(
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
        enforceSalesBasedOnInventory
        id
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      nextToken
      startedAt
    }
  }
`;
