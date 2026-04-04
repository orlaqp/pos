import { NativeModules } from 'react-native';

type NativeLifecycleEvent = {
    at: string;
    name: string;
    details?: Record<string, unknown>;
};

export type NativeLifecycleSession = {
    sessionId: string;
    startedAt: string;
    events: NativeLifecycleEvent[];
};

type NativeLifecycleDiagnosticsModule = {
    getCurrentSession?: () => Promise<NativeLifecycleSession | null>;
    getPreviousSession?: () => Promise<NativeLifecycleSession | null>;
};

const diagnosticsModule =
    NativeModules.AppLifecycleNativeDiagnostics as
        | NativeLifecycleDiagnosticsModule
        | undefined;

const isValidSession = (
    value: unknown
): value is NativeLifecycleSession =>
    !!value &&
    typeof value === 'object' &&
    typeof (value as NativeLifecycleSession).sessionId === 'string' &&
    typeof (value as NativeLifecycleSession).startedAt === 'string' &&
    Array.isArray((value as NativeLifecycleSession).events);

const readSession = async (
    reader: (() => Promise<NativeLifecycleSession | null>) | undefined
) => {
    if (!reader) {
        return null;
    }

    try {
        const value = await reader();
        return isValidSession(value) ? value : null;
    } catch (error) {
        console.warn('[native-lifecycle] unable to read native lifecycle session', error);
        return null;
    }
};

export const isNativeLifecycleDiagnosticsAvailable = () =>
    !!diagnosticsModule?.getCurrentSession &&
    !!diagnosticsModule?.getPreviousSession;

export const readCurrentNativeLifecycleSession = async () =>
    readSession(diagnosticsModule?.getCurrentSession);

export const readPreviousNativeLifecycleSession = async () =>
    readSession(diagnosticsModule?.getPreviousSession);
