import { UIActions, UICard, UIInput, UIScreen, UIStack } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { saveStationNumber, selectStation, StationConfig } from '@pos/settings/data-access';

/* eslint-disable-next-line */
export interface StationFormProps {
    navigation: NativeStackNavigationProp<any>;
}

export type CustomStationConfig = Omit<StationConfig, 'orderNumber'> & { orderNumber: string };

export function StationForm({ navigation }: StationFormProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const dispatch = useDispatch();
    const stationInfo = useSelector(selectStation);
    const [busy, setBusy] = useState<boolean>(false);
    
    const save = async () => {
        setBusy(true);
        const formValues: CustomStationConfig = form.getValues();

        if (!formValues.stationNumber) return;

        dispatch(saveStationNumber(formValues.stationNumber));
        
        Alert.alert('Store information has been updated');
        setBusy(false);
    };

    const confirmCancel = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => navigation.goBack() },
            ]
        );
    }

    const form = useForm< CustomStationConfig >({
        mode: 'onChange',
        defaultValues: {
            currentDate: stationInfo?.currentDate,
            orderNumber: stationInfo?.orderNumber?.toString().padStart(4, '0'),
            stationNumber: stationInfo?.stationNumber
        },
    });

    return (
        <UIScreen padded>
            <FormProvider {...form}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <UIStack spacing="lg">
                        <UICard tone="muted" radius="lg">
                            <Text style={styles.title}>Station Configuration</Text>
                            <Text style={styles.subtitle}>
                                Configure station identity used to generate order references.
                            </Text>
                        </UICard>

                        <UICard>
                            <UIStack spacing="lg">
                                <Text style={styles.sectionTitle}>Station Details</Text>
                                <View style={styles.twoColumnRow}>
                                    <View style={styles.column}>
                                        <UIInput
                                            name="currentDate"
                                            label="Current Date (read only)"
                                            placeholder="Current Date"
                                            disabled={true}
                                        />
                                    </View>
                                    <View style={styles.columnSpaced}>
                                        <UIInput
                                            name="orderNumber"
                                            label="Order Number (read only)"
                                            placeholder="Order Number"
                                            disabled={true}
                                        />
                                    </View>
                                </View>

                                <UIInput
                                    name="stationNumber"
                                    label="Station Number"
                                    placeholder="Station Number"
                                    rules={{ required: true }}
                                />
                            </UIStack>
                        </UICard>

                        <UIActions
                            busy={busy}
                            submitAction={form.handleSubmit(save)}
                            cancelAction={confirmCancel}
                        />
                    </UIStack>
                </ScrollView>
            </FormProvider>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        scrollContent: {
            width: '64%',
            alignSelf: 'center',
            paddingVertical: tokens.spacing.lg,
            paddingBottom: tokens.spacing.xl,
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 28,
            fontWeight: '700',
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            fontSize: 15,
            lineHeight: 21,
        },
        sectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 19,
            fontWeight: '700',
        },
        twoColumnRow: {
            flexDirection: 'row',
        },
        column: {
            flex: 1,
        },
        columnSpaced: {
            flex: 1,
            marginLeft: tokens.spacing.md,
        },
    });

export default StationForm;
