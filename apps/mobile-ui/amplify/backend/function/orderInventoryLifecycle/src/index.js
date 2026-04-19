/* Amplify Params - DO NOT EDIT
	API_POS_GRAPHQLAPIIDOUTPUT
	API_POS_ORDERTABLE_NAME
	API_POS_PRODUCTTABLE_NAME
	ENV
	ORDER_INVENTORY_LEDGER_TABLE_NAME
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const https = require('https');

AWS.config.update({ region: process.env.REGION });

const docClient = new AWS.DynamoDB.DocumentClient();
const converter = AWS.DynamoDB.Converter;
const appsync = new AWS.AppSync({ region: process.env.REGION });

let resolvedGraphqlEndpointPromise = null;

const UPDATE_PRODUCT_MUTATION = /* GraphQL */ `
  mutation UpdateProductFromOrderInventory(
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

const UPDATE_ORDER_MUTATION = /* GraphQL */ `
  mutation UpdateOrderInventoryLifecycle(
    $input: UpdateOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    updateOrder(input: $input, condition: $condition) {
      id
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

const UPDATE_ORDER_REFUND_MUTATION = /* GraphQL */ `
  mutation UpdateOrderRefundInventoryLifecycle(
    $input: UpdateOrderRefundInput!
    $condition: ModelOrderRefundConditionInput
  ) {
    updateOrderRefund(input: $input, condition: $condition) {
      id
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

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  for (const record of event.Records || []) {
    await processRecord(record);
  }
};

async function processRecord(record) {
  if (!record?.dynamodb?.NewImage) {
    return;
  }

  const newItem = converter.unmarshall(record.dynamodb.NewImage);
  const oldItem = record.dynamodb.OldImage
    ? converter.unmarshall(record.dynamodb.OldImage)
    : null;

  if (isRefundRecord(newItem)) {
    await processRefundRecord(newItem, oldItem);
    return;
  }

  await processOrderRecord(newItem, oldItem);
}

async function processOrderRecord(newOrder, oldOrder) {

  const eventInfo = getInventoryEvent(newOrder, oldOrder);
  if (!eventInfo) {
    return;
  }

  const orderId = newOrder.id;
  const operationKey = `ORDER:${orderId}:${eventInfo.operation}`;
  const latestOrder = await getItem(process.env.API_POS_ORDERTABLE_NAME, orderId);
  if (!latestOrder) {
    return;
  }

  await updateOrderState(latestOrder, {
    inventoryApplyState: 'APPLYING',
    inventoryApplyOperationId: operationKey,
    inventoryApplyError: null,
    inventoryAppliedAt: null,
  });

  try {
    const lineSummary = summarizeOrderLines(newOrder.lines || [], eventInfo.multiplier);

    for (const [productId, delta] of Object.entries(lineSummary)) {
      const ledgerEntry = await getLedger(operationKey, productId);
      if (ledgerEntry?.status === 'APPLIED') {
        continue;
      }

      await applyProductDelta(productId, delta);
      await putLedger(operationKey, {
        productId,
        appliedDelta: delta,
        status: 'APPLIED',
      });
    }

    const refreshedOrder = await getItem(process.env.API_POS_ORDERTABLE_NAME, orderId);
    if (!refreshedOrder) {
      return;
    }

    await updateOrderState(refreshedOrder, {
      inventoryApplyState: 'APPLIED',
      inventoryApplyOperationId: operationKey,
      inventoryApplyError: null,
      inventoryAppliedAt: new Date().toISOString(),
    });
  } catch (error) {
    const refreshedOrder = await getItem(process.env.API_POS_ORDERTABLE_NAME, orderId);
    if (refreshedOrder) {
      await updateOrderState(refreshedOrder, {
        inventoryApplyState: 'FAILED',
        inventoryApplyOperationId: operationKey,
        inventoryApplyError: getErrorMessage(error),
        inventoryAppliedAt: null,
      }).catch((updateError) => {
        console.error('Unable to mark order inventory failure', updateError);
      });
    }

    throw error;
  }
}

async function processRefundRecord(newRefund, oldRefund) {
  const eventInfo = getRefundInventoryEvent(newRefund, oldRefund);
  if (!eventInfo) {
    return;
  }

  const refundId = newRefund.id;
  const operationKey =
    newRefund.inventoryApplyOperationId || `ORDER_REFUND:${newRefund.orderId}:${refundId}`;
  const latestRefund = await getItem(process.env.API_POS_ORDERREFUNDTABLE_NAME, refundId);
  if (!latestRefund) {
    return;
  }

  await updateRefundState(latestRefund, {
    inventoryApplyState: 'APPLYING',
    inventoryApplyOperationId: operationKey,
    inventoryApplyError: null,
    inventoryAppliedAt: null,
  });

  try {
    const refundLines = await getRefundLinesWithRetry(newRefund);
    if (!refundLines.length) {
      throw new Error(`Refund ${refundId} has no refund lines to apply`);
    }
    const lineSummary = summarizeRefundLines(refundLines);

    for (const [productId, delta] of Object.entries(lineSummary)) {
      const ledgerEntry = await getLedger(operationKey, productId);
      if (ledgerEntry?.status === 'APPLIED') {
        continue;
      }

      await applyProductDelta(productId, delta);
      await putLedger(operationKey, {
        productId,
        appliedDelta: delta,
        status: 'APPLIED',
      });
    }

    const refreshedRefund = await getItem(
      process.env.API_POS_ORDERREFUNDTABLE_NAME,
      refundId
    );
    if (!refreshedRefund) {
      return;
    }

    await updateRefundState(refreshedRefund, {
      inventoryApplyState: 'APPLIED',
      inventoryApplyOperationId: operationKey,
      inventoryApplyError: null,
      inventoryAppliedAt: new Date().toISOString(),
    });
  } catch (error) {
    const refreshedRefund = await getItem(
      process.env.API_POS_ORDERREFUNDTABLE_NAME,
      refundId
    );
    if (refreshedRefund) {
      await updateRefundState(refreshedRefund, {
        inventoryApplyState: 'FAILED',
        inventoryApplyOperationId: operationKey,
        inventoryApplyError: getErrorMessage(error),
        inventoryAppliedAt: null,
      }).catch((updateError) => {
        console.error('Unable to mark refund inventory failure', updateError);
      });
    }

    throw error;
  }
}

function getInventoryEvent(newOrder, oldOrder) {
  const newStatus = newOrder?.status;
  const oldStatus = oldOrder?.status;

  if (newStatus === 'PAID' && oldStatus !== 'PAID') {
    return {
      operation: 'PAID',
      multiplier: -1,
    };
  }

  return null;
}

function getRefundInventoryEvent(newRefund, oldRefund) {
  if (!newRefund?.id) {
    return null;
  }

  if (
    newRefund.status === 'COMPLETED' &&
    newRefund.inventoryApplyState !== 'APPLIED' &&
    oldRefund?.inventoryApplyState !== 'APPLIED'
  ) {
    return {
      operation: 'REFUND',
    };
  }

  return null;
}

function isRefundRecord(item) {
  return !!item?.refundAmount && !!item?.orderId && !!item?.refundDate;
}

function summarizeOrderLines(lines, multiplier) {
  return (lines || []).reduce((summary, line) => {
    if (!line?.productId) {
      return summary;
    }

    summary[line.productId] = (summary[line.productId] || 0) + multiplier * Number(line.quantity || 0);
    return summary;
  }, {});
}

function summarizeRefundLines(lines) {
  return (lines || []).reduce((summary, line) => {
    if (!line?.productId) {
      return summary;
    }

    summary[line.productId] =
      (summary[line.productId] || 0) + Number(line.quantityRefunded || 0);
    return summary;
  }, {});
}

async function applyProductDelta(productId, delta) {
  let attempts = 0;

  while (attempts < 4) {
    attempts += 1;
    const product = await getItem(process.env.API_POS_PRODUCTTABLE_NAME, productId);
    if (!product) {
      throw new Error(`Product ${productId} was not found`);
    }

    const nextQuantity = Number(product.quantity || 0) + Number(delta || 0);
    try {
      await graphqlRequest(UPDATE_PRODUCT_MUTATION, {
        input: {
          id: productId,
          tenantId: product.tenantId,
          quantity: nextQuantity,
          _version: product._version,
        },
      });
      return;
    } catch (error) {
      if (!isConflictError(error) || attempts >= 4) {
        throw error;
      }
    }
  }

  throw new Error(`Unable to apply order inventory for product ${productId}`);
}

async function updateOrderState(order, changes) {
  await graphqlRequest(UPDATE_ORDER_MUTATION, {
    input: {
      id: order.id,
      tenantId: order.tenantId,
      _version: order._version,
      inventoryApplyState: changes.inventoryApplyState,
      inventoryApplyOperationId: changes.inventoryApplyOperationId,
      inventoryApplyError: changes.inventoryApplyError,
      inventoryAppliedAt: changes.inventoryAppliedAt,
    },
  });
}

async function updateRefundState(refund, changes) {
  await graphqlRequest(UPDATE_ORDER_REFUND_MUTATION, {
    input: {
      id: refund.id,
      tenantId: refund.tenantId,
      _version: refund._version,
      inventoryApplyState: changes.inventoryApplyState,
      inventoryApplyOperationId: changes.inventoryApplyOperationId,
      inventoryApplyError: changes.inventoryApplyError,
      inventoryAppliedAt: changes.inventoryAppliedAt,
    },
  });
}

async function getItem(tableName, id) {
  const result = await docClient
    .get({
      TableName: tableName,
      Key: {
        id,
      },
    })
    .promise();

  return result.Item || null;
}

async function getRefundLines(refundId) {
  const result = await docClient
    .query({
      TableName: process.env.API_POS_ORDERREFUNDLINETABLE_NAME,
      IndexName: 'byRefundId',
      KeyConditionExpression: 'refundId = :refundId',
      ExpressionAttributeValues: {
        ':refundId': refundId,
      },
    })
    .promise();

  return result.Items || [];
}

async function getRefundLinesWithRetry(refund) {
  const refundLookupIds = getRefundLookupIds(refund);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let lines = [];

    for (const refundId of refundLookupIds) {
      lines = await getRefundLines(refundId);
      if (lines.length) {
        return lines;
      }
    }

    if (!lines.length && refund?.orderId && refund?.refundDate) {
      lines = await getRefundLinesByOrderAndDate(refund.orderId, refund.refundDate);
    }

    if (lines.length) {
      return lines;
    }

    await delay(1000);
  }

  return [];
}

function getRefundLookupIds(refund) {
  const ids = new Set();
  if (refund?.id) {
    ids.add(refund.id);
  }

  const operationId = String(refund?.inventoryApplyOperationId || '');
  const fallbackId = operationId.split(':').pop();
  if (fallbackId) {
    ids.add(fallbackId);
  }

  return [...ids];
}

async function getRefundLinesByOrderAndDate(orderId, refundDate) {
  const result = await docClient
    .query({
      TableName: process.env.API_POS_ORDERREFUNDLINETABLE_NAME,
      IndexName: 'byOrderIdByRefundDate',
      KeyConditionExpression: 'orderId = :orderId AND refundDate = :refundDate',
      ExpressionAttributeValues: {
        ':orderId': orderId,
        ':refundDate': refundDate,
      },
    })
    .promise();

  return result.Items || [];
}

async function getLedger(operationKey, productId) {
  const result = await docClient
    .get({
      TableName: process.env.ORDER_INVENTORY_LEDGER_TABLE_NAME,
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
      TableName: process.env.ORDER_INVENTORY_LEDGER_TABLE_NAME,
      Item: {
        operationKey,
        productId: item.productId,
        appliedDelta: item.appliedDelta,
        status: item.status,
        createdAt: new Date().toISOString(),
      },
    })
    .promise();
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

  const credentials = await getCredentials();
  const signer = new AWS.Signers.V4(request, 'appsync', true);
  signer.addAuthorization(credentials, AWS.util.date.getDate());

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

  if (!resolvedGraphqlEndpointPromise) {
    resolvedGraphqlEndpointPromise = appsync
      .getGraphqlApi({
        apiId: process.env.API_POS_GRAPHQLAPIIDOUTPUT,
      })
      .promise()
      .then((response) => {
        const endpointUrl = response?.graphqlApi?.uris?.GRAPHQL;
        if (!endpointUrl) {
          throw new Error('Unable to resolve GraphQL endpoint for order inventory lifecycle');
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

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
