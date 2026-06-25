import {
    resetDataStore,
    selectSettings,
    settingsActions,
    fetchGlobalSettings,
    updateGlobalSettings,
    updatePayFromSalesScreen,
    translate,
} from '@pos/settings/data-access';
import { Role } from '@pos/auth/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { UICard, UIScreen, UIStack } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, Switch, useTheme } from '@rneui/themed';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@pos/store';

/* eslint-disable-next-line */
export interface SettingsProps {}

const LEGACY_SCALE_PRICE_FORMAT = 'LEGACY_4_DIGIT_PRICE';
const EXPANDED_SCALE_PRICE_FORMAT = 'EAN13_02_4_PLU_5_PRICE';
type ScaleLabelFormat =
    | typeof LEGACY_SCALE_PRICE_FORMAT
    | typeof EXPANDED_SCALE_PRICE_FORMAT;

export function Settings(_props: SettingsProps) {
    const theme = useTheme();
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const dispatch = useAppDispatch();
    const settings = useSelector(selectSettings);
    const employee = useSelector(selectLoginEmployee);
    const appVersion = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();
    const canManageScaleFormat = !!employee?.roles?.includes(Role.Admin);
    const scaleBarcodePriceFormat =
        settings.globalSettings?.scaleBarcodePriceFormat ===
        EXPANDED_SCALE_PRICE_FORMAT
            ? EXPANDED_SCALE_PRICE_FORMAT
            : LEGACY_SCALE_PRICE_FORMAT;
    const [taxInput, setTaxInput] = React.useState(
        String(settings.globalSettings?.taxValue ?? 0)
    );

    React.useEffect(() => {
        setTaxInput(String(settings.globalSettings?.taxValue ?? 0));
    }, [settings.globalSettings?.taxValue]);

    const updateThemeMode = (dark: boolean) => {
        theme.updateTheme({
            mode: dark ? 'dark' : 'light',
        });
        dispatch(settingsActions.set(dark));
    };

    const setEnforceInventory = (enforce: boolean) => {
        if (!settings.globalSettings) return;
        dispatch(updateGlobalSettings({
            ...settings.globalSettings,
            enforceSalesBasedOnInventory: enforce
        }));
    };

    const setScaleBarcodePriceFormat = (format: ScaleLabelFormat) => {
        if (!settings.globalSettings) return;
        dispatch(
            updateGlobalSettings({
                ...settings.globalSettings,
                scaleBarcodePriceFormat: format,
            })
        );
    };

    const confirmExpandedScaleFormat = () => {
        Alert.alert(
            translate('SETTINGS_ScaleLabelConfirmTitle'),
            translate('SETTINGS_ScaleLabelConfirmMessage'),
            [
                {
                    text: translate('SETTINGS_Cancel'),
                    style: 'cancel',
                },
                {
                    text: translate('SETTINGS_Confirm'),
                    onPress: () =>
                        setScaleBarcodePriceFormat(EXPANDED_SCALE_PRICE_FORMAT),
                },
            ]
        );
    };

    const onScaleFormatPress = (format: ScaleLabelFormat) => {
        if (format === scaleBarcodePriceFormat) return;

        if (format === EXPANDED_SCALE_PRICE_FORMAT) {
            confirmExpandedScaleFormat();
            return;
        }

        setScaleBarcodePriceFormat(LEGACY_SCALE_PRICE_FORMAT);
    };

    const saveTaxValue = () => {
        if (!settings.globalSettings) return;

        const parsed = Number(taxInput || 0);
        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
            Alert.alert(
                translate('SETTINGS_TaxPercentage'),
                translate('SETTINGS_TaxPercentageInvalid')
            );
            return;
        }

        dispatch(updateGlobalSettings({
            ...settings.globalSettings,
            taxValue: parsed,
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
                                            setEnforceInventory(value)
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

                                {canManageScaleFormat ? (
                                    <UIStack spacing="sm">
                                        <Text style={styles.settingLabel}>
                                            {translate(
                                                'SETTINGS_ScaleLabelFormat'
                                            )}
                                        </Text>
                                        <UIStack direction="horizontal" spacing="sm">
                                            <Button
                                                testID="settings-scale-format-legacy-button"
                                                title={translate(
                                                    'SETTINGS_ScaleLabelLegacy'
                                                )}
                                                type={
                                                    scaleBarcodePriceFormat ===
                                                    LEGACY_SCALE_PRICE_FORMAT
                                                        ? 'solid'
                                                        : 'outline'
                                                }
                                                buttonStyle={styles.scaleButton}
                                                onPress={() =>
                                                    onScaleFormatPress(
                                                        LEGACY_SCALE_PRICE_FORMAT
                                                    )
                                                }
                                            />
                                            <Button
                                                testID="settings-scale-format-expanded-button"
                                                title={translate(
                                                    'SETTINGS_ScaleLabelExpanded'
                                                )}
                                                type={
                                                    scaleBarcodePriceFormat ===
                                                    EXPANDED_SCALE_PRICE_FORMAT
                                                        ? 'solid'
                                                        : 'outline'
                                                }
                                                buttonStyle={styles.scaleButton}
                                                onPress={() =>
                                                    onScaleFormatPress(
                                                        EXPANDED_SCALE_PRICE_FORMAT
                                                    )
                                                }
                                            />
                                        </UIStack>
                                    </UIStack>
                                ) : null}

                                <UIStack spacing="sm">
                                    <Text style={styles.settingLabel}>
                                        {translate('SETTINGS_TaxPercentage')}
                                    </Text>
                                    <UIStack
                                        direction="horizontal"
                                        spacing="sm"
                                        align="center"
                                    >
                                        <TextInput
                                            testID="settings-tax-percentage-input"
                                            value={taxInput}
                                            onChangeText={setTaxInput}
                                            keyboardType="decimal-pad"
                                            style={styles.taxInput}
                                        />
                                        <Button
                                            testID="settings-save-tax-percentage-button"
                                            title={translate('SETTINGS_SaveTaxPercentage')}
                                            buttonStyle={styles.taxButton}
                                            onPress={saveTaxValue}
                                        />
                                    </UIStack>
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
                                <Text style={styles.sectionTitle}>
                                    {translate('SETTINGS_AppInfo')}
                                </Text>
                                <UIStack
                                    direction="horizontal"
                                    justify="space-between"
                                    align="center"
                                    style={styles.settingRow}
                                >
                                    <Text style={styles.settingLabel}>
                                        {translate('SETTINGS_Version')}
                                    </Text>
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
        scaleButton: {
            borderRadius: tokens.radii.lg,
            minWidth: 150,
        },
        taxInput: {
            minWidth: 120,
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            color: tokens.colors.textPrimary,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
            fontSize: 16,
        },
        taxButton: {
            borderRadius: tokens.radii.lg,
            minWidth: 120,
        },
    });

export default Settings;
