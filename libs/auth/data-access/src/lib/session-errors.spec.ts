import { classifyAuthSessionError } from './session-errors';

describe('classifyAuthSessionError', () => {
    it('classifies revoked token errors', () => {
        expect(
            classifyAuthSessionError(new Error('Access Token has been revoked'))
        ).toBe('revoked');
    });

    it('classifies expired refresh token errors', () => {
        expect(
            classifyAuthSessionError(new Error('refresh token has expired'))
        ).toBe('expired');
    });

    it('classifies missing session errors', () => {
        expect(classifyAuthSessionError(new Error('No current user'))).toBe(
            'no_session'
        );
    });

    it('classifies transient connectivity errors', () => {
        expect(classifyAuthSessionError(new Error('Network request failed'))).toBe(
            'transient'
        );
    });
});
