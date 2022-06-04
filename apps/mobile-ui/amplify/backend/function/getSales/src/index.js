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

async function getOrders(args) {
    var params = {
        TableName: process.env.API_POS_ORDERTABLE_NAME,
        // TableName: 'Order-libe2xk2rvftbi24xplh4x5gnm-develop',
        IndexName: 'byStatusByOrderDate',
        KeyConditionExpression: '#status = :status AND #orderDate BETWEEN :from AND :to',
        ExpressionAttributeValues: {
            ':status': args.status,
            ':from': args.from,
            ':to': args.to,
        },
        ExpressionAttributeNames: {
            '#status': 'status',
            '#orderDate': 'orderDate',
        },
    };

    const data = await docClient.query(params).promise();
    
    return data.Items;
}
