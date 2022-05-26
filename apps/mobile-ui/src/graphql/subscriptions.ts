/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateBrand = /* GraphQL */ `
  subscription OnCreateBrand {
    onCreateBrand {
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
export const onUpdateBrand = /* GraphQL */ `
  subscription OnUpdateBrand {
    onUpdateBrand {
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
export const onDeleteBrand = /* GraphQL */ `
  subscription OnDeleteBrand {
    onDeleteBrand {
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
export const onCreateCategory = /* GraphQL */ `
  subscription OnCreateCategory {
    onCreateCategory {
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
export const onUpdateCategory = /* GraphQL */ `
  subscription OnUpdateCategory {
    onUpdateCategory {
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
export const onDeleteCategory = /* GraphQL */ `
  subscription OnDeleteCategory {
    onDeleteCategory {
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
export const onCreateCustomer = /* GraphQL */ `
  subscription OnCreateCustomer {
    onCreateCustomer {
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
export const onUpdateCustomer = /* GraphQL */ `
  subscription OnUpdateCustomer {
    onUpdateCustomer {
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
export const onDeleteCustomer = /* GraphQL */ `
  subscription OnDeleteCustomer {
    onDeleteCustomer {
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
export const onCreateOrder = /* GraphQL */ `
  subscription OnCreateOrder {
    onCreateOrder {
      id
      subtotal
      tax
      total
      status
      employeeId
      employeeName
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
export const onUpdateOrder = /* GraphQL */ `
  subscription OnUpdateOrder {
    onUpdateOrder {
      id
      subtotal
      tax
      total
      status
      employeeId
      employeeName
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
export const onDeleteOrder = /* GraphQL */ `
  subscription OnDeleteOrder {
    onDeleteOrder {
      id
      subtotal
      tax
      total
      status
      employeeId
      employeeName
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
export const onCreateOrderLine = /* GraphQL */ `
  subscription OnCreateOrderLine {
    onCreateOrderLine {
      id
      productId
      barcode
      sku
      productName
      unitOfMeasure
      quantity
      tax
      price
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
export const onUpdateOrderLine = /* GraphQL */ `
  subscription OnUpdateOrderLine {
    onUpdateOrderLine {
      id
      productId
      barcode
      sku
      productName
      unitOfMeasure
      quantity
      tax
      price
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
export const onDeleteOrderLine = /* GraphQL */ `
  subscription OnDeleteOrderLine {
    onDeleteOrderLine {
      id
      productId
      barcode
      sku
      productName
      unitOfMeasure
      quantity
      tax
      price
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
export const onCreateProduct = /* GraphQL */ `
  subscription OnCreateProduct {
    onCreateProduct {
      id
      name
      description
      price
      tags
      cost
      barcode
      sku
      quantity
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
export const onUpdateProduct = /* GraphQL */ `
  subscription OnUpdateProduct {
    onUpdateProduct {
      id
      name
      description
      price
      tags
      cost
      barcode
      sku
      quantity
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
export const onDeleteProduct = /* GraphQL */ `
  subscription OnDeleteProduct {
    onDeleteProduct {
      id
      name
      description
      price
      tags
      cost
      barcode
      sku
      quantity
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
export const onCreatePurchaseOrder = /* GraphQL */ `
  subscription OnCreatePurchaseOrder {
    onCreatePurchaseOrder {
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
export const onUpdatePurchaseOrder = /* GraphQL */ `
  subscription OnUpdatePurchaseOrder {
    onUpdatePurchaseOrder {
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
export const onDeletePurchaseOrder = /* GraphQL */ `
  subscription OnDeletePurchaseOrder {
    onDeletePurchaseOrder {
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
export const onCreatePurchaseOrderLine = /* GraphQL */ `
  subscription OnCreatePurchaseOrderLine {
    onCreatePurchaseOrderLine {
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
        quantity
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
export const onUpdatePurchaseOrderLine = /* GraphQL */ `
  subscription OnUpdatePurchaseOrderLine {
    onUpdatePurchaseOrderLine {
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
        quantity
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
export const onDeletePurchaseOrderLine = /* GraphQL */ `
  subscription OnDeletePurchaseOrderLine {
    onDeletePurchaseOrderLine {
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
        quantity
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
export const onCreateStore = /* GraphQL */ `
  subscription OnCreateStore {
    onCreateStore {
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
export const onUpdateStore = /* GraphQL */ `
  subscription OnUpdateStore {
    onUpdateStore {
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
export const onDeleteStore = /* GraphQL */ `
  subscription OnDeleteStore {
    onDeleteStore {
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
export const onCreateSupplier = /* GraphQL */ `
  subscription OnCreateSupplier {
    onCreateSupplier {
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
export const onUpdateSupplier = /* GraphQL */ `
  subscription OnUpdateSupplier {
    onUpdateSupplier {
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
export const onDeleteSupplier = /* GraphQL */ `
  subscription OnDeleteSupplier {
    onDeleteSupplier {
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
export const onCreateStock = /* GraphQL */ `
  subscription OnCreateStock {
    onCreateStock {
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
        quantity
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
export const onUpdateStock = /* GraphQL */ `
  subscription OnUpdateStock {
    onUpdateStock {
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
        quantity
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
export const onDeleteStock = /* GraphQL */ `
  subscription OnDeleteStock {
    onDeleteStock {
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
        quantity
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
export const onCreateTag = /* GraphQL */ `
  subscription OnCreateTag {
    onCreateTag {
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
export const onUpdateTag = /* GraphQL */ `
  subscription OnUpdateTag {
    onUpdateTag {
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
export const onDeleteTag = /* GraphQL */ `
  subscription OnDeleteTag {
    onDeleteTag {
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
export const onCreateUnitOfMeasure = /* GraphQL */ `
  subscription OnCreateUnitOfMeasure {
    onCreateUnitOfMeasure {
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
export const onUpdateUnitOfMeasure = /* GraphQL */ `
  subscription OnUpdateUnitOfMeasure {
    onUpdateUnitOfMeasure {
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
export const onDeleteUnitOfMeasure = /* GraphQL */ `
  subscription OnDeleteUnitOfMeasure {
    onDeleteUnitOfMeasure {
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
export const onCreateInventory = /* GraphQL */ `
  subscription OnCreateInventory {
    onCreateInventory {
      id
      quantity
      Product {
        id
        name
        description
        price
        tags
        cost
        barcode
        sku
        quantity
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
      inventoryProductId
    }
  }
`;
export const onUpdateInventory = /* GraphQL */ `
  subscription OnUpdateInventory {
    onUpdateInventory {
      id
      quantity
      Product {
        id
        name
        description
        price
        tags
        cost
        barcode
        sku
        quantity
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
      inventoryProductId
    }
  }
`;
export const onDeleteInventory = /* GraphQL */ `
  subscription OnDeleteInventory {
    onDeleteInventory {
      id
      quantity
      Product {
        id
        name
        description
        price
        tags
        cost
        barcode
        sku
        quantity
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
      inventoryProductId
    }
  }
`;
export const onCreateInventoryChanges = /* GraphQL */ `
  subscription OnCreateInventoryChanges {
    onCreateInventoryChanges {
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
        quantity
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
export const onUpdateInventoryChanges = /* GraphQL */ `
  subscription OnUpdateInventoryChanges {
    onUpdateInventoryChanges {
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
        quantity
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
export const onDeleteInventoryChanges = /* GraphQL */ `
  subscription OnDeleteInventoryChanges {
    onDeleteInventoryChanges {
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
        quantity
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
export const onCreateInventoryCount = /* GraphQL */ `
  subscription OnCreateInventoryCount {
    onCreateInventoryCount {
      id
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateInventoryCount = /* GraphQL */ `
  subscription OnUpdateInventoryCount {
    onUpdateInventoryCount {
      id
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteInventoryCount = /* GraphQL */ `
  subscription OnDeleteInventoryCount {
    onDeleteInventoryCount {
      id
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateInventoryCountLine = /* GraphQL */ `
  subscription OnCreateInventoryCountLine {
    onCreateInventoryCountLine {
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
export const onUpdateInventoryCountLine = /* GraphQL */ `
  subscription OnUpdateInventoryCountLine {
    onUpdateInventoryCountLine {
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
export const onDeleteInventoryCountLine = /* GraphQL */ `
  subscription OnDeleteInventoryCountLine {
    onDeleteInventoryCountLine {
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
export const onCreateInventoryReceived = /* GraphQL */ `
  subscription OnCreateInventoryReceived {
    onCreateInventoryReceived {
      id
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateInventoryReceived = /* GraphQL */ `
  subscription OnUpdateInventoryReceived {
    onUpdateInventoryReceived {
      id
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteInventoryReceived = /* GraphQL */ `
  subscription OnDeleteInventoryReceived {
    onDeleteInventoryReceived {
      id
      comments
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateInventoryReceivedLine = /* GraphQL */ `
  subscription OnCreateInventoryReceivedLine {
    onCreateInventoryReceivedLine {
      id
      current
      received
      comments
      InventoryReceived {
        id
        comments
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      Product {
        id
        name
        description
        price
        tags
        cost
        barcode
        sku
        quantity
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
      inventoryReceivedLineInventoryReceivedId
      inventoryReceivedLineProductId
    }
  }
`;
export const onUpdateInventoryReceivedLine = /* GraphQL */ `
  subscription OnUpdateInventoryReceivedLine {
    onUpdateInventoryReceivedLine {
      id
      current
      received
      comments
      InventoryReceived {
        id
        comments
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      Product {
        id
        name
        description
        price
        tags
        cost
        barcode
        sku
        quantity
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
      inventoryReceivedLineInventoryReceivedId
      inventoryReceivedLineProductId
    }
  }
`;
export const onDeleteInventoryReceivedLine = /* GraphQL */ `
  subscription OnDeleteInventoryReceivedLine {
    onDeleteInventoryReceivedLine {
      id
      current
      received
      comments
      InventoryReceived {
        id
        comments
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      Product {
        id
        name
        description
        price
        tags
        cost
        barcode
        sku
        quantity
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
      inventoryReceivedLineInventoryReceivedId
      inventoryReceivedLineProductId
    }
  }
`;
export const onCreatePrinter = /* GraphQL */ `
  subscription OnCreatePrinter {
    onCreatePrinter {
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
export const onUpdatePrinter = /* GraphQL */ `
  subscription OnUpdatePrinter {
    onUpdatePrinter {
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
export const onDeletePrinter = /* GraphQL */ `
  subscription OnDeletePrinter {
    onDeletePrinter {
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
export const onCreateStation = /* GraphQL */ `
  subscription OnCreateStation {
    onCreateStation {
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
export const onUpdateStation = /* GraphQL */ `
  subscription OnUpdateStation {
    onUpdateStation {
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
export const onDeleteStation = /* GraphQL */ `
  subscription OnDeleteStation {
    onDeleteStation {
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
