// Load the AWS SDK for Node.js.
const ddbDocClient = require('./ddbDocClient').ddbDocClient;
const ScanCommand = require('@aws-sdk/lib-dynamodb').ScanCommand;
const ExecuteStatementCommand = require('@aws-sdk/client-dynamodb').ExecuteStatementCommand;


const tableName = 'Product-libe2xk2rvftbi24xplh4x5gnm-develop';

const params = {
    ProjectionExpression: 'id, description, isActive',
    TableName: tableName,
};

const scanTable = async () => {
    try {
        const data = await ddbDocClient.send(new ScanCommand(params));

        data.Items.forEach(async function (element, index, array) {
            console.log(`Updating: ${element.id} ${element.description}`);
            await updateRecord(tableName, true, element.id);
        });
    } catch (err) {
        console.log('Error', err);
    }
};


const updateRecord = async (tableName, val, id) => {
    const params = {
      Statement: `UPDATE "${tableName}" SET "isActive" = ? where "id" = ?`,
      Parameters: [{ BOOL: val }, { S: id }],
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
