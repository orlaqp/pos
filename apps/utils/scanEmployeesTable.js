// Load the AWS SDK for Node.js.
const ddbDocClient = require('./ddbDocClient').ddbDocClient;
const ScanCommand = require('@aws-sdk/lib-dynamodb').ScanCommand;
const ExecuteStatementCommand = require('@aws-sdk/client-dynamodb').ExecuteStatementCommand;


const tableName = 'Employee-libe2xk2rvftbi24xplh4x5gnm-develop';

const params = {
    ProjectionExpression: 'id, firstName',
    TableName: tableName,
};

const scanTable = async () => {
    try {
        const data = await ddbDocClient.send(new ScanCommand(params));

        let counter = 0;
        data.Items.forEach(async function (element, index, array) {
            counter += 1;
            console.log(`Updating: ${element.id}`);
            await addEmployeeCode(tableName, counter.toString().padStart(2, '0'), element.id);
        });
    } catch (err) {
        console.log('Error', err);
    }
};


const addEmployeeCode = async (tableName, code, id) => {
    const params = {
      Statement:
        `UPDATE "${tableName}" SET "code" = ? where "id" = ?`,
        // UPDATE "Order-libe2xk2rvftbi24xplh4x5gnm-develop" SET "orderNo" = '0000000000000' WHERE "id" = '6146745c-6bd6-4698-8265-f5ab720627ad'
      Parameters: [{ S: code }, { S: id }],
    };
  
    console.log(params);
  
    try {
      const data = await ddbDocClient.send(new ExecuteStatementCommand(params));
      console.log("Success. Item updated.");
      return "Run successfully"; // For unit tests.
    } catch (err) {
      console.error(err);
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
