import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const padMatrix: Array<Array<number | 'back' | null>> = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [null, 0, 'back'],
];

export interface UIKeyPadProps {
    initialValue: string;
    onChange: (numbers: string) => string;
    invalidAttempt?: number;
    resetToken?: number;
    disabled?: boolean;
}

export function UIKeyPad({
    initialValue,
    onChange,
    invalidAttempt = 0,
    resetToken = 0,
    disabled = false,
}: UIKeyPadProps) {
    const styles = useStyles();
    const [shakeX] = useState(() => new Animated.Value(0));
    const [displayScale] = useState(() => new Animated.Value(1));
    const numbers = initialValue || '';

    useEffect(() => {
        Animated.sequence([
            Animated.timing(displayScale, {
                toValue: 1.05,
                duration: 90,
                useNativeDriver: true,
            }),
            Animated.timing(displayScale, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();
    }, [displayScale, numbers.length, resetToken]);

    useEffect(() => {
        if (!invalidAttempt) return;

        Animated.sequence([
            Animated.timing(shakeX, { toValue: -10, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 10, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: -8, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 8, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
        ]).start();
    }, [invalidAttempt, shakeX]);

    const maskedValue = useMemo(
        () => `${numbers}`.split('').map(() => '•').join(' '),
        [numbers]
    );

    const commitValue = (nextValue: string) => {
        if (onChange) {
            onChange(nextValue);
        }
    };

    const onPress = (val: number | 'back') => {
        if (disabled) return;

        if (val === 'back') {
            commitValue((numbers || '').slice(0, -1));
            return;
        }

        commitValue((numbers || '') + val.toString());
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ translateX: shakeX }] }]}>
            <Animated.View style={[styles.display, { transform: [{ scale: displayScale }] }]}>
                <Text style={styles.displayLabel}>Enter PIN</Text>
                <Text testID="ui-keypad-display" style={styles.displayValue}>
                    {maskedValue || '• • • •'}
                </Text>
            </Animated.View>
            {padMatrix.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                    {row.map((item, itemIndex) => {
                        if (item === null) {
                            return <View key={`empty-${rowIndex}-${itemIndex}`} style={styles.spacer} />;
                        }

                        const isBackspace = item === 'back';
                        return (
                            <Pressable
                                key={`${item}`}
                                testID={`ui-keypad-key-${isBackspace ? 'back' : item}`}
                                onPress={() => onPress(item)}
                                style={({ pressed }) => [
                                    styles.key,
                                    pressed ? styles.keyPressed : null,
                                    isBackspace ? styles.secondaryKey : null,
                                    disabled ? styles.keyDisabled : null,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.keyText,
                                        isBackspace ? styles.secondaryKeyText : null,
                                        disabled ? styles.keyTextDisabled : null,
                                    ]}
                                >
                                    {isBackspace ? '⌫' : item}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            ))}
        </Animated.View>
    );
}

const useStyles = () =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        display: {
            width: '100%',
            minHeight: 88,
            borderRadius: 22,
            backgroundColor: '#12161d',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            paddingHorizontal: 18,
            paddingVertical: 14,
            justifyContent: 'center',
            marginBottom: 18,
        },
        displayLabel: {
            color: '#7eb6ff',
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            marginBottom: 8,
            textAlign: 'center',
        },
        displayValue: {
            color: '#f4f8ff',
            fontSize: 28,
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: 6,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 12,
        },
        spacer: {
            width: 84,
            height: 84,
            marginHorizontal: 6,
        },
        key: {
            width: 84,
            height: 84,
            marginHorizontal: 6,
            borderRadius: 24,
            backgroundColor: '#181d25',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        keyPressed: {
            backgroundColor: '#232b37',
            transform: [{ scale: 0.98 }],
        },
        secondaryKey: {
            backgroundColor: '#141922',
        },
        keyDisabled: {
            opacity: 0.4,
        },
        keyText: {
            color: '#f4f8ff',
            fontSize: 30,
            fontWeight: '700',
        },
        keyTextDisabled: {
            color: '#7a8593',
        },
        secondaryKeyText: {
            color: '#7eb6ff',
        },
    });

export default UIKeyPad;
