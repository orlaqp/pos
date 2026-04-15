import {
    resetDataStore,
    selectSettings,
    settingsActions,
    fetchGlobalSettings,
    updateGlobalSettings,
    updatePayFromSalesScreen,
    translate,
} from '@pos/settings/data-access';
import { UICard, UIScreen, UIStack } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, Switch, useTheme } from '@rneui/themed';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@pos/store';

/* eslint-disable-next-line */
export interface SettingsProps {}

export function Settings(_props: SettingsProps) {
    const theme = useTheme();
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const dispatch = useAppDispatch();
    const settings = useSelector(selectSettings);
    const appVersion = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();

    const updateThemeMode = (dark: boolean) => {
        theme.updateTheme({
            mode: dark ? 'dark' : 'light',
        });
        dispatch(settingsActions.set(dark));
    };

    const setGlobalSettings = (enforce: boolean) => {
        if (!settings.globalSettings) return;
        dispatch(updateGlobalSettings({
            ...settings.globalSettings,
            enforceSalesBasedOnInventory: enforce
        }));
    };

    const setPayFromSales = (enabled: boolean) => {
        dispatch(updatePayFromSalesScreen(enabled));
    };

    return (
        <UIScreen padded scroll testID="settings-screen">
            <UIStack spacing="xl" align="center" style={styles.pageStack}>
                <View style={styles.container}>
                    <UIStack spacing="lg">
                        <UICard tone="muted" radius="lg">
                            <View style={styles.headerRow}>
                                <View style={styles.headerTextWrap}>
                                    <Text style={styles.title}>
                                        {translate('SETTINGS_Title')}
                                    </Text>
                                    <Text style={styles.subtitle}>
                                        {translate('SETTINGS_Subtitle')}
                                    </Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>
                                        {translate(
                                            `SETTINGS_Status_${settings.dataStoreStatus}`
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </UICard>

                        <UICard>
                            <UIStack spacing="lg">
                                <Text style={styles.sectionTitle}>
                                    {translate('SETTINGS_Preferences')}
                                </Text>
                                <UIStack
                                    direction="horizontal"
                                    justify="space-between"
                                    align="center"
                                    style={styles.settingRow}
                                >
                                    <Text style={styles.settingLabel}>
                                        {translate('SETTINGS_UseDarkTheme')}
                                    </Text>
                                    <Switch
                                        testID="settings-dark-theme-switch"
                                        value={settings.darkTheme}
                                        onValueChange={(value) => updateThemeMode(value)}
                                    />
                                </UIStack>

                                <UIStack
                                    direction="horizontal"
                                    justify="space-between"
                                    align="center"
                                    style={styles.settingRow}
                                >
                                    <Text style={styles.settingLabel}>
                                        {translate(
                                            'SETTINGS_EnforceInventory'
                                        )}
                                    </Text>
                                    <Switch
                                        testID="settings-enforce-inventory-switch"
                                        value={
                                            settings.globalSettings
                                                ?.enforceSalesBasedOnInventory
                                        }
                                        onValueChange={(value) =>
                                            setGlobalSettings(value)
                                        }
                                    />
                                </UIStack>

                                <UIStack
                                    direction="horizontal"
                                    justify="space-between"
                                    align="center"
                                    style={styles.settingRow}
                                >
                                    <Text style={styles.settingLabel}>
                                        {translate(
                                            'SETTINGS_PayFromSalesScreen'
                                        )}
                                    </Text>
                                    <Switch
                                        testID="settings-pay-from-sales-screen-switch"
                                        value={settings.payFromSalesScreen}
                                        onValueChange={(value) =>
                                            setPayFromSales(value)
                                        }
                                    />
                                </UIStack>

                                <UIStack spacing="sm">
                                    <Text style={styles.settingLabel}>
                                        {translate('SETTINGS_Language')}
                                    </Text>
                                    <UIStack direction="horizontal" spacing="sm">
                                        <Button
                                            testID="settings-language-en-button"
                                            title={translate('SETTINGS_English')}
                                            type={
                                                settings.languageTag === 'en'
                                                    ? 'solid'
                                                    : 'outline'
                                            }
                                            buttonStyle={styles.languageButton}
                                            onPress={() =>
                                                dispatch(
                                                    settingsActions.setLanguage(
                                                        'en'
                                                    )
                                                )
                                            }
                                        />
                                        <Button
                                            testID="settings-language-es-button"
                                            title={translate('SETTINGS_Spanish')}
                                            type={
                                                settings.languageTag === 'es'
                                                    ? 'solid'
                                                    : 'outline'
                                            }
                                            buttonStyle={styles.languageButton}
                                            onPress={() =>
                                                dispatch(
                                                    settingsActions.setLanguage(
                                                        'es'
                                                    )
                                                )
                                            }
                                        />
                                    </UIStack>
                                </UIStack>
                            </UIStack>
                        </UICard>

                        <UICard tone="muted">
                            <UIStack spacing="lg">
                                <Text style={styles.sectionTitle}>
                                    {translate('SETTINGS_DataManagement')}
                                </Text>
                                <Text style={styles.warningText}>
                                    {translate('SETTINGS_ResetWarning')}
                                </Text>
                                <Button
                                    testID="settings-reset-data-button"
                                    title={translate('SETTINGS_ResetData')}
                                    buttonStyle={styles.resetButton}
                                    titleStyle={styles.resetButtonTitle}
                                    onPress={() => dispatch(resetDataStore())}
                                    loading={
                                        settings.dataStoreStatus === 'resetting'
                                    }
                                />
                            </UIStack>
                        </UICard>

                        <UICard tone="muted">
                            <UIStack spacing="sm">
                                <Text style={styles.sectionTitle}>App Info</Text>
                                <UIStack
                                    direction="horizontal"
                                    justify="space-between"
                                    align="center"
                                    style={styles.settingRow}
                                >
                                    <Text style={styles.settingLabel}>Version</Text>
                                    <Text
                                        style={styles.settingValue}
                                        testID="settings-app-version"
                                    >
                                        {appVersion} ({buildNumber})
                                    </Text>
                                </UIStack>
                            </UIStack>
                        </UICard>
                    </UIStack>
                </View>
            </UIStack>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        pageStack: {
            paddingVertical: tokens.spacing.lg,
        },
        container: {
            width: '65%',
            maxWidth: tokens.layout.contentMaxWidth,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerTextWrap: {
            flex: 1,
            paddingRight: tokens.spacing.md,
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 26,
            fontWeight: '700',
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            fontSize: 15,
        },
        statusBadge: {
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: `${tokens.colors.border}`,
            backgroundColor: tokens.colors.surfaceAccent,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs,
        },
        statusText: {
            color: tokens.colors.textPrimary,
            textTransform: 'uppercase',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
        sectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
        },
        settingRow: {
            minHeight: 44,
        },
        settingLabel: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
        },
        settingValue: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            fontWeight: '600',
        },
        warningText: {
            color: tokens.colors.textPrimary,
            lineHeight: 22,
        },
        resetButton: {
            backgroundColor: '#D97706',
            borderRadius: tokens.radii.lg,
        },
        resetButtonTitle: {
            fontWeight: '700',
            color: '#111827',
        },
        languageButton: {
            borderRadius: tokens.radii.lg,
            minWidth: 120,
        },
    });

export default Settings;
