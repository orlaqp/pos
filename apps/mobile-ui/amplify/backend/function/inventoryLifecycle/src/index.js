/* Amplify Params - DO NOT EDIT
	API_POS_GRAPHQLAPIIDOUTPUT
	API_POS_INVENTORYCOUNTLINETABLE_NAME
	API_POS_INVENTORYCOUNTTABLE_NAME
	API_POS_INVENTORYRECEIVELINETABLE_NAME
	API_POS_INVENTORYRECEIVETABLE_NAME
	API_POS_PRODUCTTABLE_NAME
	ENV
	INVENTORY_LEDGER_TABLE_NAME
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const https = require('https');

AWS.config.update({ region: process.env.REGION });

const docClient = new AWS.DynamoDB.DocumentClient();
const appsync = new AWS.AppSync({ region: process.env.REGION });

let resolvedGraphqlEndpointPromise = null;

const UPDATE_PRODUCT_MUTATION = /* GraphQL */ `
  mutation UpdateProductFromLifecycle(
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
`;

const CREATE_INVENTORY_RECEIVE_MUTATION = /* GraphQL */ `
  mutation CreateInventoryReceiveFromLifecycle(
    $input: CreateInventoryReceiveInput!
  ) {
    createInventoryReceive(input: $input) {
      id
      tenantId
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
      _version
      __typename
    }
  }
`;

const UPDATE_INVENTORY_RECEIVE_MUTATION = /* GraphQL */ `
  mutation UpdateInventoryReceiveFromLifecycle(
    $input: UpdateInventoryReceiveInput!
  ) {
    updateInventoryReceive(input: $input) {
      id
      tenantId
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
      _version
      __typename
    }
  }
`;

const CREATE_INVENTORY_RECEIVE_LINE_MUTATION = /* GraphQL */ `
  mutation CreateInventoryReceiveLineFromLifecycle(
    $input: CreateInventoryReceiveLineInput!
  ) {
    createInventoryReceiveLine(input: $input) {
      id
      productId
      received
      inventoryReceiveLineInventoryReceiveId
      _version
      __typename
    }
  }
`;

const UPDATE_INVENTORY_RECEIVE_LINE_MUTATION = /* GraphQL */ `
  mutation UpdateInventoryReceiveLineFromLifecycle(
    $input: UpdateInventoryReceiveLineInput!
  ) {
    updateInventoryReceiveLine(input: $input) {
      id
      productId
      received
      inventoryReceiveLineInventoryReceiveId
      _version
      __typename
    }
  }
`;

const DELETE_INVENTORY_RECEIVE_LINE_MUTATION = /* GraphQL */ `
  mutation DeleteInventoryReceiveLineFromLifecycle(
    $input: DeleteInventoryReceiveLineInput!
  ) {
    deleteInventoryReceiveLine(input: $input) {
      id
      _version
      __typename
    }
  }
`;

const CREATE_INVENTORY_COUNT_MUTATION = /* GraphQL */ `
  mutation CreateInventoryCountFromLifecycle(
    $input: CreateInventoryCountInput!
  ) {
    createInventoryCount(input: $input) {
      id
      tenantId
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
      _version
      __typename
    }
  }
`;

const UPDATE_INVENTORY_COUNT_MUTATION = /* GraphQL */ `
  mutation UpdateInventoryCountFromLifecycle(
    $input: UpdateInventoryCountInput!
  ) {
    updateInventoryCount(input: $input) {
      id
      tenantId
      status
      inventoryApplyState
      inventoryAppliedAt
      inventoryApplyOperationId
      inventoryApplyError
      _version
      __typename
    }
  }
`;

const CREATE_INVENTORY_COUNT_LINE_MUTATION = /* GraphQL */ `
  mutation CreateInventoryCountLineFromLifecycle(
    $input: CreateInventoryCountLineInput!
  ) {
    createInventoryCountLine(input: $input) {
      id
      productId
      current
      newCount
      inventoryCountLineInventoryCountId
      _version
      __typename
    }
  }
`;

const UPDATE_INVENTORY_COUNT_LINE_MUTATION = /* GraphQL */ `
  mutation UpdateInventoryCountLineFromLifecycle(
    $input: UpdateInventoryCountLineInput!
  ) {
    updateInventoryCountLine(input: $input) {
      id
      productId
      current
      newCount
      inventoryCountLineInventoryCountId
      _version
      __typename
    }
  }
`;

const DELETE_INVENTORY_COUNT_LINE_MUTATION = /* GraphQL */ `
  mutation DeleteInventoryCountLineFromLifecycle(
    $input: DeleteInventoryCountLineInput!
  ) {
    deleteInventoryCountLine(input: $input) {
      id
      _version
      __typename
    }
  }
`;

const SOURCE_CONFIG = {
  finalizeInventoryReceive: {
    sourceType: 'INVENTORY_RECEIVE',
    sourceTableName: process.env.API_POS_INVENTORYRECEIVETABLE_NAME,
    lineTableName: process.env.API_POS_INVENTORYRECEIVELINETABLE_NAME,
    lineParentKey: 'inventoryReceiveLineInventoryReceiveId',
    lineValueKey: 'received',
    createSourceMutation: CREATE_INVENTORY_RECEIVE_MUTATION,
    updateSourceMutation: UPDATE_INVENTORY_RECEIVE_MUTATION,
    createLineMutation: CREATE_INVENTORY_RECEIVE_LINE_MUTATION,
    updateLineMutation: UPDATE_INVENTORY_RECEIVE_LINE_MUTATION,
    deleteLineMutation: DELETE_INVENTORY_RECEIVE_LINE_MUTATION,
  },
  finalizeInventoryCount: {
    sourceType: 'INVENTORY_COUNT',
    sourceTableName: process.env.API_POS_INVENTORYCOUNTTABLE_NAME,
    lineTableName: process.env.API_POS_INVENTORYCOUNTLINETABLE_NAME,
    lineParentKey: 'inventoryCountLineInventoryCountId',
    lineValueKey: 'newCount',
    createSourceMutation: CREATE_INVENTORY_COUNT_MUTATION,
    updateSourceMutation: UPDATE_INVENTORY_COUNT_MUTATION,
    createLineMutation: CREATE_INVENTORY_COUNT_LINE_MUTATION,
    updateLineMutation: UPDATE_INVENTORY_COUNT_LINE_MUTATION,
    deleteLineMutation: DELETE_INVENTORY_COUNT_LINE_MUTATION,
  },
};

let currentGraphqlHost = null;
let currentAuthorizationToken = null;

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  currentGraphqlHost = event?.request?.headers?.host || null;
  currentAuthorizationToken = event?.request?.headers?.authorization || null;

  const fieldName = event?.fieldName || event?.info?.fieldName;
  const config = SOURCE_CONFIG[fieldName];
  if (!config) {
    throw new Error(`Unsupported inventory lifecycle operation: ${String(fieldName)}`);
  }

  const tenantId = event?.identity?.claims?.sub;
  if (!tenantId) {
    throw new Error('Missing tenant identity');
  }

  const input = event?.arguments?.input || {};
  const normalizedLines = normalizeLines(config.sourceType, input.lines);
  if (normalizedLines.length === 0) {
    throw new Error('At least one inventory line is required');
  }

  const existingSource = input.receiveId || input.countId
    ? await getItem(config.sourceTableName, input.receiveId || input.countId)
    : null;

  if (
    existingSource &&
    existingSource.inventoryApplyState === 'APPLIED' &&
    existingSource.inventoryApplyOperationId &&
    existingSource.inventoryApplyOperationId !== input.operationId
  ) {
    throw new Error('This inventory document has already been finalized');
  }

  if (
    existingSource &&
    existingSource.inventoryApplyState === 'APPLIED' &&
    existingSource.inventoryApplyOperationId === input.operationId
  ) {
    return buildIdempotentResult(
      `${config.sourceType}:${existingSource.id}`,
      existingSource.id,
      config.sourceType
    );
  }

  const upsertedSource = await upsertSource(config, {
    sourceId: input.receiveId || input.countId || existingSource?.id,
    tenantId,
    operationId: input.operationId,
    comments: input.comments || null,
    createdBy: input.createdBy,
  });

  try {
    await syncLines(config, {
      tenantId,
      sourceId: upsertedSource.id,
      lines: normalizedLines,
    });

    const operationKey = `${config.sourceType}:${upsertedSource.id}`;
    const affectedProducts = [];

    for (const line of normalizedLines) {
      const ledgerEntry = await getLedger(operationKey, line.productId);
      if (ledgerEntry?.status === 'APPLIED') {
        affectedProducts.push({
          productId: line.productId,
          finalQuantity: Number(ledgerEntry.finalQuantity || 0),
          appliedDelta: Number(ledgerEntry.appliedDelta || 0),
        });
        continue;
      }

      const applied = await applyInventoryLine(config, line, tenantId);
      await putLedger(operationKey, {
        productId: line.productId,
        finalQuantity: applied.finalQuantity,
        appliedDelta: applied.appliedDelta,
        status: 'APPLIED',
      });
      affectedProducts.push(applied);
    }

    const finalizedSource = await updateSource(config, {
      id: upsertedSource.id,
      tenantId,
      version: upsertedSource._version,
      status: 'COMPLETED',
      inventoryApplyState: 'APPLIED',
      inventoryApplyOperationId: input.operationId,
      inventoryApplyError: null,
      inventoryAppliedAt: new Date().toISOString(),
      comments: input.comments || null,
      createdBy: input.createdBy,
    });

    return {
      sourceId: finalizedSource.id,
      sourceType: config.sourceType,
      status: 'APPLIED',
      appliedAt: finalizedSource.inventoryAppliedAt,
      error: null,
      affectedProducts,
    };
  } catch (error) {
    console.error(`${config.sourceType} finalize failed`, error);
    await updateSource(config, {
      id: upsertedSource.id,
      tenantId,
      version: upsertedSource._version,
      status: 'COMPLETED',
      inventoryApplyState: 'FAILED',
      inventoryApplyOperationId: input.operationId,
      inventoryApplyError: getErrorMessage(error),
      inventoryAppliedAt: null,
      comments: input.comments || null,
      createdBy: input.createdBy,
    }).catch((updateError) => {
      console.error('Unable to record failed inventory finalization state', updateError);
    });
    throw error;
  }
};

function normalizeLines(sourceType, lines) {
  return (lines || [])
    .filter(Boolean)
    .map((line) => {
      if (sourceType === 'INVENTORY_RECEIVE') {
        return {
          id: line.id || undefined,
          productId: line.productId,
          productName: line.productName,
          unitOfMeasure: line.unitOfMeasure,
          received: Number(line.received || 0),
          comments: line.comments || null,
        };
      }

      return {
        id: line.id || undefined,
        productId: line.productId,
        productName: line.productName,
        unitOfMeasure: line.unitOfMeasure,
        current: Number(line.current || 0),
        newCount: Number(line.newCount || 0),
        comments: line.comments || null,
      };
    });
}

async function buildIdempotentResult(operationKey, sourceId, sourceType) {
  const records = await queryLedger(operationKey);
  return {
    sourceId,
    sourceType,
    status: 'APPLIED',
    appliedAt: null,
    error: null,
    affectedProducts: records.map((record) => ({
      productId: record.productId,
      finalQuantity: Number(record.finalQuantity || 0),
      appliedDelta: Number(record.appliedDelta || 0),
    })),
  };
}

async function upsertSource(config, source) {
  const existing = source.sourceId
    ? await getItem(config.sourceTableName, source.sourceId)
    : null;

  if (!existing) {
    const created = await graphqlRequest(config.createSourceMutation, {
      input: {
        id: source.sourceId,
        tenantId: source.tenantId,
        comments: source.comments,
        status: 'COMPLETED',
        createdBy: source.createdBy,
        inventoryApplyState: 'APPLYING',
        inventoryApplyOperationId: source.operationId,
        inventoryApplyError: null,
        inventoryAppliedAt: null,
      },
    });

    return firstGraphqlValue(created);
  }

  return updateSource(config, {
    id: existing.id,
    tenantId: source.tenantId,
    version: existing._version,
    status: 'COMPLETED',
    inventoryApplyState: 'APPLYING',
    inventoryApplyOperationId: source.operationId,
    inventoryApplyError: null,
    inventoryAppliedAt: null,
    comments: source.comments,
    createdBy: source.createdBy,
  });
}

async function updateSource(config, source) {
  const updated = await graphqlRequest(config.updateSourceMutation, {
    input: {
      id: source.id,
      tenantId: source.tenantId,
      comments: source.comments,
      status: source.status,
      createdBy: source.createdBy,
      inventoryApplyState: source.inventoryApplyState,
      inventoryApplyOperationId: source.inventoryApplyOperationId,
      inventoryApplyError: source.inventoryApplyError,
      inventoryAppliedAt: source.inventoryAppliedAt,
      _version: source.version,
    },
  });

  return firstGraphqlValue(updated);
}

async function syncLines(config, args) {
  const existingLines = await scanByParentKey(
    config.lineTableName,
    config.lineParentKey,
    args.sourceId,
    args.tenantId
  );
  const seenIds = new Set();
  const seenProducts = new Set();

  for (const line of args.lines) {
    const existing = findExistingLine(existingLines, line);
    if (!existing) {
      await graphqlRequest(config.createLineMutation, {
        input: buildLineInput(config, args.sourceId, args.tenantId, line),
      });
      continue;
    }

    seenIds.add(existing.id);
    seenProducts.add(existing.productId);

    await graphqlRequest(config.updateLineMutation, {
      input: {
        ...buildLineInput(config, args.sourceId, args.tenantId, line),
        id: existing.id,
        _version: existing._version,
      },
    });
  }

  for (const existing of existingLines) {
    if (seenIds.has(existing.id) || seenProducts.has(existing.productId)) {
      continue;
    }

    await graphqlRequest(config.deleteLineMutation, {
      input: {
        id: existing.id,
        _version: existing._version,
      },
    });
  }
}

function buildLineInput(config, sourceId, tenantId, line) {
  const base = {
    id: line.id,
    tenantId,
    productId: line.productId,
    productName: line.productName,
    unitOfMeasure: line.unitOfMeasure,
    comments: line.comments,
    [config.lineParentKey]: sourceId,
  };

  if (config.sourceType === 'INVENTORY_RECEIVE') {
    return {
      ...base,
      received: line.received,
    };
  }

  return {
    ...base,
    current: line.current,
    newCount: line.newCount,
  };
}

function findExistingLine(existingLines, line) {
  if (line.id) {
    const byId = existingLines.find((existing) => existing.id === line.id);
    if (byId) {
      return byId;
    }
  }

  return existingLines.find((existing) => existing.productId === line.productId);
}

async function applyInventoryLine(config, line, tenantId) {
  let attempts = 0;

  while (attempts < 4) {
    attempts += 1;
    const product = await getItem(process.env.API_POS_PRODUCTTABLE_NAME, line.productId);
    if (!product) {
      throw new Error(`Product ${line.productId} was not found`);
    }

    const currentQuantity = Number(product.quantity || 0);
    const appliedDelta =
      config.sourceType === 'INVENTORY_RECEIVE'
        ? Number(line.received || 0)
        : Number(line.newCount || 0) - currentQuantity;
    const finalQuantity =
      config.sourceType === 'INVENTORY_RECEIVE'
        ? currentQuantity + appliedDelta
        : Number(line.newCount || 0);

    if (appliedDelta === 0) {
      return {
        productId: line.productId,
        finalQuantity,
        appliedDelta,
      };
    }

    try {
      const result = await graphqlRequest(UPDATE_PRODUCT_MUTATION, {
        input: {
          id: line.productId,
          tenantId,
          quantity: finalQuantity,
          _version: product._version,
        },
      });

      const updated = firstGraphqlValue(result);
      return {
        productId: line.productId,
        finalQuantity: Number(updated.quantity || finalQuantity),
        appliedDelta,
      };
    } catch (error) {
      if (!isConflictError(error) || attempts >= 4) {
        throw error;
      }
    }
  }

  throw new Error(`Unable to apply inventory line for product ${line.productId}`);
}

async function getItem(tableName, id) {
  if (!id) {
    return null;
  }

  const result = await docClient
    .get({
      TableName: tableName,
      Key: { id },
    })
    .promise();

  return result.Item || null;
}

async function scanByParentKey(tableName, parentKey, parentId, tenantId) {
  const result = await docClient
    .scan({
      TableName: tableName,
      FilterExpression: '#parentKey = :parentId AND #tenantId = :tenantId',
      ExpressionAttributeNames: {
        '#parentKey': parentKey,
        '#tenantId': 'tenantId',
      },
      ExpressionAttributeValues: {
        ':parentId': parentId,
        ':tenantId': tenantId,
      },
    })
    .promise();

  return (result.Items || []).filter((item) => item._deleted !== true);
}

async function getLedger(operationKey, productId) {
  const result = await docClient
    .get({
      TableName: process.env.INVENTORY_LEDGER_TABLE_NAME,
      Key: {
        operationKey,
        productId,
      },
    })
    .promise();

  return result.Item || null;
}

async function putLedger(operationKey, item) {
  await docClient
    .put({
      TableName: process.env.INVENTORY_LEDGER_TABLE_NAME,
      Item: {
        operationKey,
        productId: item.productId,
        finalQuantity: item.finalQuantity,
        appliedDelta: item.appliedDelta,
        status: item.status,
        createdAt: new Date().toISOString(),
      },
    })
    .promise();
}

async function queryLedger(operationKey) {
  const result = await docClient
    .query({
      TableName: process.env.INVENTORY_LEDGER_TABLE_NAME,
      KeyConditionExpression: '#operationKey = :operationKey',
      ExpressionAttributeNames: {
        '#operationKey': 'operationKey',
      },
      ExpressionAttributeValues: {
        ':operationKey': operationKey,
      },
    })
    .promise();

  return result.Items || [];
}

async function graphqlRequest(query, variables) {
  const endpointUrl = await getGraphqlEndpointUrl();
  const endpoint = new AWS.Endpoint(endpointUrl);
  const request = new AWS.HttpRequest(endpoint, process.env.REGION);
  request.method = 'POST';
  request.path = '/graphql';
  request.headers.host = endpoint.host;
  request.headers['Content-Type'] = 'application/json';
  request.body = JSON.stringify({
    query,
    variables,
  });

  if (currentAuthorizationToken) {
    request.headers.Authorization = currentAuthorizationToken;
  } else {
    const credentials = await getCredentials();
    const signer = new AWS.Signers.V4(request, 'appsync', true);
    signer.addAuthorization(credentials, AWS.util.date.getDate());
  }

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: request.method,
        hostname: endpoint.host,
        path: request.path,
        headers: request.headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const parsed = data ? JSON.parse(data) : {};
          if (parsed.errors?.length) {
            reject(new Error(parsed.errors.map((entry) => entry.message).join(' | ')));
            return;
          }

          resolve(parsed.data);
        });
      }
    );

    req.on('error', reject);
    req.write(request.body);
    req.end();
  });
}

async function getGraphqlEndpointUrl() {
  if (process.env.API_POS_GRAPHQLAPIENDPOINTOUTPUT) {
    return process.env.API_POS_GRAPHQLAPIENDPOINTOUTPUT;
  }

  if (currentGraphqlHost) {
    return `https://${currentGraphqlHost}/graphql`;
  }

  if (!resolvedGraphqlEndpointPromise) {
    resolvedGraphqlEndpointPromise = appsync
      .getGraphqlApi({
        apiId: process.env.API_POS_GRAPHQLAPIIDOUTPUT,
      })
      .promise()
      .then((response) => {
        const endpointUrl = response?.graphqlApi?.uris?.GRAPHQL;
        if (!endpointUrl) {
          throw new Error('Unable to resolve GraphQL endpoint for inventory lifecycle');
        }

        return endpointUrl;
      })
      .catch((error) => {
        resolvedGraphqlEndpointPromise = null;
        throw error;
      });
  }

  return resolvedGraphqlEndpointPromise;
}

function firstGraphqlValue(data) {
  const values = Object.values(data || {});
  return values[0] || null;
}

function getCredentials() {
  return new Promise((resolve, reject) => {
    AWS.config.getCredentials((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(AWS.config.credentials);
    });
  });
}

function isConflictError(error) {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('conflict') ||
    message.includes('conditionalcheckfailed') ||
    message.includes('version')
  );
}

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return JSON.stringify(error);
}
