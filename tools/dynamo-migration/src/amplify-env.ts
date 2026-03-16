import { CloudFormationClient, DescribeStackResourcesCommand } from '@aws-sdk/client-cloudformation';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  LEGACY_MODEL_NAMES,
  TARGET_ONLY_MODEL_NAMES,
  type EnvConfig,
  type ModelName,
  type ResolvedEnvironment,
  type TableMapping,
} from './types';

const TEAM_PROVIDER_PATH = resolve(
  process.cwd(),
  'apps/mobile-ui/amplify/team-provider-info.json'
);

const ALL_MODEL_NAMES = [...LEGACY_MODEL_NAMES, ...TARGET_ONLY_MODEL_NAMES] as ModelName[];

type TeamProviderInfo = Record<
  string,
  {
    awscloudformation?: {
      Region?: string;
      StackName?: string;
      AmplifyAppId?: string;
    };
  }
>;

const normalizeModelFromName = (value: string): ModelName | null => {
  const lowered = value.toLowerCase();
  for (const modelName of ALL_MODEL_NAMES) {
    const normalized = modelName.toLowerCase();
    if (
      lowered === normalized ||
      lowered.startsWith(`${normalized}table`) ||
      lowered.startsWith(`${normalized}-`) ||
      lowered.includes(`-${normalized}-`)
    ) {
      return modelName;
    }
  }

  return null;
};

export const loadEnvConfig = (envName: string): EnvConfig => {
  const parsed = JSON.parse(readFileSync(TEAM_PROVIDER_PATH, 'utf8')) as TeamProviderInfo;
  const config = parsed[envName]?.awscloudformation;

  if (!config?.Region || !config?.StackName || !config?.AmplifyAppId) {
    throw new Error(`Unable to resolve Amplify environment "${envName}" from team-provider-info.json`);
  }

  return {
    envName,
    region: config.Region,
    stackName: config.StackName,
    amplifyAppId: config.AmplifyAppId,
  };
};

const collectTables = async (
  client: CloudFormationClient,
  stackName: string,
  tables: Record<string, TableMapping>,
  visited: Set<string>
): Promise<void> => {
  if (visited.has(stackName)) {
    return;
  }

  visited.add(stackName);

  const response = await client.send(
    new DescribeStackResourcesCommand({
      StackName: stackName,
    })
  );

  for (const resource of response.StackResources ?? []) {
    const resourceType = resource.ResourceType ?? '';
    const logicalResourceId = resource.LogicalResourceId ?? '';
    const physicalResourceId = resource.PhysicalResourceId ?? '';

    if (resourceType === 'AWS::CloudFormation::Stack' && physicalResourceId) {
      await collectTables(client, physicalResourceId, tables, visited);
      continue;
    }

    if (resourceType !== 'AWS::DynamoDB::Table' || !physicalResourceId || !logicalResourceId) {
      continue;
    }

    const modelName =
      normalizeModelFromName(logicalResourceId) ||
      normalizeModelFromName(physicalResourceId);

    if (!modelName) {
      continue;
    }

    tables[modelName] = {
      modelName,
      logicalResourceId,
      physicalTableName: physicalResourceId,
    };
  }
};

export const resolveEnvironment = async (
  client: CloudFormationClient,
  profile: string,
  envName: string
): Promise<ResolvedEnvironment> => {
  const config = loadEnvConfig(envName);
  const tables: Record<string, TableMapping> = {};

  await collectTables(client, config.stackName, tables, new Set<string>());

  return {
    envName,
    region: config.region,
    stackName: config.stackName,
    profile,
    tables,
  };
};
