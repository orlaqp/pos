import {
  DescribeStackResourcesCommand,
  DescribeStacksCommand,
  type CloudFormationClient,
} from '@aws-sdk/client-cloudformation';
import { loadEnvConfig } from '../../dynamo-migration/src/amplify-env';
import type { StorageEnvironment } from './asset-types';

const resolveStorageStackName = async (
  client: CloudFormationClient,
  rootStackName: string
) => {
  const response = await client.send(
    new DescribeStackResourcesCommand({
      StackName: rootStackName,
    })
  );

  const storageResource = (response.StackResources ?? []).find(
    (resource) => resource.LogicalResourceId === 'storageassets'
  );

  if (!storageResource?.PhysicalResourceId) {
    throw new Error(`Unable to resolve storageassets nested stack from "${rootStackName}"`);
  }

  return storageResource.PhysicalResourceId;
};

const resolveBucketName = async (
  client: CloudFormationClient,
  storageStackName: string
) => {
  const response = await client.send(
    new DescribeStacksCommand({
      StackName: storageStackName,
    })
  );

  const bucketOutput = response.Stacks?.[0]?.Outputs?.find(
    (output) => output.OutputKey === 'BucketName'
  )?.OutputValue;

  if (!bucketOutput) {
    throw new Error(`Unable to resolve BucketName output from "${storageStackName}"`);
  }

  return bucketOutput;
};

export const resolveStorageEnvironment = async (
  client: CloudFormationClient,
  profile: string,
  envName: string
): Promise<StorageEnvironment> => {
  const config = loadEnvConfig(envName);
  const storageStackName = await resolveStorageStackName(client, config.stackName);
  const bucketName = await resolveBucketName(client, storageStackName);

  return {
    envName,
    region: config.region,
    stackName: config.stackName,
    profile,
    storageStackName,
    bucketName,
  };
};
