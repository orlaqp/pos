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

    const requestedStatus = range.status;
    if (!requestedStatus) {
        throw new Error('Missing status argument');
    }

    var params = {
        TableName: process.env.API_POS_ORDERTABLE_NAME,
        IndexName: 'byStatusByOrderDate',
        KeyConditionExpression: '#status = :status AND #orderDate BETWEEN :from AND :to',
        FilterExpression: '#tenantId = :tenantId',
        ProjectionExpression:
            '#id, #orderNo, #orderDate, #updatedAt, #subtotal, #tax, #total, #status, #employeeId, #employeeName, #lines, #discountTotal, #appliedDiscountSummary, #paymentInfo, #refundInfo, #tenantId, #deleted',
        ExpressionAttributeValues: {
            ':status': requestedStatus,
            ':from': range.from,
            ':to': range.to,
            ':tenantId': tenantId,
        },
        ExpressionAttributeNames: {
            '#id': 'id',
            '#orderNo': 'orderNo',
            '#status': 'status',
            '#orderDate': 'orderDate',
            '#updatedAt': 'updatedAt',
            '#subtotal': 'subtotal',
            '#tax': 'tax',
            '#total': 'total',
            '#employeeId': 'employeeId',
            '#employeeName': 'employeeName',
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
        params.ExclusiveStartKey  = data.LastEvaluatedKey;
    } while(typeof data.LastEvaluatedKey !== "undefined");
    
    return scanResults.filter(i => !i._deleted).map(trimOrderForReports);
}

function trimOrderForReports(order) {
    return {
        id: order.id,
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        updatedAt: order.updatedAt,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: order.status,
        employeeId: order.employeeId,
        employeeName: order.employeeName,
        discountTotal: order.discountTotal,
        appliedDiscountSummary: order.appliedDiscountSummary,
        paymentInfo: order.paymentInfo
            ? {
                employeeId: order.paymentInfo.employeeId,
                employeeName: order.paymentInfo.employeeName,
                payments: (order.paymentInfo.payments || []).map((payment) => ({
                    type: payment?.type,
                    amount: payment?.amount,
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
            productId: line?.productId,
            productName: line?.productName,
            categoryId: line?.categoryId,
            unitOfMeasure: line?.unitOfMeasure,
            quantity: line?.quantity,
            price: line?.price,
            lineTotalBeforeTax: line?.lineTotalBeforeTax,
            isEBTEligible: line?.isEBTEligible,
            ebtPaidAmount: line?.ebtPaidAmount,
            nonEbtPaidAmount: line?.nonEbtPaidAmount,
        })),
    };
}
