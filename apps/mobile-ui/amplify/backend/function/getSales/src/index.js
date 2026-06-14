/* Amplify Params - DO NOT EDIT
	API_POS_GRAPHQLAPIIDOUTPUT
	API_POS_ORDERTABLE_ARN
	API_POS_ORDERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    return getOrders(event.arguments, event.identity?.claims?.sub);
};

async function getOrders(range, tenantId) {
    if (!tenantId) {
        throw new Error('Missing tenant claim');
    }

    const requestedStatuses = Array.isArray(range.statuses)
        ? range.statuses.filter(Boolean)
        : range.status
        ? [range.status]
        : [];
    if (!requestedStatuses.length) {
        throw new Error('Missing statuses argument');
    }
    const allOrders = await Promise.all(
        requestedStatuses.map((status) => queryOrdersForStatus(status, range, tenantId))
    );

    const deduped = new Map();
    allOrders.flat().forEach((order) => {
        if (!order?.id || order._deleted) return;
        deduped.set(order.id, trimOrderForReports(order));
    });

    return Array.from(deduped.values()).sort((left, right) => {
        const leftDate = left.updatedAt || left.orderDate || '';
        const rightDate = right.updatedAt || right.orderDate || '';
        return leftDate > rightDate ? -1 : leftDate < rightDate ? 1 : 0;
    });
}

async function queryOrdersForStatus(status, range, tenantId) {
    const params = {
        TableName: process.env.API_POS_ORDERTABLE_NAME,
        IndexName: 'byStatusByOrderDate',
        KeyConditionExpression: '#status = :status AND #orderDate BETWEEN :from AND :to',
        FilterExpression: '#tenantId = :tenantId',
        ProjectionExpression:
            '#id, #orderNo, #orderDate, #createdAt, #updatedAt, #subtotal, #tax, #total, #status, #employeeId, #employeeName, #createdBy, #lines, #discountTotal, #appliedDiscountSummary, #paymentInfo, #refundInfo, #tenantId, #deleted',
        ExpressionAttributeValues: {
            ':status': status,
            ':from': range.from,
            ':to': range.to,
            ':tenantId': tenantId,
        },
        ExpressionAttributeNames: {
            '#id': 'id',
            '#orderNo': 'orderNo',
            '#status': 'status',
            '#orderDate': 'orderDate',
            '#createdAt': 'createdAt',
            '#updatedAt': 'updatedAt',
            '#subtotal': 'subtotal',
            '#tax': 'tax',
            '#total': 'total',
            '#employeeId': 'employeeId',
            '#employeeName': 'employeeName',
            '#createdBy': 'createdBy',
            '#lines': 'lines',
            '#discountTotal': 'discountTotal',
            '#appliedDiscountSummary': 'appliedDiscountSummary',
            '#paymentInfo': 'paymentInfo',
            '#refundInfo': 'refundInfo',
            '#tenantId': 'tenantId',
            '#deleted': '_deleted',
        },
    };

    const scanResults = [];
    let data;
    do {
        data = await docClient.query(params).promise();
        data.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (typeof data.LastEvaluatedKey !== 'undefined');

    return scanResults;
}

function trimOrderForReports(order) {
    const createdAt = order.createdAt || order.orderDate || order.updatedAt || null;

    return {
        id: order.id,
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        createdAt,
        updatedAt: order.updatedAt,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: order.status,
        employeeId: order.employeeId,
        employeeName: order.employeeName,
        createdBy: order.createdBy
            ? {
                id: order.createdBy.id,
                name: order.createdBy.name,
            }
            : null,
        discountTotal: order.discountTotal,
        appliedDiscountSummary: order.appliedDiscountSummary,
        paymentInfo: order.paymentInfo
            ? {
                employeeId: order.paymentInfo.employeeId,
                employeeName: order.paymentInfo.employeeName,
                payments: (order.paymentInfo.payments || []).map((payment) => ({
                    type: payment?.type,
                    amount: payment?.amount,
                    baseAmount: payment?.baseAmount,
                    surchargeRate: payment?.surchargeRate,
                    surchargeAmount: payment?.surchargeAmount,
                })),
            }
            : null,
        refundInfo: order.refundInfo
            ? {
                employeeId: order.refundInfo.employeeId,
                employeeName: order.refundInfo.employeeName,
                comments: order.refundInfo.comments,
            }
            : null,
        lines: (order.lines || []).map((line) => ({
            identifier: line?.identifier,
            productId: line?.productId,
            productName: line?.productName,
            categoryId: line?.categoryId,
            unitOfMeasure: line?.unitOfMeasure,
            quantity: line?.quantity,
            price: line?.price,
            lineDiscountTotal: line?.lineDiscountTotal,
            allocatedOrderDiscountTotal: line?.allocatedOrderDiscountTotal,
            lineTotalBeforeTax: line?.lineTotalBeforeTax,
            lineTotalAfterTax: line?.lineTotalAfterTax,
            isEBTEligible: line?.isEBTEligible,
            ebtPaidAmount: line?.ebtPaidAmount,
            nonEbtPaidAmount: line?.nonEbtPaidAmount,
        })),
    };
}
