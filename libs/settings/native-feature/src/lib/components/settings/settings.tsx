import {
    resetDataStore,
    selectSettings,
    settingsActions,
    fetchGlobalSettings,
} from '@pos/settings/data-access';
import { UICard, UIScreen, UIStack } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, Switch, useTheme } from '@rneui/themed';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface SettingsProps {}

export function Settings(_props: SettingsProps) {
    const theme = useTheme();
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const dispatch = useDispatch();
    const settings = useSelector(selectSettings);

    const updateThemeMode = (dark: boolean) => {
        theme.updateTheme({
            mode: dark ? 'dark' : 'light',
        });
        dispatch(settingsActions.set(dark));
    };

    const setGlobalSettings = (enforce: boolean) => {
        if (!settings.globalSettings) return;
        dispatch(fetchGlobalSettings({
            ...settings.globalSettings,
            enforceSalesBasedOnInventory: enforce
        }));
    };

    return (
        <UIScreen padded testID="settings-screen">
            <UIStack spacing="xl" align="center" style={styles.pageStack}>
                <View style={styles.container}>
                    <UIStack spacing="lg">
                        <UICard tone="muted" radius="lg">
                            <View style={styles.headerRow}>
                                <View style={styles.headerTextWrap}>
                                    <Text style={styles.title}>Settings</Text>
                                    <Text style={styles.subtitle}>
                                        Configure app behavior and device controls.
                                    </Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>
                                        {settings.dataStoreStatus}
                                    </Text>
                                </View>
                            </View>
                        </UICard>

                        <UICard>
                            <UIStack spacing="lg">
                                <Text style={styles.sectionTitle}>Preferences</Text>
                                <UIStack
                                    direction="horizontal"
                                    justify="space-between"
                                    align="center"
                                    style={styles.settingRow}
                                >
                                    <Text style={styles.settingLabel}>
                                        Use Dark Theme:
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
                                        Enforce Sales Based on Inventory:
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
                            </UIStack>
                        </UICard>

                        <UICard tone="muted">
                            <UIStack spacing="lg">
                                <Text style={styles.sectionTitle}>Data Management</Text>
                                <Text style={styles.warningText}>
                                    This resets local cached data on this device.
                                    It does not delete your master business data.
                                </Text>
                                <Button
                                    testID="settings-reset-data-button"
                                    title="Reset Data"
                                    buttonStyle={styles.resetButton}
                                    titleStyle={styles.resetButtonTitle}
                                    onPress={() => dispatch(resetDataStore())}
                                    loading={
                                        settings.dataStoreStatus === 'resetting'
                                    }
                                />
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
    });

export default Settings;
