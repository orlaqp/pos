const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const amplifyRoot = path.join(repoRoot, 'apps', 'mobile-ui', 'amplify');
const localEnvInfoPath = path.join(amplifyRoot, '.config', 'local-env-info.json');
const amplifyMetaPath = path.join(amplifyRoot, 'backend', 'amplify-meta.json');
const apiParametersPath = path.join(
    amplifyRoot,
    'backend',
    'api',
    'pos',
    'parameters.json'
);
const apiBuildParametersPath = path.join(
    amplifyRoot,
    'backend',
    'api',
    'pos',
    'build',
    'parameters.json'
);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const writeJson = (filePath, value) => {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const syncApiAuthParameter = () => {
    const localEnvInfo = readJson(localEnvInfoPath);
    const currentEnv = localEnvInfo.envName;
    if (!currentEnv) {
        throw new Error('Unable to determine current Amplify env name');
    }

    const amplifyMeta = readJson(amplifyMetaPath);
    const userPoolId =
        amplifyMeta?.auth?.pos0614c248?.output?.UserPoolId;

    if (!userPoolId) {
        throw new Error(
            `Unable to resolve Cognito UserPoolId for env "${currentEnv}" from amplify-meta.json`
        );
    }

    const apiParameters = readJson(apiParametersPath);
    apiParameters.AuthCognitoUserPoolId = userPoolId;
    writeJson(apiParametersPath, apiParameters);

    if (fs.existsSync(apiBuildParametersPath)) {
        const apiBuildParameters = readJson(apiBuildParametersPath);
        apiBuildParameters.AuthCognitoUserPoolId = userPoolId;
        writeJson(apiBuildParametersPath, apiBuildParameters);
    }

    console.log(
        `[sync-amplify-api-auth] env=${currentEnv} AuthCognitoUserPoolId=${userPoolId}`
    );
};

syncApiAuthParameter();
