import React, { useEffect, useState } from 'react';

import { Alert, Animated, Pressable, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme, Button, Text } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FormProvider, useForm } from 'react-hook-form';
import { UIInput, UIAlert, UISwitch } from '@pos/shared/ui-native';
import {
    E2E_OWNER_EMAIL,
    E2E_OWNER_PASSWORD,
    activateE2EMode,
} from '@pos/shared/utils';
import { useSelector } from 'react-redux';
import {
    clearRememberedAdminCredentials,
    getRememberedAdminCredentials,
    saveRememberedAdminCredentials,
    signIn,
} from '@pos/auth/data-access';
import { RootState, useAppDispatch } from '@pos/store';

import { getThemeColors } from '@pos/theme/native';
import { AuthGlyph } from '../auth-glyph/auth-glyph';

export interface LoginProps {
    navigation: NativeStackNavigationProp<any>;
    route?: {
        params?: {
            email?: string;
        };
    };
}

type SignInModel = {
    email: string;
    password: string;
    rememberCredentials: boolean;
};

export function LoginScreen(props: LoginProps) {
    const styles = useStyles();
    const { width } = useWindowDimensions();
    const [heroOpacity] = useState(() => new Animated.Value(0));
    const [heroTranslateY] = useState(() => new Animated.Value(18));
    const [formOpacity] = useState(() => new Animated.Value(0));
    const [formTranslateY] = useState(() => new Animated.Value(24));
    const dispatch = useAppDispatch();
    const error = useSelector((state: RootState) => state.auth.error);
    const loading = useSelector(
        (state: RootState) => state.auth.signInStatus === 'inProgress'
    );
    const initialEmail = props.route?.params?.email?.trim() || '';
    const formMethods = useForm<SignInModel>({
        mode: 'onChange',
        defaultValues: {
            email: initialEmail,
            password: '',
            rememberCredentials: false,
        },
    });

    const login = async (model: SignInModel) => {
        await dispatch(
            signIn({ email: model.email.trim(), password: model.password })
        ).unwrap();

        try {
            if (model.rememberCredentials) {
                await saveRememberedAdminCredentials({
                    username: model.email.trim(),
                    password: model.password,
                });
            } else {
                await clearRememberedAdminCredentials();
            }
        } catch (error) {
            console.error('Unable to update remembered login settings', error);
            Alert.alert(
                'Signed in',
                'The admin login was restored, but the saved-login preference could not be updated on this device.'
            );
        }
    };

    const loginWithE2EAccount = async () => {
        activateE2EMode({
            seedTenant: true,
            cleanupOnExit: true,
            printerSpy: true,
        });
        await dispatch(
            signIn({
                email: E2E_OWNER_EMAIL,
                password: E2E_OWNER_PASSWORD,
            })
        );
    };

    const isWide = width >= 980;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(heroOpacity, {
                toValue: 1,
                duration: 260,
                useNativeDriver: true,
            }),
            Animated.timing(heroTranslateY, {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(80),
                Animated.parallel([
                    Animated.timing(formOpacity, {
                        toValue: 1,
                        duration: 260,
                        useNativeDriver: true,
                    }),
                    Animated.timing(formTranslateY, {
                        toValue: 0,
                        duration: 260,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start();
    }, [formOpacity, formTranslateY, heroOpacity, heroTranslateY]);

    useEffect(() => {
        let active = true;

        getRememberedAdminCredentials()
            .then((remembered) => {
                if (!active || !remembered) {
                    return;
                }

                formMethods.setValue('rememberCredentials', true, {
                    shouldDirty: false,
                    shouldTouch: false,
                });

                const rememberedEmail = remembered.username.trim();
                const effectiveEmail = initialEmail || rememberedEmail;

                if (!initialEmail && rememberedEmail) {
                    formMethods.setValue('email', rememberedEmail, {
                        shouldDirty: false,
                        shouldTouch: false,
                    });
                }

                if (
                    remembered.password &&
                    effectiveEmail &&
                    effectiveEmail.trim().toLowerCase() === rememberedEmail.toLowerCase()
                ) {
                    formMethods.setValue('password', remembered.password, {
                        shouldDirty: false,
                        shouldTouch: false,
                    });
                }
            })
            .catch((storageError) => {
                console.error('Unable to read remembered login credentials', storageError);
            });

        return () => {
            active = false;
        };
    }, [formMethods, initialEmail]);

    return (
        <FormProvider {...formMethods}>
            <View style={styles.container} testID="owner-login-screen">
                {typeof __DEV__ !== 'undefined' && __DEV__ ? (
                    <Pressable
                        testID="e2e-owner-login-button"
                        onPress={loginWithE2EAccount}
                        style={styles.e2eShortcut}
                    />
                ) : null}
                <View style={[styles.shell, isWide ? styles.shellWide : styles.shellStacked]}>
                    <Animated.View
                        style={[
                            styles.heroPanel,
                            isWide ? styles.heroPanelWide : null,
                            { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] },
                        ]}
                    >
                        <AuthGlyph />
                        <Text style={styles.eyebrow}>Business Admin Access</Text>
                        <Text h2 style={styles.title}>Open your workspace</Text>
                        <Text style={styles.subtitle}>
                            Restore your business session, sync the latest catalog, and hand the device back to staff PIN entry.
                        </Text>
                        <View style={styles.heroMetaRow}>
                            <View style={styles.heroMetaCard}>
                                <Text style={styles.heroMetaLabel}>Access</Text>
                                <Text style={styles.heroMetaValue}>Owner account</Text>
                            </View>
                            <View style={styles.heroMetaCard}>
                                <Text style={styles.heroMetaLabel}>Session</Text>
                                <Text style={styles.heroMetaValue}>Workspace restore</Text>
                            </View>
                        </View>
                    </Animated.View>
                    <Animated.View
                        style={[
                            styles.formPanel,
                            isWide ? styles.formPanelWide : null,
                            { opacity: formOpacity, transform: [{ translateY: formTranslateY }] },
                        ]}
                    >
                        <View style={styles.formInner}>
                            <Text style={styles.formEyebrow}>Owner access</Text>
                            <Text style={styles.formTitle}>Sign in</Text>
                            <Text style={styles.formSubtitle}>Use the owner account for this business.</Text>
                            {error ? <UIAlert message={error} type="error" /> : null}
                            <View style={styles.formSection}>
                                <Text style={styles.formSectionLabel}>Credentials</Text>
                                <UIInput
                                    name="email"
                                    testID="login-email-input"
                                    autoCapitalize="none"
                                    placeholder="owner@business.com"
                                    keyboardType="email-address"
                                    textAlign="left"
                                    rules={{
                                        required: 'Email address is required',
                                        pattern: {
                                            value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                            message: 'Email address is invalid',
                                        },
                                    }}
                                />
                                <UIInput
                                    name="password"
                                    testID="login-password-input"
                                    placeholder="Password"
                                    secureTextEntry={true}
                                    textAlign="left"
                                    rules={{ required: 'Password is required' }}
                                />
                                <View style={styles.rememberCard}>
                                    <View style={styles.rememberRow}>
                                        <UISwitch
                                            name="rememberCredentials"
                                            testID="login-remember-switch"
                                        />
                                        <View style={styles.rememberCopy}>
                                            <Text style={styles.rememberTitle}>
                                                Remember credentials on this device
                                            </Text>
                                            <Text style={styles.rememberHint}>
                                                Allows the app to silently restore the admin session if it expires.
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.formActionPanel}>
                                <Button
                                    testID="login-submit-button"
                                    title="Continue"
                                    containerStyle={styles.primaryButtonContainer}
                                    buttonStyle={styles.primaryButton}
                                    onPress={formMethods.handleSubmit(login)}
                                    loading={loading}
                                />
                                <Button
                                    testID="login-signup-button"
                                    title="Create business account"
                                    type="clear"
                                    titleStyle={styles.secondaryAction}
                                    onPress={() => props.navigation.navigate('Signup')}
                                />
                            </View>
                        </View>
                    </Animated.View>
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
        e2eShortcut: {
            position: 'absolute',
            top: 48,
            right: 12,
            width: 96,
            height: 24,
            zIndex: 10,
            opacity: 0.18,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 6,
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
        heroMetaRow: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 24,
        },
        heroMetaCard: {
            flex: 1,
            minHeight: 84,
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.03)',
            justifyContent: 'space-between',
        },
        heroMetaLabel: {
            color: '#7f8a9a',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontSize: 11,
            fontWeight: '700',
        },
        heroMetaValue: {
            color: '#eef4ff',
            fontSize: 18,
            fontWeight: '700',
        },
        rememberRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
        },
        rememberCard: {
            marginTop: 6,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.07)',
            backgroundColor: 'rgba(255,255,255,0.03)',
        },
        rememberCopy: {
            flex: 1,
        },
        rememberTitle: {
            color: colors.black,
            fontSize: 15,
            fontWeight: '600',
            marginBottom: 2,
        },
        rememberHint: {
            color: colors.grey3,
            fontSize: 13,
            lineHeight: 18,
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
        formSection: {
            padding: 18,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(255,255,255,0.03)',
        },
        formSectionLabel: {
            color: '#7eb6ff',
            textTransform: 'uppercase',
            letterSpacing: 1.4,
            fontSize: 11,
            fontWeight: '700',
            marginBottom: 6,
        },
        formActionPanel: {
            marginTop: 14,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.08)',
        },
        primaryButton: {
            borderRadius: 16,
            minHeight: 52,
            backgroundColor: colors.primary,
        },
        primaryButtonContainer: {
            width: '100%',
            marginTop: 16,
            alignSelf: 'stretch',
        },
        secondaryAction: {
            color: '#7eb6ff',
            fontWeight: '700',
        },
    });
};

export default LoginScreen;
