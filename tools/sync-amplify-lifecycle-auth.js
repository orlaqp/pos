const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const repoRoot = path.resolve(__dirname, '..');
const amplifyRoot = path.join(repoRoot, 'apps', 'mobile-ui', 'amplify');
const localEnvInfoPath = path.join(amplifyRoot, '.config', 'local-env-info.json');
const localAwsInfoPath = path.join(amplifyRoot, '.config', 'local-aws-info.json');
const amplifyMetaPath = path.join(amplifyRoot, 'backend', 'amplify-meta.json');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const localEnvInfo = readJson(localEnvInfoPath);
const currentEnv = localEnvInfo.envName;

if (!currentEnv) {
  throw new Error('Unable to determine current Amplify env name');
}

const amplifyMeta = readJson(amplifyMetaPath);
const localAwsInfo = readJson(localAwsInfoPath);
const apiMeta = amplifyMeta?.api?.pos;
const apiId = apiMeta?.output?.GraphQLAPIIdOutput;
const region =
  apiMeta?.output?.GraphQLAPIEndpointOutput?.match(
    /^https:\/\/[^.]+\.appsync-api\.([^.]+)\.amazonaws\.com\/graphql$/
  )?.[1] ||
  amplifyMeta?.providers?.awscloudformation?.Region ||
  'us-east-1';

if (!apiId) {
  throw new Error(
    `Unable to resolve GraphQLAPIIdOutput for env "${currentEnv}" from amplify-meta.json`
  );
}

AWS.config.update({ region });
const profileName =
  process.env.AWS_PROFILE ||
  process.env.AMAZON_PROFILE ||
  localAwsInfo?.[currentEnv]?.profileName;

if (profileName) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: profileName,
  });
}

const appsync = new AWS.AppSync({ region });

const targetFields = ['updateProduct', 'updateOrder', 'updateOrderRefund'];
const adminRoles = [
  `getSales-${currentEnv}`,
  `getSalesSummaryQuery-${currentEnv}`,
  `orderInventoryLifecycle-${currentEnv}`,
  `posOrderInventoryRole-${currentEnv}`,
];

const replaceAdminRoles = (template) => {
  const marker = '$ctx.stash.put("adminRoles", [';
  const start = template.indexOf(marker);
  if (start === -1) {
    throw new Error('Unable to locate adminRoles stanza in resolver template');
  }

  const openBracketIndex = template.indexOf('[', start);
  const closeBracketIndex = template.indexOf('])', openBracketIndex);
  if (openBracketIndex === -1 || closeBracketIndex === -1) {
    throw new Error('Unable to parse adminRoles array in resolver template');
  }

  const nextArrayLiteral = `[${adminRoles.map((role) => `"${role}"`).join(',')}]`;
  return (
    template.slice(0, openBracketIndex) +
    nextArrayLiteral +
    template.slice(closeBracketIndex + 1)
  );
};

const syncResolver = async (fieldName) => {
  const current = await appsync
    .getResolver({
      apiId,
      typeName: 'Mutation',
      fieldName,
    })
    .promise();

  const resolver = current?.resolver;
  if (!resolver?.requestMappingTemplate) {
    throw new Error(`Resolver Mutation.${fieldName} is missing a request template`);
  }

  const nextRequestTemplate = replaceAdminRoles(resolver.requestMappingTemplate);

  if (nextRequestTemplate === resolver.requestMappingTemplate) {
    console.log(
      `[sync-amplify-lifecycle-auth] Mutation.${fieldName} already up to date`
    );
    return;
  }

  const params = {
    apiId,
    typeName: 'Mutation',
    fieldName,
    requestMappingTemplate: nextRequestTemplate,
    responseMappingTemplate: resolver.responseMappingTemplate,
    kind: resolver.kind,
  };

  if (resolver.kind === 'PIPELINE') {
    params.pipelineConfig = {
      functions:
        resolver.pipelineConfig?.functions?.map((item) =>
          typeof item === 'string' ? item : item.functionId
        ) || [],
    };
  } else if (resolver.dataSourceName) {
    params.dataSourceName = resolver.dataSourceName;
  }

  await appsync.updateResolver(params).promise();
  console.log(
    `[sync-amplify-lifecycle-auth] Mutation.${fieldName} adminRoles=${adminRoles.join(
      ','
    )}`
  );
};

const run = async () => {
  console.log(
    `[sync-amplify-lifecycle-auth] env=${currentEnv} apiId=${apiId} region=${region} profile=${profileName || 'default'}`
  );

  for (const fieldName of targetFields) {
    await syncResolver(fieldName);
  }
};

run().catch((error) => {
  console.error('[sync-amplify-lifecycle-auth] failed', error);
  process.exitCode = 1;
});
