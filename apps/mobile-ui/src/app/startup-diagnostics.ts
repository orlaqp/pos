import { Platform } from 'react-native';

type DiagnosticsPayload = {
    platform: string;
    nodeEnv: string;
    hasAwsRegion: boolean;
    hasGraphQlEndpoint: boolean;
};

const buildDiagnostics = (
    awsConfig: Record<string, unknown> | undefined
): DiagnosticsPayload => {
    const cfg = awsConfig ?? {};
    return {
        platform: Platform.OS,
        nodeEnv: process.env.NODE_ENV ?? 'unknown',
        hasAwsRegion: Boolean(cfg.aws_project_region),
        hasGraphQlEndpoint: Boolean(cfg.aws_appsync_graphqlEndpoint),
    };
};

export const logStartupDiagnostics = (
    awsConfig?: Record<string, unknown>
): void => {
    const payload = buildDiagnostics(awsConfig);
    console.info('[startup-diagnostics]', payload);
};

export { buildDiagnostics };
