export type AmplifyDependentResourcesAttributes = {
  "api": {
    "pos": {
      "GraphQLAPIEndpointOutput": "string",
      "GraphQLAPIIdOutput": "string",
      "GraphQLAPIKeyOutput": "string"
    }
  },
  "auth": {
    "pos0614c248": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "UserPoolArn": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    }
  },
  "function": {
    "createEmployee": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "Name": "string",
      "Region": "string"
    },
    "getSales": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "Name": "string",
      "Region": "string"
    },
    "getSalesSummaryQuery": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "Name": "string",
      "Region": "string"
    }
  },
  "storage": {
    "assets": {
      "BucketName": "string",
      "Region": "string"
    }
  }
}