/* Amplify Params - DO NOT EDIT
	API_POS_GRAPHQLAPIIDOUTPUT
	API_POS_ORDERTABLE_ARN
	API_POS_ORDERTABLE_NAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
 exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    const orders = await getOrders(event);
    const groups = processGroups(orders);
    const employeeList = Object.values(groups.byEmployee);
    const productList = Object.values(groups.byProduct);

    sortListBy(productList, 'amount');
    sortListBy(employeeList, 'amount');

    const res = {
        products: productList,
        employees: employeeList,
        totalAmount: employeeList.reduce((total, e) => total + e.amount, 0),
        totalOrders: employeeList.reduce((total, e) => total + e.orders, 0),
    };

    return res;
};

async function getOrders(event) {
    var params = {
        TableName: process.env.API_POS_ORDERTABLE_NAME,
        IndexName: 'byStatusByOrderDate',
        KeyConditionExpression: '#status = :status AND #orderDate BETWEEN :from AND :to',
        ExpressionAttributeValues: {
            ':status': 'PAID',
            ':from': event.arguments.from,
            ':to': event.arguments.to,
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

const sortListBy = (items, key) => {
    items.sort((a, b) => {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;

        return 0;
    });
}
