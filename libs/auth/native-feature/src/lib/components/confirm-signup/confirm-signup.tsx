import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Button, Text, useTheme } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FormProvider, useForm } from 'react-hook-form';
import { UIAlert, UIInput } from '@pos/shared/ui-native';
import { Auth } from '@pos/shared/amplify';
import { getThemeColors } from '@pos/theme/native';
import { AuthGlyph } from '../auth-glyph/auth-glyph';

export interface ConfirmSignupProps {
    navigation: NativeStackNavigationProp<any>;
    route?: {
        params?: {
            email?: string;
        };
    };
}

type ConfirmSignupModel = {
    email: string;
    confirmationCode: string;
};

export function ConfirmSignupScreen(props: ConfirmSignupProps) {
    const styles = useStyles();
    const { width } = useWindowDimensions();
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const initialEmail = props.route?.params?.email?.trim() || '';

    const formMethods = useForm<ConfirmSignupModel>({
        mode: 'onChange',
        defaultValues: {
            email: initialEmail,
            confirmationCode: '',
        },
    });

    const emailValue = formMethods.watch('email');
    const isWide = width >= 980;

    const onSubmit = async (model: ConfirmSignupModel) => {
        setSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            await Auth.confirmSignUp({
                username: model.email.trim(),
                confirmationCode: model.confirmationCode.trim(),
            });
            setMessage('Account confirmed. Sign in to open the workspace.');
        } catch (e: any) {
            setError(e?.message || 'Unable to confirm account');
        } finally {
            setSubmitting(false);
        }
    };

    const onResend = async () => {
        if (!emailValue?.trim()) {
            setError('Email address is required to resend the code');
            return;
        }

        setResending(true);
        setError(null);
        setMessage(null);

        try {
            await Auth.resendSignUpCode(emailValue.trim());
            setMessage('A new verification code was sent to your email.');
        } catch (e: any) {
            setError(e?.message || 'Unable to resend verification code');
        } finally {
            setResending(false);
        }
    };

    return (
        <FormProvider {...formMethods}>
            <View style={styles.container}>
                <View style={[styles.shell, isWide ? styles.shellWide : styles.shellStacked]}>
                    <View style={[styles.heroPanel, isWide ? styles.heroPanelWide : null]}>
                        <AuthGlyph />
                        <Text style={styles.eyebrow}>Verify Account</Text>
                        <Text h2 style={styles.title}>Confirm your owner login</Text>
                        <Text style={styles.subtitle}>
                            Enter the verification code sent to your email before signing in to initialize the workspace.
                        </Text>
                    </View>
                    <View style={[styles.formPanel, isWide ? styles.formPanelWide : null]}>
                        <View style={styles.formInner}>
                            <Text style={styles.formTitle}>Enter verification code</Text>
                            <Text style={styles.formSubtitle}>Use the code from the Cognito email.</Text>
                            {error ? <UIAlert message={error} type="error" /> : null}
                            {message ? <UIAlert message={message} type="success" /> : null}
                            <UIInput
                                name="email"
                                autoCapitalize="none"
                                placeholder="owner@business.com"
                                keyboardType="email-address"
                                textAlign="left"
                                rules={{ required: 'Email address is required' }}
                            />
                            <UIInput
                                name="confirmationCode"
                                placeholder="Verification code"
                                keyboardType="number-pad"
                                textAlign="left"
                                rules={{ required: 'Verification code is required' }}
                            />
                            <Button
                                title="Confirm account"
                                buttonStyle={styles.primaryButton}
                                loading={submitting}
                                onPress={formMethods.handleSubmit(onSubmit)}
                            />
                            <Button
                                title="Resend code"
                                type="clear"
                                titleStyle={styles.secondaryAction}
                                loading={resending}
                                onPress={onResend}
                            />
                            <Button
                                title="Back to sign in"
                                type="clear"
                                titleStyle={styles.secondaryAction}
                                onPress={() =>
                                    props.navigation.navigate('Login', {
                                        email: emailValue?.trim() || initialEmail,
                                    })
                                }
                            />
                        </View>
                    </View>
                </View>
            </View>
        </FormProvider>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const colors = getThemeColors(theme);

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#05070b',
            paddingHorizontal: 24,
            paddingVertical: 32,
            justifyContent: 'center',
        },
        shell: {
            width: '100%',
            maxWidth: 1180,
            alignSelf: 'center',
        },
        shellWide: {
            flexDirection: 'row',
            alignItems: 'stretch',
        },
        shellStacked: {
            flexDirection: 'column',
        },
        heroPanel: {
            backgroundColor: '#10141b',
            borderRadius: 28,
            padding: 28,
            marginBottom: 18,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
        },
        heroPanelWide: {
            flex: 1.1,
            marginBottom: 0,
            marginRight: 18,
            justifyContent: 'center',
        },
        formPanel: {
            backgroundColor: colors.background,
            borderRadius: 28,
            padding: 28,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
        },
        formPanelWide: {
            flex: 0.9,
            justifyContent: 'center',
        },
        formInner: {
            width: '100%',
            maxWidth: 440,
            alignSelf: 'center',
        },
        eyebrow: {
            color: '#7eb6ff',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 10,
            marginTop: 16,
            fontSize: 12,
            fontWeight: '700',
        },
        title: {
            color: '#f3f7ff',
            marginBottom: 10,
        },
        subtitle: {
            color: '#a3adba',
            lineHeight: 22,
        },
        formTitle: {
            color: colors.black,
            fontSize: 28,
            fontWeight: '700',
            marginBottom: 6,
        },
        formSubtitle: {
            color: colors.grey2,
            marginBottom: 18,
        },
        primaryButton: {
            borderRadius: 16,
            minHeight: 52,
            marginTop: 16,
            backgroundColor: colors.primary,
        },
        secondaryAction: {
            color: '#7eb6ff',
            fontWeight: '700',
        },
    });
};

export default ConfirmSignupScreen;
