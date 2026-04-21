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

    const orders = await getOrders(event.arguments, event.identity?.claims?.sub);
    const groups = processGroups(orders, event.arguments);
    const employeeList = Object.values(groups.byEmployee);
    const productList = Object.values(groups.byProduct);
    const dateList = Object.values(groups.byDate);

    sortDescListBy(productList, 'amount');
    sortDescListBy(employeeList, 'amount');

    const res = {
        products: productList,
        employees: employeeList,
        dates: dateList,
        totalAmount: employeeList.reduce((total, e) => total + e.amount, 0),
        totalOrders: employeeList.reduce((total, e) => total + e.orders, 0),
    };

    return res;
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
        deduped.set(order.id, order);
    });

    return Array.from(deduped.values());
}

async function queryOrdersForStatus(status, range, tenantId) {
    const params = {
        TableName: process.env.API_POS_ORDERTABLE_NAME,
        IndexName: 'byStatusByOrderDate',
        KeyConditionExpression: '#status = :status AND #orderDate BETWEEN :from AND :to',
        FilterExpression: '#tenantId = :tenantId',
        ExpressionAttributeValues: {
            ':status': status,
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
        params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (typeof data.LastEvaluatedKey !== 'undefined');

    return scanResults;
}

function processGroups(orders, range) {
    const res = {
        byEmployee: {},
        byProduct: {},
        byDate: {}
    };

    const from = new Date(range.from);
    const to = new Date(range.to);
    const daysDiff = (to - from) / 1000 / 86400;
    
    let dateGrouping = 'days';
    if (daysDiff > 365) dateGrouping = 'year';
    if (daysDiff > 31) dateGrouping = 'month';
    
    console.log('days diff', daysDiff);

    orders.forEach((order) => {
        const employeeId = order.createdBy?.id || order.employeeId || 'unknown';
        const employeeName = order.createdBy?.name || order.employeeName || 'Unknown';
        const employeeGroup = res.byEmployee[employeeId] || {
            employeeId,
            employeeName,
            orders: 0,
            amount: 0,
        };
        employeeGroup.orders += 1;
        employeeGroup.amount += order.total;
        res.byEmployee[employeeId] = employeeGroup;

        const datePiece = firstXOfDate(order.orderDate, dateGrouping);
        const dateGroup = res.byDate[datePiece] || {
            datePart: datePiece,
            orders: 0,
            amount: 0,
        };
        dateGroup.orders += 1;
        dateGroup.amount += order.total;
        res.byDate[datePiece] = dateGroup;


        order.lines.forEach(l => {
            const productGroup = res.byProduct[l.productId] || {
                productId: l.productId,
                productName: l.productName,
                unitOfMeasure: l.unitOfMeasure,
                amount: 0,
                quantity: 0,
            };
            productGroup.amount += l.quantity * l.price;
            productGroup.quantity += l.quantity;
            
            res.byProduct[l.productId] = productGroup;
        });
        
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

const sortDescListBy = (items, key) => {
    items.sort((a, b) => {
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;

        return 0;
    });
}

const datePart = {
    days: 10,
    month: 7,
    year: 4
}

const firstXOfDate = (dateStr, part) => dateStr.substring(0, datePart[part]);
