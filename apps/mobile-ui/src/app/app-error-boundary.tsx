import React, { ErrorInfo, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AppErrorBoundaryProps {
    children: ReactNode;
}

interface AppErrorBoundaryState {
    hasError: boolean;
}

export class AppErrorBoundary extends React.Component<
    AppErrorBoundaryProps,
    AppErrorBoundaryState
> {
    state: AppErrorBoundaryState = {
        hasError: false,
    };

    static getDerivedStateFromError(): AppErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Centralized crash log hook for runtime diagnostics.
        console.error('AppErrorBoundary caught runtime error', error, info);
    }

    private onRetry = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <View style={styles.container} testID="app-crash-fallback">
                <Text style={styles.title}>Something went wrong</Text>
                <Text style={styles.message}>
                    The app hit an unexpected error. You can retry or relaunch
                    the app.
                </Text>
                <Pressable style={styles.button} onPress={this.onRetry}>
                    <Text style={styles.buttonText}>Try Again</Text>
                </Pressable>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#05070A',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    title: {
        color: '#F9FAFB',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
    },
    message: {
        color: '#9CA3AF',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    buttonText: {
        color: '#F9FAFB',
        fontSize: 16,
        fontWeight: '700',
    },
});
