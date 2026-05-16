import React from 'react';
import { StyleSheet, View } from 'react-native';

export function AuthGlyph() {
    return (
        <View style={styles.frame}>
            <View style={styles.card}>
                <View style={styles.topBar} />
                <View style={styles.cartHandle} />
                <View style={styles.cartBody} />
                <View style={[styles.wheel, styles.wheelLeft]} />
                <View style={[styles.wheel, styles.wheelRight]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    frame: {
        width: 96,
        height: 96,
        borderRadius: 28,
        backgroundColor: '#11161d',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: 52,
        height: 52,
        position: 'relative',
    },
    topBar: {
        position: 'absolute',
        top: 2,
        left: 6,
        width: 28,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#7eb6ff',
    },
    cartHandle: {
        position: 'absolute',
        top: 8,
        left: 10,
        width: 4,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#f3f7ff',
        transform: [{ rotate: '-20deg' }],
    },
    cartBody: {
        position: 'absolute',
        top: 16,
        left: 14,
        width: 26,
        height: 16,
        borderRadius: 6,
        borderWidth: 3,
        borderColor: '#f3f7ff',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 8,
        backgroundColor: 'transparent',
    },
    wheel: {
        position: 'absolute',
        bottom: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#7eb6ff',
    },
    wheelLeft: {
        left: 18,
    },
    wheelRight: {
        left: 34,
    },
});

export default AuthGlyph;
