/* Amplify Params - DO NOT EDIT
	API_POS_GRAPHQLAPIENDPOINTOUTPUT
	API_POS_GRAPHQLAPIIDOUTPUT
	API_POS_GRAPHQLAPIKEYOUTPUT
	API_POS_ORDERLINETABLE_ARN
	API_POS_ORDERLINETABLE_NAME
	API_POS_ORDERTABLE_ARN
	API_POS_ORDERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 *  When writing Lambda functions that are connected via the @function directive, you can expect the following structure for the AWS Lambda event object.
 *  https://docs.amplify.aws/cli/graphql/custom-business-logic/#structure-of-the-function-event

Key	Description
typeName	The name of the parent object type of the field being resolver.
fieldName	The name of the field being resolved.
arguments	A map containing the arguments passed to the field being resolved.
identity	A map containing identity information for the request. Contains a nested key 'claims' that will contains the JWT claims if they exist.
source	When resolving a nested field in a query, the source contains parent value at runtime. For example when resolving Post.comments, the source will be the Post object.
request	The AppSync request object. Contains header information.
prev	When using pipeline resolvers, this contains the object returned by the previous function. You can return the previous value for auditing use cases.
 */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const environment = process.env.ENV;
// const apiGraphQLAPIIdOutput = process.env.API_MYPROJECT_GRAPHQLAPIIDOUTPUT;
// const orderTable = `Order-${apiGraphQLAPIIdOutput}-${environment}`;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    console.log('Env', JSON.stringify(process.env));
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const orders = await getOrders(event);
    const lines = await getOrderLines(event);
    const byEmployee = groupOrdersByEmployee(orders);
    const byProduct = groupOrderLinesByProduct(lines);
    const employeeList = Object.values(byEmployee);

    const res = {
        products: Object.values(byProduct),
        employees: employeeList,
        totalAmount: employeeList.reduce((total, e) => e.amount, 0)
    }

    console.log(`RESULT: ${res}`);

    return {
        statusCode: 200,
        //  Uncomment below to enable CORS requests
         headers: {
             "Access-Control-Allow-Origin": "*",
             "Access-Control-Allow-Headers": "*"
         },
        body: JSON.stringify(res),
    };
};

async function getOrders(event) {
    var params = {
        TableName: process.env.API_POS_ORDERTABLE_NAME,
        IndexName: 'byStatusByDate',
        KeyConditionExpression: '#status = :status AND #createdAt > :from',
        ExpressionAttributeValues: {
            ':status': 'PAID',
            ':from': event.arguments.from,
        },
        ExpressionAttributeNames: {
            '#status': 'status',
            '#createdAt': 'createdAt',
        },
    };

    const data = await docClient.query(params).promise();
    return data.Items;
}

async function getOrderLines(event) {
    var params = {
        TableName: process.env.API_POS_ORDERLINETABLE_NAME,
        IndexName: 'byDate',
        KeyConditionExpression: '#createdAt > :from',
        ExpressionAttributeNames: { '#createdAt': 'createdAt' },
        ExpressionAttributeValues: { ':from': event.arguments.from },
    };

    const data = await docClient.query(params).promise();
    return data.Items;
}

function groupOrdersByEmployee(orders) {
    const res = orders.reduce((groups, order) => {
        let group = groups[order.employeeId] || {
            employeeId: order.employeeId,
            employeeName: order.employeeName,
            amount: 0,
        };
        group.amount += order.total;
        groups[order.employeeId] = group;
        return groups;
    }, {});

    return res;
}

function groupOrderLinesByProduct(orderLines) {
    const res = orderLines.reduce((groups, line) => {
        const group = groups[line.productId] || {
            productId: line.productId,
            productName: line.productName,
            categoryName: 'test',
            amount: 0,
            quantity: 0,
        };
        group.amount += line.price * line.quantity;
        group.quantity += line.quantity;
        groups[line.productId] = group;
        return groups;
    }, {});

    return res;
}
