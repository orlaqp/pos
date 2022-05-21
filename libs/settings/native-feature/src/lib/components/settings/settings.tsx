import {
    resetDataStore,
    selectSettings,
    settingsActions,
} from '@pos/settings/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { Button, Switch, useTheme } from '@rneui/themed';
import { DataStore } from 'aws-amplify';
import React, { useState } from 'react';

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface SettingsProps {}

export function Settings(props: SettingsProps) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();
    const settings = useSelector(selectSettings);

    const updateThemeMode = (dark: boolean) => {
        theme.updateTheme({
            mode: dark ? 'dark' : 'light',
        });
        dispatch(settingsActions.set(dark));
    };

    return (
        <SafeAreaView
            style={[styles.page, styles.centeredHorizontally, { padding: 40 }]}
        >
            <View style={[styles.row, styles.centered]}>
                <Text style={[styles.primaryText, { marginRight: 30 }]}>
                    Use Dark Theme:
                </Text>
                <Switch
                    value={settings.darkTheme}
                    onValueChange={(value) => updateThemeMode(value)}
                ></Switch>
            </View>
            <Text style={[styles.primaryText, { marginVertical: 30 }]}>
                Important: by clicking the button below you will wipe out all
                cached data in this device. Please use it carefully
            </Text>
            <Button
                title="Reset Data"
                onPress={() => dispatch(resetDataStore())}
                loading={settings.dataStoreStatus === 'resetting'}
            />
        </SafeAreaView>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({}),
    };
};

export default Settings;
