import { shouldValidateSessionOnForeground } from './foreground-session-guard';

describe('shouldValidateSessionOnForeground', () => {
    const baseInput = {
        previousState: 'background' as const,
        nextState: 'active' as const,
        now: 20_000,
        lastForegroundSessionCheckAt: 0,
        throttleMs: 5_000,
        bootstrapStatus: 'ready' as const,
        sessionRecoveryState: 'healthy' as const,
        hasAuthUser: true,
        hasValidationInFlight: false,
        hasValidationScheduled: false,
        hasBootstrapInFlight: false,
        hasSilentReauthInFlight: false,
    };

    it('allows validation on a normal foreground resume', () => {
        expect(shouldValidateSessionOnForeground(baseInput)).toBe(true);
    });

    it('blocks validation when bootstrap is still in flight', () => {
        expect(
            shouldValidateSessionOnForeground({
                ...baseInput,
                hasBootstrapInFlight: true,
            })
        ).toBe(false);
    });

    it('blocks validation when silent reauth is already in flight', () => {
        expect(
            shouldValidateSessionOnForeground({
                ...baseInput,
                hasSilentReauthInFlight: true,
            })
        ).toBe(false);
    });

    it('blocks validation when a foreground check is already scheduled', () => {
        expect(
            shouldValidateSessionOnForeground({
                ...baseInput,
                hasValidationScheduled: true,
            })
        ).toBe(false);
    });

    it('blocks validation when throttled', () => {
        expect(
            shouldValidateSessionOnForeground({
                ...baseInput,
                lastForegroundSessionCheckAt: 19_000,
            })
        ).toBe(false);
    });

    it('blocks validation for non-resume active transitions', () => {
        expect(
            shouldValidateSessionOnForeground({
                ...baseInput,
                previousState: 'active',
            })
        ).toBe(false);
    });
});
