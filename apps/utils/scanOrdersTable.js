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
    //   FilterExpression: "Subtitle = :topic AND Season = :s AND Episode = :e",
    // Define the expression attribute value, which are substitutes for the values you want to compare.
    //   ExpressionAttributeValues: {
    //     ":topic": {S: "SubTitle2"},
    //     ":s": {N: 1},
    //     ":e": {N: 2},
    //   },
    // Set the projection expression, which are the attributes that you want.
    ProjectionExpression: 'id, employeeId, employeeName',
    TableName: tableName,
};

const scanTable = async () => {
    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        //   console.log("success", data.Items);

        data.Items.forEach(async function (element, index, array) {
            // console.log(
            //     'printing',
            //     element.id.S + ' (' + element.employeeName.S + ')'
            // );

            console.log(`Updating: ${element.id}`);

            await update(tableName, '00-00-000000-00000', element.id);
        });
    } catch (err) {
        console.log('Error', err);
    }
};

scanTable();

// update(tableName, '0000000000000', '6146745c-6bd6-4698-8265-f5ab720627ad');

// ddb.scan(params, function (err, data) {
//     if (err) {
//         console.log('Error', err);
//     } else {
//         console.log('Success', data);
//         data.Items.forEach(function (element, index, array) {
//             console.log(
//                 'printing',
//                 element.id.S + ' (' + element.employeeName.S + ')'
//             );

//             update(tableName, '0000000000000', element.id.S);
//         });
//     }
// });
