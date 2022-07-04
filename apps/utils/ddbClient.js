const DynamoDBClient = require("@aws-sdk/client-dynamodb").DynamoDBClient;
// Set the AWS Region.
const REGION = "us-east-1"; // For example, "us-east-1".
// Create an Amazon DynamoDB service client object.
exports.ddbClient = new DynamoDBClient({ region: REGION });

