import React, { useState } from 'react';

import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme, Button, Text } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Auth } from '@pos/shared/amplify';
import { useForm, FormProvider } from 'react-hook-form';
import { UiActionMessage, UIAlert, UIInput } from '@pos/shared/ui-native';
import { getThemeColors } from '@pos/theme/native';
import { AuthGlyph } from '../auth-glyph/auth-glyph';
export interface SignupProps {
  navigation: NativeStackNavigationProp<any>;
}

type SignUpModel = {
  name: string;
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignUpScreen(props: SignupProps) {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formMethods = useForm<SignUpModel>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      businessName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(model: SignUpModel) {
    setError(null);

    if (model.password !== model.confirmPassword) {
      setSuccess(false);
      setError('Passwords do not match');
      return;
    }

    try {
      await Auth.signUp({
        username: model.email.trim(),
        password: model.password,
        attributes: {
          email: model.email.trim(),
          name: model.name.trim(),
          'custom:businessName': model.businessName.trim(),
        },
      });
      setSuccess(true);
      props.navigation.navigate('ConfirmSignup', {
        email: model.email.trim(),
      });
    } catch (e: any) {
      console.error(e?.message || e);
      setSuccess(false);
      setError(e?.message || 'Unable to create account');
    }
  }

  const isWide = width >= 980;

  return (
    <FormProvider {...formMethods}>
      <View style={styles.container}>
        <View style={[styles.shell, isWide ? styles.shellWide : styles.shellStacked]}>
          <View style={[styles.heroPanel, isWide ? styles.heroPanelWide : null]}>
            <AuthGlyph />
            <Text style={styles.eyebrow}>Create Business</Text>
            <Text h3 style={styles.title}>Launch a new workspace</Text>
            <Text style={styles.subtitle}>
              This creates the owner account and the shared business workspace used across your POS devices.
            </Text>
            <View style={styles.heroNotes}>
              <View style={styles.heroNoteRow}>
                <View style={styles.heroNoteBullet} />
                <Text style={styles.heroNote}>Business name becomes the identity for this tenant.</Text>
              </View>
              <View style={styles.heroNoteRow}>
                <View style={styles.heroNoteBullet} />
                <Text style={styles.heroNote}>Owner login restores the admin session when the app is reopened.</Text>
              </View>
              <View style={styles.heroNoteRow}>
                <View style={styles.heroNoteBullet} />
                <Text style={styles.heroNote}>Staff still unlock daily use with their employee PIN.</Text>
              </View>
            </View>
          </View>
          <View style={[styles.formPanel, isWide ? styles.formPanelWide : null]}>
            <View style={styles.formInner}>
              <Text style={styles.formEyebrow}>Owner Setup</Text>
              <Text style={styles.formTitle}>Create workspace</Text>
              {error ? <UIAlert message={error} type="error" /> : null}
              {success ? (
                <UiActionMessage
                  message="Account created. Enter the verification code from your email to confirm the owner login."
                  actionTitle="Verify account"
                  action={() =>
                    props.navigation.navigate('ConfirmSignup', {
                      email: formMethods.getValues('email').trim(),
                    })
                  }
                />
              ) : (
                <>
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Account</Text>
                    <UIInput
                      name="businessName"
                      placeholder="Business name"
                      style={styles.inputControl}
                      rules={{ required: 'Business name is required' }}
                    />
                    <UIInput
                      name="name"
                      placeholder="Owner name"
                      style={styles.inputControl}
                      rules={{ required: 'Owner name is required' }}
                    />
                    <UIInput
                      name="email"
                      placeholder="Email address"
                      style={styles.inputControl}
                      autoCapitalize="none"
                      rules={{ required: 'Email is required' }}
                    />
                  </View>
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Security</Text>
                    <UIInput
                      name="password"
                      placeholder="Password"
                      style={styles.inputControl}
                      secureTextEntry={true}
                      rules={{ required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } }}
                    />
                    <UIInput
                      name="confirmPassword"
                      placeholder="Confirm password"
                      style={styles.inputControl}
                      secureTextEntry={true}
                      rules={{ required: 'Please confirm the password' }}
                    />
                  </View>
                  <Button
                    title="Create workspace"
                    containerStyle={styles.buttonSpacing}
                    buttonStyle={styles.primaryButton}
                    onPress={formMethods.handleSubmit(onSubmit)}
                  />
                  <Button
                    title="Back to sign in"
                    type="clear"
                    titleStyle={styles.secondaryButtonText}
                    onPress={() => props.navigation.navigate('Login')}
                  />
                </>
              )}
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
      flex: 1.05,
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
      flex: 0.95,
      justifyContent: 'center',
    },
    formInner: {
      width: '100%',
      maxWidth: 500,
      alignSelf: 'center',
    },
    formEyebrow: {
      color: '#7eb6ff',
      textTransform: 'uppercase',
      letterSpacing: 1.6,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 10,
    },
    formTitle: {
      color: colors.black,
      fontSize: 30,
      fontWeight: '700',
      marginBottom: 18,
    },
    eyebrow: {
      color: '#7eb6ff',
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 10,
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
    heroNotes: {
      marginTop: 20,
      paddingTop: 18,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.06)',
    },
    heroNoteRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    heroNoteBullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#7eb6ff',
      marginTop: 8,
      marginRight: 12,
      opacity: 0.95,
    },
    heroNote: {
      color: '#c4ccd6',
      lineHeight: 22,
      flex: 1,
    },
    bottomMargin: {
      marginBottom: 50,
    },
    section: {
      marginTop: 12,
      marginBottom: 6,
      padding: 16,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionLabel: {
      color: colors.grey2,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    topMargin: {
      marginTop: 16,
    },
    inputControl: {
      marginTop: 0,
    },
    buttonSpacing: {
      marginTop: 18,
    },
    primaryButton: {
      borderRadius: 16,
      minHeight: 52,
      backgroundColor: colors.primary,
    },
    secondaryButtonText: {
      color: '#7eb6ff',
      fontWeight: '700',
    },
  });
};

export default SignUpScreen;
