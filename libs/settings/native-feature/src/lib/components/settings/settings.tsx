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
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface SettingsProps {}

export function Settings(_props: SettingsProps) {
    const theme = useTheme();
    const tokens = useDesignTokens();
    const dispatch = useDispatch();
    const settings = useSelector(selectSettings);

    const updateThemeMode = (dark: boolean) => {
        theme.updateTheme({
            mode: dark ? 'dark' : 'light',
        });
        dispatch(settingsActions.set(dark));
    };

    const setGlobalSettings = (enforce: boolean) => {
        dispatch(fetchGlobalSettings({
            ...settings.globalSettings!,
            enforceSalesBasedOnInventory: enforce
        }));
    };

    return (
        <UIScreen padded testID="settings-screen">
            <UIStack
                spacing="xl"
                align="center"
                style={{ paddingVertical: tokens.spacing.lg }}
            >
                <View style={{ width: '65%', maxWidth: tokens.layout.contentMaxWidth }}>
                    <UIStack spacing="lg">
                        <UICard>
                            <UIStack spacing="lg">
                                <UIStack
                                    direction="horizontal"
                                    justify="space-between"
                                    align="center"
                                >
                                    <Text style={{ color: tokens.colors.textPrimary }}>
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
                                >
                                    <Text style={{ color: tokens.colors.textPrimary }}>
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
                                <Text style={{ color: tokens.colors.textPrimary }}>
                                    Important: by clicking the button below you
                                    will wipe out all cached data in this device.
                                    Please use it carefully
                                </Text>
                                <Button
                                    testID="settings-reset-data-button"
                                    title="Reset Data"
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

export default Settings;
