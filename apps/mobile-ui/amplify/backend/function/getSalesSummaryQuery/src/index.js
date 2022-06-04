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
    const groups = processGroups(orders);
    const employeeList = Object.values(groups.byEmployee);
    const productList = Object.values(groups.byProduct);

    const res = {
        products: productList,
        employees: employeeList,
        totalAmount: employeeList.reduce((total, e) => total + e.amount, 0),
    };

    console.log(`RESULT: ${JSON.stringify(res)}`);

    return res;

    // return {
    //     statusCode: 200,
    //     //  Uncomment below to enable CORS requests
    //     headers: {
    //         'Access-Control-Allow-Origin': '*',
    //         'Access-Control-Allow-Headers': '*',
    //     },
    //     body: JSON.stringify(res),
    // };
};

async function getOrders(event) {
    var params = {
        TableName: 'Order-libe2xk2rvftbi24xplh4x5gnm-develop',
        IndexName: 'byStatusByOrderDate',
        KeyConditionExpression: '#status = :status AND #orderDate > :from',
        ExpressionAttributeValues: {
            ':status': 'PAID',
            ':from': event.arguments.from,
        },
        ExpressionAttributeNames: {
            '#status': 'status',
            '#orderDate': 'orderDate',
        },
    };

    const data = await docClient.query(params).promise();
    
    return data.Items;
}

function processGroups(orders) {
    const res = {
        byEmployee: {},
        byProduct: {},
    };

    orders.forEach((order) => {
        const employeeGroup = res.byEmployee[order.employeeId] || {
            employeeId: order.employeeId,
            employeeName: order.employeeName,
            orders: 0,
            amount: 0,
        };
        employeeGroup.orders += 1;
        employeeGroup.amount += order.total;

        order.lines.forEach(l => {
            const productGroup = res.byProduct[l.productId] || {
                productId: l.productId,
                productName: l.productName,
                amount: 0,
                quantity: 0,
            };
            productGroup.amount += l.quantity * l.price;
            productGroup.quantity += l.quantity;
            
            res.byProduct[l.productId] = productGroup;
        });
        
        res.byEmployee[order.employeeId] = employeeGroup;
    }, {});

    return res;
}
