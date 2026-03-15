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

    var params = {
        TableName: process.env.API_POS_ORDERTABLE_NAME,
        IndexName: 'byStatusByOrderDate',
        KeyConditionExpression: '#status = :status AND #orderDate BETWEEN :from AND :to',
        FilterExpression: '#tenantId = :tenantId',
        ExpressionAttributeValues: {
            ':status': 'PAID',
            ':from': range.from,
            ':to': range.to,
            ':tenantId': tenantId,
        },
        ExpressionAttributeNames: {
            '#status': 'status',
            '#orderDate': 'orderDate',
            '#tenantId': 'tenantId',
        },
    };
    
    const scanResults = [];
    let data;
    do {
        data = await docClient.query(params).promise();
        data.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = data.LastEvaluatedKey;
    } while(typeof data.LastEvaluatedKey !== "undefined");
    
    return scanResults.filter(i => !i._deleted);
}
