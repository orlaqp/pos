/* Amplify Params - DO NOT EDIT
	API_POS_GRAPHQLAPIIDOUTPUT
	API_POS_ORDERTABLE_ARN
	API_POS_ORDERTABLE_NAME
Amplify Params - DO NOT EDIT */

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
        // IndexName: 'byDate',
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
