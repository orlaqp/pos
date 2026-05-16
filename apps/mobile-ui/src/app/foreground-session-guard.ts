import type { AppStateStatus } from 'react-native';

type BootstrapStatus =
    | 'idle'
    | 'checking-session'
    | 'resolving-tenant'
    | 'preparing-business-data'
    | 'ready'
    | 'error';

type SessionRecoveryState =
    | 'healthy'
    | 'refreshing'
    | 'needs_reauth'
    | 'reauth_in_progress'
    | 'deferred_until_sale_complete';

export type ForegroundSessionGuardInput = {
    previousState: AppStateStatus;
    nextState: AppStateStatus;
    now: number;
    lastForegroundSessionCheckAt: number;
    throttleMs: number;
    bootstrapStatus: BootstrapStatus;
    sessionRecoveryState: SessionRecoveryState;
    hasAuthUser: boolean;
    hasValidationInFlight: boolean;
    hasValidationScheduled: boolean;
    hasBootstrapInFlight: boolean;
    hasSilentReauthInFlight: boolean;
};

export const shouldValidateSessionOnForeground = ({
    previousState,
    nextState,
    now,
    lastForegroundSessionCheckAt,
    throttleMs,
    bootstrapStatus,
    sessionRecoveryState,
    hasAuthUser,
    hasValidationInFlight,
    hasValidationScheduled,
    hasBootstrapInFlight,
    hasSilentReauthInFlight,
}: ForegroundSessionGuardInput) => {
    if (!hasAuthUser) {
        return false;
    }

    if (nextState !== 'active') {
        return false;
    }

    if (previousState !== 'inactive' && previousState !== 'background') {
        return false;
    }

    if (bootstrapStatus !== 'ready' || hasBootstrapInFlight) {
        return false;
    }

    if (sessionRecoveryState !== 'healthy') {
        return false;
    }

    if (
        hasValidationInFlight ||
        hasValidationScheduled ||
        hasSilentReauthInFlight
    ) {
        return false;
    }

    if (now - lastForegroundSessionCheckAt < throttleMs) {
        return false;
    }

    return true;
};
