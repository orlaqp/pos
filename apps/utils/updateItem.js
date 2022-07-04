// Import required AWS SDK clients and commands for Node.js.
// import { ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";

const ExecuteStatementCommand = require('@aws-sdk/client-dynamodb').ExecuteStatementCommand;
const ddbDocClient = require("./ddbDocClient.js").ddbDocClient;

exports.update = async (tableName, orderNo, id) => {
  const params = {
    Statement:
      `UPDATE "${tableName}" SET "orderNo" = ? where "id" = ?`,
      // UPDATE "Order-libe2xk2rvftbi24xplh4x5gnm-develop" SET "orderNo" = '0000000000000' WHERE "id" = '6146745c-6bd6-4698-8265-f5ab720627ad'
    Parameters: [{ S: orderNo }, { S: id }],
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

