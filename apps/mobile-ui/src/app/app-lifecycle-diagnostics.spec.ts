import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    beginAppLifecycleSession,
    buildPreviousSessionSummary,
    recordAppLifecycleEvent,
} from './app-lifecycle-diagnostics';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

describe('app lifecycle diagnostics', () => {
    const mockedStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    const originalInfo = console.info;
    const originalWarn = console.warn;

    beforeEach(() => {
        jest.clearAllMocks();
        console.info = jest.fn();
        console.warn = jest.fn();
    });

    afterEach(() => {
        console.info = originalInfo;
        console.warn = originalWarn;
    });

    it('summarizes the previous session using the last recorded event', () => {
        expect(
            buildPreviousSessionSummary({
                sessionId: 'session-1',
                startedAt: '2026-04-02T01:00:00.000Z',
                events: [
                    { at: '2026-04-02T01:00:00.000Z', name: 'session.begin' },
                    { at: '2026-04-02T01:05:00.000Z', name: 'appstate.change' },
                ],
            })
        ).toEqual({
            sessionId: 'session-1',
            startedAt: '2026-04-02T01:00:00.000Z',
            endedAt: '2026-04-02T01:05:00.000Z',
            lastEvent: 'appstate.change',
            eventCount: 2,
        });
    });

    it('logs the previous session summary and writes a new session on startup', async () => {
        mockedStorage.getItem.mockResolvedValueOnce(
            JSON.stringify({
                sessionId: 'previous-session',
                startedAt: '2026-04-02T01:00:00.000Z',
                events: [
                    { at: '2026-04-02T01:00:00.000Z', name: 'session.begin' },
                    { at: '2026-04-02T01:10:00.000Z', name: 'session.expired:detected' },
                ],
            })
        );

        await beginAppLifecycleSession();

        expect(console.info).toHaveBeenCalledWith(
            '[app-lifecycle][previous-session]',
            expect.objectContaining({
                sessionId: 'previous-session',
                lastEvent: 'session.expired:detected',
                eventCount: 2,
            })
        );
        expect(mockedStorage.setItem).toHaveBeenCalledWith(
            'app-lifecycle-session-v1',
            expect.stringContaining('"name":"session.begin"')
        );
    });

    it('appends a lifecycle event to the active session', async () => {
        mockedStorage.getItem.mockResolvedValueOnce(
            JSON.stringify({
                sessionId: 'current-session',
                startedAt: '2026-04-02T01:00:00.000Z',
                events: [{ at: '2026-04-02T01:00:00.000Z', name: 'session.begin' }],
            })
        );

        await recordAppLifecycleEvent('bootstrap:ready', { tenantId: 'tenant-1' });

        expect(mockedStorage.setItem).toHaveBeenCalledWith(
            'app-lifecycle-session-v1',
            expect.stringContaining('"name":"bootstrap:ready"')
        );
    });
});
