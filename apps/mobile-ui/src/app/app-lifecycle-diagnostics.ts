import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_LIFECYCLE_SESSION_KEY = 'app-lifecycle-session-v1';
const PREVIOUS_APP_LIFECYCLE_SESSION_KEY = 'app-lifecycle-previous-session-v1';
const MAX_STORED_EVENTS = 40;

type LifecycleEvent = {
    at: string;
    name: string;
    details?: Record<string, unknown>;
};

type LifecycleSession = {
    sessionId: string;
    startedAt: string;
    events: LifecycleEvent[];
};

type PreviousSessionSummary = {
    sessionId: string;
    startedAt: string;
    endedAt?: string;
    lastEvent?: string;
    eventCount: number;
};

const nowIso = () => new Date().toISOString();

const buildSessionId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const readStoredSession = async (): Promise<LifecycleSession | null> => {
    try {
        const raw = await AsyncStorage.getItem(APP_LIFECYCLE_SESSION_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as LifecycleSession;
        if (!parsed?.sessionId || !Array.isArray(parsed.events)) {
            return null;
        }

        return parsed;
    } catch (error) {
        console.warn('[app-lifecycle] unable to read lifecycle session', error);
        return null;
    }
};

const writeStoredSession = async (session: LifecycleSession) => {
    try {
        await AsyncStorage.setItem(
            APP_LIFECYCLE_SESSION_KEY,
            JSON.stringify(session)
        );
    } catch (error) {
        console.warn('[app-lifecycle] unable to write lifecycle session', error);
    }
};

const writePreviousSession = async (session: LifecycleSession) => {
    try {
        await AsyncStorage.setItem(
            PREVIOUS_APP_LIFECYCLE_SESSION_KEY,
            JSON.stringify(session)
        );
    } catch (error) {
        console.warn('[app-lifecycle] unable to write previous lifecycle session', error);
    }
};

const summarizeSession = (
    session: LifecycleSession | null
): PreviousSessionSummary | null => {
    if (!session) {
        return null;
    }

    const lastEvent = session.events[session.events.length - 1];
    return {
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        endedAt: lastEvent?.at,
        lastEvent: lastEvent?.name,
        eventCount: session.events.length,
    };
};

export const beginAppLifecycleSession = async (): Promise<string> => {
    const previous = await readStoredSession();
    const previousSummary = summarizeSession(previous);

    if (previousSummary) {
        await writePreviousSession(previous);
        console.info('[app-lifecycle][previous-session]', previousSummary);
    }

    const nextSession: LifecycleSession = {
        sessionId: buildSessionId(),
        startedAt: nowIso(),
        events: [
            {
                at: nowIso(),
                name: 'session.begin',
            },
        ],
    };

    await writeStoredSession(nextSession);
    return nextSession.sessionId;
};

export const readCurrentAppLifecycleSession = async () => {
    return readStoredSession();
};

export const readPreviousAppLifecycleSession = async (): Promise<LifecycleSession | null> => {
    try {
        const raw = await AsyncStorage.getItem(PREVIOUS_APP_LIFECYCLE_SESSION_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as LifecycleSession;
        if (!parsed?.sessionId || !Array.isArray(parsed.events)) {
            return null;
        }

        return parsed;
    } catch (error) {
        console.warn('[app-lifecycle] unable to read previous lifecycle session', error);
        return null;
    }
};

export const recordAppLifecycleEvent = async (
    name: string,
    details?: Record<string, unknown>
) => {
    const current = await readStoredSession();
    if (!current) {
        return;
    }

    const next: LifecycleSession = {
        ...current,
        events: [
            ...current.events,
            {
                at: nowIso(),
                name,
                details,
            },
        ].slice(-MAX_STORED_EVENTS),
    };

    await writeStoredSession(next);
};

export const buildPreviousSessionSummary = summarizeSession;
