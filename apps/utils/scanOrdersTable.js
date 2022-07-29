// Load the AWS SDK for Node.js.
var AWS = require('aws-sdk');
const ScanCommand = require('@aws-sdk/lib-dynamodb').ScanCommand;

const { update } = require('./updateItem');
const ddbDocClient = require('./ddbDocClient').ddbDocClient;
// Set the AWS Region.
// AWS.config.update({ region: 'us-east-1' });

const tableName = 'Order-libe2xk2rvftbi24xplh4x5gnm-develop';

const params = {
    // Specify which items in the results are returned.
    FilterExpression: "createdAt >= :createdAt",
    // Define the expression attribute value, which are substitutes for the values you want to compare.
    ExpressionAttributeValues: {
        ":createdAt": "2022-07-28T00:00:00.000Z",
    //     ":s": {N: 1},
    //     ":e": {N: 2},
    },
    // Set the projection expression, which are the attributes that you want.
    // ProjectionExpression: '#id, #empId, #empName',
    // ProjectionExpression: 'id, empId, empName',
    // ProjectionAttributeNames: '{ "#id": "id", "#empId": "employeeId", "#empName": "employeeName", "#l": "orderNo" }',
    TableName: tableName,
};

const scanTable = async () => {
    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        //   console.log("success", data.Items);
        let total = 0;
        data.Items.forEach(async function (element, index, array) {
            // console.log(
            //     'printing',
            //     element.id.S + ' (' + element.employeeName.S + ')'
            // );

            element.lines.forEach(l => {
                if (l.productName === 'Frijol negro') {
                    console.log(element.id, l);
                }
            })

            total++;
        });

        console.log('Total', total);

    } catch (err) {
        console.log('Error', err);
    }
};

scanTable();

