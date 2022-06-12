import { useSharedStyles } from '@pos/theme/native';
import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const padMatrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [null, 0, null],
];

export interface UIKeyPadProps {
    initialValue: string;
    onChange: (numbers: string) => string;
}

export function UIKeyPad({ initialValue, onChange }: UIKeyPadProps) {
    const styles = useStyles();
    const [numbers, setNumbers] = useState<string>(initialValue);

    const onPress = (val: number) => {
        const newValue = (numbers || '') + val.toString();
        
        if (!onChange) return;
        
        const res =  onChange(newValue);
        setNumbers(res);
    }

    return (
        <View style={styles.column}>
            <Text style={[styles.secondaryText, styles.textCenter, { fontSize: 24, marginBottom: 10 }]}>
                Enter your pin:
            </Text>
            {padMatrix.map((r, index) => (
                <View key={index} style={styles.row}>
                    {r.map((b, idx) => (
                        <View key={b || idx + 50} style={{ width: 115 }}>
                            {b !== null &&
                                <TouchableOpacity style={styles.button} onPress={() => onPress(b)}>
                                    <Text style={styles.buttonText}>{b}</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

const useStyles = () => {
    const sharedStyles = useSharedStyles();

    return StyleSheet.create({
        ...sharedStyles,
        button: {
            padding: 20,
            paddingHorizontal: 30,
            margin: 20,
            borderRadius: 45,
            backgroundColor: sharedStyles.dataRow.backgroundColor,
            //    flex: 1,
        },
        buttonText: {
            fontSize: 24,
            color: sharedStyles.primaryText.color,
        }
    });
};


export default UIKeyPad;
