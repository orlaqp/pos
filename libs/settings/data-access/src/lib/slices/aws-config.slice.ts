import { RootState } from '@pos/store';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export const AWS_CONFIG_FEATURE_KEY = 'awsConfig';

export interface Oauth {}

export interface AwsCognitoPasswordProtectionSettings {
    passwordPolicyMinLength: number;
    passwordPolicyCharacters: any[];
}

export interface AwsConfig {
    aws_project_region?: string;
    aws_appsync_graphqlEndpoint?: string;
    aws_appsync_region?: string;
    aws_appsync_authenticationType?: string;
    aws_appsync_apiKey?: string;
    aws_cognito_identity_pool_id?: string;
    aws_cognito_region?: string;
    aws_user_pools_id?: string;
    aws_user_pools_web_client_id?: string;
    oauth?: Oauth;
    aws_cognito_username_attributes?: string[];
    aws_cognito_social_providers?: any[];
    aws_cognito_signup_attributes?: string[];
    aws_cognito_mfa_configuration?: string;
    aws_cognito_mfa_types?: string[];
    aws_cognito_password_protection_settings?: AwsCognitoPasswordProtectionSettings;
    aws_cognito_verification_mechanisms?: string[];
    aws_user_files_s3_bucket?: string;
    aws_user_files_s3_bucket_region?: string;
}

export interface AwsConfigState {
    config?: AwsConfig;
}

export const initialAwsConfigState: AwsConfigState = {};

export const awsConfigSlice = createSlice({
    name: AWS_CONFIG_FEATURE_KEY,
    initialState: initialAwsConfigState,
    reducers: {
        set: (state: AwsConfigState, action: PayloadAction<AwsConfig>) => {
            state.config = action.payload;
        },
    },
});

/*
 * Export reducer for store configuration.
 */
export const awsConfigReducer = awsConfigSlice.reducer;

export const awsConfigActions = awsConfigSlice.actions;

export const getAwsConfigState = (rootState: RootState): AwsConfigState =>
    rootState[AWS_CONFIG_FEATURE_KEY];

export const selectAwsConfig = createSelector(
    getAwsConfigState,
    (state: AwsConfigState) => state.config
);
