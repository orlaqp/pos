import { AmplifyAuthCognitoStackTemplate, AmplifyProjectInfo } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
    const userPool = resources.userPool as unknown as {
        schema?: Array<Record<string, unknown>>;
    };
    const existingSchema = userPool.schema ?? [];
    const hasBusinessName = existingSchema.some(
        (attribute) => attribute.name === 'businessName'
    );

    if (!hasBusinessName) {
        existingSchema.push({
            attributeDataType: 'String',
            developerOnlyAttribute: false,
            mutable: true,
            name: 'businessName',
            required: false,
            stringAttributeConstraints: {
                minLength: '1',
                maxLength: '256',
            },
        });
    }

    userPool.schema = existingSchema;

    const clientAttributes = ['email', 'name', 'custom:businessName'];
    const userPoolClient = resources.userPoolClient as unknown as {
        readAttributes?: string[];
        writeAttributes?: string[];
        refreshTokenValidity?: number;
        accessTokenValidity?: number;
        idTokenValidity?: number;
        tokenValidityUnits?: {
            refreshToken?: string;
            accessToken?: string;
            idToken?: string;
        };
    };
    const userPoolClientWeb = resources.userPoolClientWeb as unknown as {
        readAttributes?: string[];
        writeAttributes?: string[];
        refreshTokenValidity?: number;
        accessTokenValidity?: number;
        idTokenValidity?: number;
        tokenValidityUnits?: {
            refreshToken?: string;
            accessToken?: string;
            idToken?: string;
        };
    };

    userPoolClient.readAttributes = clientAttributes;
    userPoolClient.writeAttributes = clientAttributes;
    userPoolClientWeb.readAttributes = clientAttributes;
    userPoolClientWeb.writeAttributes = clientAttributes;
    userPoolClient.refreshTokenValidity = 3650;
    userPoolClient.accessTokenValidity = 24;
    userPoolClient.idTokenValidity = 24;
    userPoolClient.tokenValidityUnits = {
        refreshToken: 'days',
        accessToken: 'hours',
        idToken: 'hours',
    };
    userPoolClientWeb.refreshTokenValidity = 3650;
    userPoolClientWeb.accessTokenValidity = 24;
    userPoolClientWeb.idTokenValidity = 24;
    userPoolClientWeb.tokenValidityUnits = {
        refreshToken: 'days',
        accessToken: 'hours',
        idToken: 'hours',
    };
}
