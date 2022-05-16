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
export const updateOrder = /* GraphQL */ `
  mutation UpdateOrder(
    $input: UpdateOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    updateOrder(input: $input, condition: $condition) {
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
export const deleteOrder = /* GraphQL */ `
  mutation DeleteOrder(
    $input: DeleteOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    deleteOrder(input: $input, condition: $condition) {
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
export const createOrderLine = /* GraphQL */ `
  mutation CreateOrderLine(
    $input: CreateOrderLineInput!
    $condition: ModelOrderLineConditionInput
  ) {
    createOrderLine(input: $input, condition: $condition) {
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
      tax
      discountType
      discountValue
      orderID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      orderLineProductId
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
      tax
      discountType
      discountValue
      orderID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      orderLineProductId
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
      tax
      discountType
      discountValue
      orderID
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      orderLineProductId
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
