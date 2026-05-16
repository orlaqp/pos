'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Amplify, Auth } from '@pos/shared/amplify';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@pos/shared/ui-web';

const DEFAULT_WEB_AMPLIFY_CONFIG = {
    Auth: {
        Cognito: {
            userPoolId: 'us-east-1_hy5DTn55H',
            userPoolClientId: '66o7hfar7nqc3bu4iho117epbs',
            identityPoolId: 'us-east-1:6a8af8f8-1d9b-410c-8187-0dbdc9cdba6f',
        },
    },
    API: {
        GraphQL: {
            endpoint: 'https://uokblnemyvgutjddjxe527exga.appsync-api.us-east-1.amazonaws.com/graphql',
            region: 'us-east-1',
            defaultAuthMode: 'userPool',
        },
    },
    Storage: {
        S3: {
            bucket: 'pos-assets-667d29297354387b6c48c731f59df318629e-prod',
            region: 'us-east-1',
        },
    },
};

type AuthStatus = 'checking' | 'signed-out' | 'authorized';

type LegacyAmplifyUser = {
    attributes?: Record<string, unknown>;
    signInUserSession?: {
        accessToken?: {
            payload?: Record<string, unknown>;
        };
    };
};

const getEmail = (user: LegacyAmplifyUser) =>
    typeof user.attributes?.email === 'string' ? user.attributes.email : '';

const configureAmplify = () => {
    const envConfig = process.env.NEXT_PUBLIC_AMPLIFY_CONFIG;
    const config = envConfig ? JSON.parse(envConfig) : DEFAULT_WEB_AMPLIFY_CONFIG;
    Amplify.configure(config);
};

export function AuthGate({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('checking');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const canSubmit = useMemo(() => email.trim() && password, [email, password]);

    useEffect(() => {
        configureAmplify();
        Auth.currentAuthenticatedUser()
            .then((user: LegacyAmplifyUser) => {
                setEmail(getEmail(user));
                setStatus('authorized');
            })
            .catch(() => setStatus('signed-out'));
    }, []);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(undefined);
        setIsSubmitting(true);
        try {
            const user = await Auth.signIn(email.trim(), password);
            setEmail(getEmail(user));
            setStatus('authorized');
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Unable to sign in');
            setStatus('signed-out');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'checking') {
        return <AuthShell title="Checking session" description="Restoring your admin session." />;
    }

    if (status === 'signed-out') {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background p-6">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Admin sign in</CardTitle>
                        <CardDescription>Use the same Cognito owner login as the iPad app.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4" onSubmit={submit}>
                            <label className="flex flex-col gap-2 text-sm font-medium">
                                Email
                                <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm font-medium">
                                Password
                                <Input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
                            </label>
                            {error ? <p className="text-sm text-destructive">{error}</p> : null}
                            <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return children;
}

function AuthShell({ title, description }: { title: string; description: string }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
            </Card>
        </main>
    );
}
