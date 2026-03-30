import { StyleSheet } from 'react-native';
import { useTheme } from '@rneui/themed';
import { getThemeColors, useSharedStyles } from '@pos/theme/native';

export const useHomeScreenStyles = () => {
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const sharedStyles = useSharedStyles();

    return StyleSheet.create({
        ...sharedStyles,
        container: {
            flex: 1,
            paddingHorizontal: 24,
            backgroundColor: '#05070b',
        },
        containerContent: {
            flexGrow: 1,
            justifyContent: 'center',
            paddingVertical: 32,
        },
        shell: {
            flexDirection: 'row',
            gap: 18,
            alignItems: 'stretch',
        },
        e2eShortcut: {
            position: 'absolute',
            top: 12,
            right: 12,
            width: 96,
            height: 24,
            zIndex: 10,
            opacity: 0.18,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 6,
        },
        hero: {
            flex: 1,
            backgroundColor: '#10141b',
            borderRadius: 28,
            padding: 28,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
        },
        businessLabel: {
            color: '#7eb6ff',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 12,
            fontSize: 12,
            fontWeight: '700',
        },
        heroTitle: {
            color: '#f3f7ff',
            fontSize: 38,
            fontWeight: '700',
            marginBottom: 12,
        },
        heroSubtitle: {
            color: '#a3adba',
            fontSize: 16,
            lineHeight: 24,
            maxWidth: 420,
        },
        keypadCard: {
            width: 360,
            backgroundColor: '#10141b',
            borderRadius: 28,
            padding: 24,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            shadowColor: '#000',
            shadowOpacity: 0.24,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
        },
        wizardCardWide: {
            width: 640,
        },
        keypadTitle: {
            color: '#f4f8ff',
            fontSize: 26,
            fontWeight: '700',
            marginBottom: 8,
            textAlign: 'center',
        },
        keypadHint: {
            color: '#a3adba',
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 20,
        },
        pinLogoffButton: {
            marginTop: 18,
            paddingVertical: 12,
            alignItems: 'center',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.14)',
            backgroundColor: 'rgba(255,255,255,0.03)',
        },
        pinLogoffButtonText: {
            color: '#cfd7e3',
            fontSize: 15,
            fontWeight: '600',
        },
        setupButton: {
            borderRadius: 16,
            minHeight: 52,
            marginTop: 12,
            backgroundColor: colors.primary,
        },
        setupLogoffButtonText: {
            color: '#cfd7e3',
            fontSize: 15,
            fontWeight: '600',
        },
        formRow: {
            flexDirection: 'row',
            gap: 14,
        },
        formColumn: {
            flex: 1,
        },
        fullWidthInputContainer: {
            width: '100%',
            paddingHorizontal: 0,
            marginTop: 10,
        },
        fullWidthInputField: {
            ...sharedStyles.inputContainerStyle,
            borderBottomWidth: 0,
        },
        fullWidthInputText: {
            ...sharedStyles.inputStyle,
            textAlign: 'left',
        },
        formSpacer: {
            minHeight: 1,
        },
        wizardSteps: {
            marginTop: 20,
            gap: 12,
        },
        wizardStepRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        wizardStepDot: {
            width: 12,
            height: 12,
            borderRadius: 6,
            marginRight: 10,
            backgroundColor: 'rgba(255,255,255,0.16)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
        },
        wizardStepDotActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        wizardStepDotComplete: {
            backgroundColor: '#34c759',
            borderColor: '#34c759',
        },
        wizardStepText: {
            color: '#c7d0dc',
            fontSize: 15,
        },
        brandMark: {
            width: 110,
            height: 110,
            marginBottom: 18,
            opacity: 0.98,
        },
        routeGrid: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        bigButton: {
            backgroundColor: '#10141b',
            borderRadius: 24,
            margin: 15,
            padding: 24,
            minWidth: 220,
            minHeight: 220,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
        },
        routeIcon: {
            marginBottom: 16,
        },
        routeTitle: {
            color: '#f3f7ff',
            fontSize: 22,
            fontWeight: '700',
            textAlign: 'center',
        },
    });
};

export type HomeScreenStyles = ReturnType<typeof useHomeScreenStyles>;
