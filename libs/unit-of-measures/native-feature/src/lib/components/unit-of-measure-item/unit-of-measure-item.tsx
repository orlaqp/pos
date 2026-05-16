
import React from 'react';

import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { unitOfMeasuresActions, UnitOfMeasureEntity } from '@pos/unit-of-measures/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@rneui/themed';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { translateWithFallback } from '@pos/shared/utils';

export interface UnitOfMeasureItemProps {
    item: UnitOfMeasureEntity;
    navigation: NativeStackNavigationProp<any>;
}

export function UnitOfMeasureItem({ item, navigation }: UnitOfMeasureItemProps) {
    const t = translateWithFallback;
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const dispatch = useDispatch();

    const editItem = () => {
        if (item.name === 'ea') {
            Alert.alert(
                t('UOM_DefaultUnitLocked', 'This item cannot be changed'),
            );
            return;
        }

        dispatch(unitOfMeasuresActions.select(item));
        navigation.navigate('UnitOfMeasure Form');
    }

    return (
        <TouchableOpacity style={[styles.dataRow, styles.row]} onPress={editItem}>
            <View style={styles.badgeSlot}>
                <View style={styles.unitBadge}>
                    <Text style={styles.unitText}>{item.name?.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.contentColumn}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={[styles.description, styles.secondaryReadable]}>
                    {item.description}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            row: {
                alignItems: 'center',
                borderRadius: 22,
                borderWidth: 1,
                borderColor: '#C7D0DB22',
                backgroundColor: '#0E141C',
                marginBottom: tokens.spacing.sm,
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.md,
            },
            badgeSlot: {
                width: 70,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: tokens.spacing.md,
            },
            unitBadge: {
                minWidth: 44,
                height: 32,
                paddingHorizontal: tokens.spacing.sm,
                borderRadius: tokens.radii.md,
                borderWidth: 1,
                borderColor: `${theme.theme.colors.grey3}66`,
                backgroundColor: `${theme.theme.colors.grey5}55`,
                alignItems: 'center',
                justifyContent: 'center',
            },
            unitText: {
                color: theme.theme.colors.grey1,
                fontWeight: '700',
                fontSize: 12,
            },
            contentColumn: {
                flex: 1,
                paddingRight: tokens.spacing.md,
            },
            name: {
                color: theme.theme.colors.white,
                fontSize: 17,
                fontWeight: '800',
            },
            secondaryReadable: {
                color: theme.theme.colors.grey1,
            },
        }),
    };
};

export default UnitOfMeasureItem;
