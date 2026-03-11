import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface UIEbtRibbonProps {
    text?: string;
    top?: number;
    right?: number;
}

const RIBBON_COLOR = '#6D3CCF';
const RIBBON_TEXT_COLOR = '#F8F4FF';

export function UIEbtRibbon({
    text = 'EBT',
    top = 0,
    right = 0,
}: UIEbtRibbonProps) {
    return (
        <View
            pointerEvents="none"
            style={[styles.container, { top, right }]}
        >
            <View style={styles.band}>
                <Text style={styles.text}>{text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 50,
        height: 50,
        overflow: 'hidden',
        zIndex: 10,
    },
    band: {
        position: 'absolute',
        top: 12,
        right: -26,
        width: 82,
        paddingVertical: 1,
        backgroundColor: RIBBON_COLOR,
        transform: [{ rotate: '45deg' }],
    },
    text: {
        color: RIBBON_TEXT_COLOR,
        textAlign: 'center',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.2,
    },
});

export default UIEbtRibbon;
