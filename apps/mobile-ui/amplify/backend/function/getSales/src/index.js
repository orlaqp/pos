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
    
    return getOrders(event.arguments);
};

async function getOrders(range) {
    var params = {
        TableName: process.env.API_POS_ORDERTABLE_NAME,
        // TableName: 'Order-libe2xk2rvftbi24xplh4x5gnm-develop',
        IndexName: 'byStatusByOrderDate',
        KeyConditionExpression: '#status = :status AND #orderDate BETWEEN :from AND :to',
        ExpressionAttributeValues: {
            ':status': 'PAID',
            ':from': range.from,
            ':to': range.to,
        },
        ExpressionAttributeNames: {
            '#status': 'status',
            '#orderDate': 'orderDate',
        },
    };
    
    const scanResults = [];
    let data;
    do {
        data = await docClient.query(params).promise();
        data.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = data.LastEvaluatedKey;
    } while(typeof data.LastEvaluatedKey !== "undefined");
    
    return scanResults;
}
