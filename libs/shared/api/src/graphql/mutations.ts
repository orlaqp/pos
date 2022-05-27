/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createBrand = /* GraphQL */ `
  mutation CreateBrand(
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
    }
  }
`;
export const updateBrand = /* GraphQL */ `
  mutation UpdateBrand(
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
    }
  }
`;
export const deleteBrand = /* GraphQL */ `
  mutation DeleteBrand(
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
    }
  }
`;
export const createCategory = /* GraphQL */ `
  mutation CreateCategory(
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
    }
  }
`;
export const updateCategory = /* GraphQL */ `
  mutation UpdateCategory(
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
    }
  }
`;
export const deleteCategory = /* GraphQL */ `
  mutation DeleteCategory(
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
    }
  }
`;
export const createCustomer = /* GraphQL */ `
  mutation CreateCustomer(
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
    }
  }
`;
export const updateCustomer = /* GraphQL */ `
  mutation UpdateCustomer(
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
    }
  }
`;
export const deleteCustomer = /* GraphQL */ `
  mutation DeleteCustomer(
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
    }
  }
`;
export const createOrder = /* GraphQL */ `
  mutation CreateOrder(
    $input: CreateOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    createOrder(input: $input, condition: $condition) {
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
export const updateOrder = /* GraphQL */ `
  mutation UpdateOrder(
    $input: UpdateOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    updateOrder(input: $input, condition: $condition) {
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
export const deleteOrder = /* GraphQL */ `
  mutation DeleteOrder(
    $input: DeleteOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    deleteOrder(input: $input, condition: $condition) {
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
export const createOrderLine = /* GraphQL */ `
  mutation CreateOrderLine(
    $input: CreateOrderLineInput!
    $condition: ModelOrderLineConditionInput
  ) {
    createOrderLine(input: $input, condition: $condition) {
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
export const updateOrderLine = /* GraphQL */ `
  mutation UpdateOrderLine(
    $input: UpdateOrderLineInput!
    $condition: ModelOrderLineConditionInput
  ) {
    updateOrderLine(input: $input, condition: $condition) {
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
export const deleteOrderLine = /* GraphQL */ `
  mutation DeleteOrderLine(
    $input: DeleteOrderLineInput!
    $condition: ModelOrderLineConditionInput
  ) {
    deleteOrderLine(input: $input, condition: $condition) {
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
export const createProduct = /* GraphQL */ `
  mutation CreateProduct(
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
export const updateProduct = /* GraphQL */ `
  mutation UpdateProduct(
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
export const deleteProduct = /* GraphQL */ `
  mutation DeleteProduct(
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
export const createPurchaseOrder = /* GraphQL */ `
  mutation CreatePurchaseOrder(
    $input: CreatePurchaseOrderInput!
    $condition: ModelPurchaseOrderConditionInput
  ) {
    createPurchaseOrder(input: $input, condition: $condition) {
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
export const updatePurchaseOrder = /* GraphQL */ `
  mutation UpdatePurchaseOrder(
    $input: UpdatePurchaseOrderInput!
    $condition: ModelPurchaseOrderConditionInput
  ) {
    updatePurchaseOrder(input: $input, condition: $condition) {
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
export const deletePurchaseOrder = /* GraphQL */ `
  mutation DeletePurchaseOrder(
    $input: DeletePurchaseOrderInput!
    $condition: ModelPurchaseOrderConditionInput
  ) {
    deletePurchaseOrder(input: $input, condition: $condition) {
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
export const createPurchaseOrderLine = /* GraphQL */ `
  mutation CreatePurchaseOrderLine(
    $input: CreatePurchaseOrderLineInput!
    $condition: ModelPurchaseOrderLineConditionInput
  ) {
    createPurchaseOrderLine(input: $input, condition: $condition) {
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
export const updatePurchaseOrderLine = /* GraphQL */ `
  mutation UpdatePurchaseOrderLine(
    $input: UpdatePurchaseOrderLineInput!
    $condition: ModelPurchaseOrderLineConditionInput
  ) {
    updatePurchaseOrderLine(input: $input, condition: $condition) {
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
export const deletePurchaseOrderLine = /* GraphQL */ `
  mutation DeletePurchaseOrderLine(
    $input: DeletePurchaseOrderLineInput!
    $condition: ModelPurchaseOrderLineConditionInput
  ) {
    deletePurchaseOrderLine(input: $input, condition: $condition) {
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
export const createStore = /* GraphQL */ `
  mutation CreateStore(
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
    }
  }
`;
export const updateStore = /* GraphQL */ `
  mutation UpdateStore(
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
    }
  }
`;
export const deleteStore = /* GraphQL */ `
  mutation DeleteStore(
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
    }
  }
`;
export const createSupplier = /* GraphQL */ `
  mutation CreateSupplier(
    $input: CreateSupplierInput!
    $condition: ModelSupplierConditionInput
  ) {
    createSupplier(input: $input, condition: $condition) {
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
export const updateSupplier = /* GraphQL */ `
  mutation UpdateSupplier(
    $input: UpdateSupplierInput!
    $condition: ModelSupplierConditionInput
  ) {
    updateSupplier(input: $input, condition: $condition) {
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
export const deleteSupplier = /* GraphQL */ `
  mutation DeleteSupplier(
    $input: DeleteSupplierInput!
    $condition: ModelSupplierConditionInput
  ) {
    deleteSupplier(input: $input, condition: $condition) {
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
export const createStock = /* GraphQL */ `
  mutation CreateStock(
    $input: CreateStockInput!
    $condition: ModelStockConditionInput
  ) {
    createStock(input: $input, condition: $condition) {
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
export const updateStock = /* GraphQL */ `
  mutation UpdateStock(
    $input: UpdateStockInput!
    $condition: ModelStockConditionInput
  ) {
    updateStock(input: $input, condition: $condition) {
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
export const deleteStock = /* GraphQL */ `
  mutation DeleteStock(
    $input: DeleteStockInput!
    $condition: ModelStockConditionInput
  ) {
    deleteStock(input: $input, condition: $condition) {
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
export const createTag = /* GraphQL */ `
  mutation CreateTag(
    $input: CreateTagInput!
    $condition: ModelTagConditionInput
  ) {
    createTag(input: $input, condition: $condition) {
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
export const updateTag = /* GraphQL */ `
  mutation UpdateTag(
    $input: UpdateTagInput!
    $condition: ModelTagConditionInput
  ) {
    updateTag(input: $input, condition: $condition) {
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
export const deleteTag = /* GraphQL */ `
  mutation DeleteTag(
    $input: DeleteTagInput!
    $condition: ModelTagConditionInput
  ) {
    deleteTag(input: $input, condition: $condition) {
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
export const createUnitOfMeasure = /* GraphQL */ `
  mutation CreateUnitOfMeasure(
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
    }
  }
`;
export const updateUnitOfMeasure = /* GraphQL */ `
  mutation UpdateUnitOfMeasure(
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
    }
  }
`;
export const deleteUnitOfMeasure = /* GraphQL */ `
  mutation DeleteUnitOfMeasure(
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
    }
  }
`;
export const createInventory = /* GraphQL */ `
  mutation CreateInventory(
    $input: CreateInventoryInput!
    $condition: ModelInventoryConditionInput
  ) {
    createInventory(input: $input, condition: $condition) {
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
export const updateInventory = /* GraphQL */ `
  mutation UpdateInventory(
    $input: UpdateInventoryInput!
    $condition: ModelInventoryConditionInput
  ) {
    updateInventory(input: $input, condition: $condition) {
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
export const deleteInventory = /* GraphQL */ `
  mutation DeleteInventory(
    $input: DeleteInventoryInput!
    $condition: ModelInventoryConditionInput
  ) {
    deleteInventory(input: $input, condition: $condition) {
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
export const createInventoryChanges = /* GraphQL */ `
  mutation CreateInventoryChanges(
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
export const updateInventoryChanges = /* GraphQL */ `
  mutation UpdateInventoryChanges(
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
export const deleteInventoryChanges = /* GraphQL */ `
  mutation DeleteInventoryChanges(
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
export const createInventoryCount = /* GraphQL */ `
  mutation CreateInventoryCount(
    $input: CreateInventoryCountInput!
    $condition: ModelInventoryCountConditionInput
  ) {
    createInventoryCount(input: $input, condition: $condition) {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateInventoryCount = /* GraphQL */ `
  mutation UpdateInventoryCount(
    $input: UpdateInventoryCountInput!
    $condition: ModelInventoryCountConditionInput
  ) {
    updateInventoryCount(input: $input, condition: $condition) {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteInventoryCount = /* GraphQL */ `
  mutation DeleteInventoryCount(
    $input: DeleteInventoryCountInput!
    $condition: ModelInventoryCountConditionInput
  ) {
    deleteInventoryCount(input: $input, condition: $condition) {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createInventoryCountLine = /* GraphQL */ `
  mutation CreateInventoryCountLine(
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
export const updateInventoryCountLine = /* GraphQL */ `
  mutation UpdateInventoryCountLine(
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
export const deleteInventoryCountLine = /* GraphQL */ `
  mutation DeleteInventoryCountLine(
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
export const createInventoryReceive = /* GraphQL */ `
  mutation CreateInventoryReceive(
    $input: CreateInventoryReceiveInput!
    $condition: ModelInventoryReceiveConditionInput
  ) {
    createInventoryReceive(input: $input, condition: $condition) {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const updateInventoryReceive = /* GraphQL */ `
  mutation UpdateInventoryReceive(
    $input: UpdateInventoryReceiveInput!
    $condition: ModelInventoryReceiveConditionInput
  ) {
    updateInventoryReceive(input: $input, condition: $condition) {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const deleteInventoryReceive = /* GraphQL */ `
  mutation DeleteInventoryReceive(
    $input: DeleteInventoryReceiveInput!
    $condition: ModelInventoryReceiveConditionInput
  ) {
    deleteInventoryReceive(input: $input, condition: $condition) {
      id
      comments
      status
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const createInventoryReceiveLine = /* GraphQL */ `
  mutation CreateInventoryReceiveLine(
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
export const updateInventoryReceiveLine = /* GraphQL */ `
  mutation UpdateInventoryReceiveLine(
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
export const deleteInventoryReceiveLine = /* GraphQL */ `
  mutation DeleteInventoryReceiveLine(
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
export const createPrinter = /* GraphQL */ `
  mutation CreatePrinter(
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
    }
  }
`;
export const updatePrinter = /* GraphQL */ `
  mutation UpdatePrinter(
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
    }
  }
`;
export const deletePrinter = /* GraphQL */ `
  mutation DeletePrinter(
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
    }
  }
`;
export const createStation = /* GraphQL */ `
  mutation CreateStation(
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
    }
  }
`;
export const updateStation = /* GraphQL */ `
  mutation UpdateStation(
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
    }
  }
`;
export const deleteStation = /* GraphQL */ `
  mutation DeleteStation(
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
    }
  }
`;
