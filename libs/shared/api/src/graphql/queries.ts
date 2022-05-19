/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

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
export const getOrder = /* GraphQL */ `
  query GetOrder($id: ID!) {
    getOrder(id: $id) {
      id
      orderNo
      subtotal
      tax
      total
      status
      OrderItems {
        nextToken
        startedAt
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
        subtotal
        tax
        total
        status
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
        subtotal
        tax
        total
        status
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
export const getOrderLine = /* GraphQL */ `
  query GetOrderLine($id: ID!) {
    getOrderLine(id: $id) {
      id
      productId
      productName
      unitOfMeasure
      quantity
      tax
      discountType
      discountValue
      orderID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listOrderLines = /* GraphQL */ `
  query ListOrderLines(
    $filter: ModelOrderLineFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrderLines(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        productId
        productName
        unitOfMeasure
        quantity
        tax
        discountType
        discountValue
        orderID
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
export const syncOrderLines = /* GraphQL */ `
  query SyncOrderLines(
    $filter: ModelOrderLineFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncOrderLines(
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
        quantity
        tax
        discountType
        discountValue
        orderID
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
      unitOfMeasure
      trackStock
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
        unitOfMeasure
        trackStock
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
        unitOfMeasure
        trackStock
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
export const getPurchaseOrder = /* GraphQL */ `
  query GetPurchaseOrder($id: ID!) {
    getPurchaseOrder(id: $id) {
      id
      Supplier {
        id
        code
        name
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      purchaseDate
      amount
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      purchaseOrderSupplierId
    }
  }
`;
export const listPurchaseOrders = /* GraphQL */ `
  query ListPurchaseOrders(
    $filter: ModelPurchaseOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPurchaseOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        purchaseDate
        amount
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        purchaseOrderSupplierId
      }
      nextToken
      startedAt
    }
  }
`;
export const syncPurchaseOrders = /* GraphQL */ `
  query SyncPurchaseOrders(
    $filter: ModelPurchaseOrderFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPurchaseOrders(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        purchaseDate
        amount
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        purchaseOrderSupplierId
      }
      nextToken
      startedAt
    }
  }
`;
export const getPurchaseOrderLine = /* GraphQL */ `
  query GetPurchaseOrderLine($id: ID!) {
    getPurchaseOrderLine(id: $id) {
      id
      Product {
        id
        name
        description
        price
        tags
        cost
        barcode
        sku
        unitOfMeasure
        trackStock
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
      unitPrice
      quantity
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      purchaseOrderLineProductId
    }
  }
`;
export const listPurchaseOrderLines = /* GraphQL */ `
  query ListPurchaseOrderLines(
    $filter: ModelPurchaseOrderLineFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPurchaseOrderLines(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        unitPrice
        quantity
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        purchaseOrderLineProductId
      }
      nextToken
      startedAt
    }
  }
`;
export const syncPurchaseOrderLines = /* GraphQL */ `
  query SyncPurchaseOrderLines(
    $filter: ModelPurchaseOrderLineFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPurchaseOrderLines(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        unitPrice
        quantity
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        purchaseOrderLineProductId
      }
      nextToken
      startedAt
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
      country
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
        country
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
        country
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
export const getSupplier = /* GraphQL */ `
  query GetSupplier($id: ID!) {
    getSupplier(id: $id) {
      id
      code
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listSuppliers = /* GraphQL */ `
  query ListSuppliers(
    $filter: ModelSupplierFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSuppliers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        code
        name
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
export const syncSuppliers = /* GraphQL */ `
  query SyncSuppliers(
    $filter: ModelSupplierFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncSuppliers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        code
        name
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
export const getStock = /* GraphQL */ `
  query GetStock($id: ID!) {
    getStock(id: $id) {
      id
      Product {
        id
        name
        description
        price
        tags
        cost
        barcode
        sku
        unitOfMeasure
        trackStock
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
      quantity
      updatedAt
      createdAt
      _version
      _deleted
      _lastChangedAt
      stockProductId
    }
  }
`;
export const listStocks = /* GraphQL */ `
  query ListStocks(
    $filter: ModelStockFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listStocks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        quantity
        updatedAt
        createdAt
        _version
        _deleted
        _lastChangedAt
        stockProductId
      }
      nextToken
      startedAt
    }
  }
`;
export const syncStocks = /* GraphQL */ `
  query SyncStocks(
    $filter: ModelStockFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncStocks(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        quantity
        updatedAt
        createdAt
        _version
        _deleted
        _lastChangedAt
        stockProductId
      }
      nextToken
      startedAt
    }
  }
`;
export const getTag = /* GraphQL */ `
  query GetTag($id: ID!) {
    getTag(id: $id) {
      id
      name
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const listTags = /* GraphQL */ `
  query ListTags(
    $filter: ModelTagFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTags(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
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
export const syncTags = /* GraphQL */ `
  query SyncTags(
    $filter: ModelTagFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncTags(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
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
        unitOfMeasure
        trackStock
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
