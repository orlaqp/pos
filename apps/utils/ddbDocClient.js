// Create a service client module using ES6 syntax.
const DynamoDBDocumentClient = require("@aws-sdk/lib-dynamodb").DynamoDBDocumentClient;
const ddbClient = require("./ddbClient.js").ddbClient;
// Set the AWS Region.
const REGION = "us-east-1"; // For example, "us-east-1".

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };

// Create the DynamoDB document client.
exports.ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);
