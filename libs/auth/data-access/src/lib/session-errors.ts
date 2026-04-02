export type AuthSessionIssue =
    | 'no_session'
    | 'revoked'
    | 'expired'
    | 'unauthorized'
    | 'transient'
    | 'unknown';

const toErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
    ) {
        return (error as { message: string }).message;
    }

    return String(error);
};

export const classifyAuthSessionError = (error: unknown): AuthSessionIssue => {
    const message = toErrorMessage(error).toLowerCase();

    if (
        message.includes('no current user') ||
        message.includes('not authenticated') ||
        message.includes('user needs to be authenticated') ||
        message.includes('user does not exist') ||
        message.includes('the user does not exist')
    ) {
        return 'no_session';
    }

    if (
        message.includes('access token has been revoked') ||
        message.includes('token has been revoked') ||
        message.includes('token revoked')
    ) {
        return 'revoked';
    }

    if (
        message.includes('refresh token has expired') ||
        message.includes('invalid_grant') ||
        message.includes('session expired') ||
        message.includes('refresh token') && message.includes('expired')
    ) {
        return 'expired';
    }

    if (message.includes('unauthorized')) {
        return 'unauthorized';
    }

    if (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('timed out') ||
        message.includes('socket') ||
        message.includes('connection')
    ) {
        return 'transient';
    }

    return 'unknown';
};
