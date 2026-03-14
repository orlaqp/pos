import { buildDiagnostics, logStartupDiagnostics } from './startup-diagnostics';

describe('startup diagnostics', () => {
    const originalInfo = console.info;

    beforeEach(() => {
        console.info = jest.fn();
    });

    afterEach(() => {
        console.info = originalInfo;
    });

    it('builds expected diagnostics flags', () => {
        const payload = buildDiagnostics({
            aws_project_region: 'us-east-1',
            aws_appsync_graphqlEndpoint: 'https://example.com/graphql',
        });

        expect(payload.hasAwsRegion).toBe(true);
        expect(payload.hasGraphQlEndpoint).toBe(true);
        expect(payload.nodeEnv).toBeTruthy();
    });

    it('logs diagnostics payload', () => {
        logStartupDiagnostics({
            aws_project_region: 'us-east-1',
        });

        expect(console.info).toHaveBeenCalledWith(
            '[startup-diagnostics]',
            expect.objectContaining({
                hasAwsRegion: true,
                hasGraphQlEndpoint: false,
            })
        );
    });
});
