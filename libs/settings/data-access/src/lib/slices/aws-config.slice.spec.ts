import { awsConfigActions, awsConfigReducer, initialAwsConfigState } from './aws-config.slice';

describe('awsConfig reducer', () => {
  it('returns initial state', () => {
    expect(awsConfigReducer(undefined, { type: '' })).toEqual(initialAwsConfigState);
  });

  it('stores config with set action', () => {
    const config = { aws_project_region: 'us-east-1' };
    const state = awsConfigReducer(undefined, awsConfigActions.set(config));
    expect(state.config).toEqual(config);
  });
});
