import { createTheme, ThemeMode } from '@rneui/themed';
import { designTokens } from './design-tokens';

export const theme = (mode: ThemeMode) => createTheme({
    mode,
    // lightColors: {
    //     ...Platform.select({
    //         default: lightColors.platform.ios,
    //         ios: lightColors.platform.ios,
    //     }),
    // },
    // darkColors: {
    //     ...Platform.select({
    //         default: lightColors.platform.ios,
    //         ios: lightColors.platform.ios,
    //     })
    // },
    // Button: {
    //     raised: true,
    // },
    // Input: {
    //     inputContainerStyle: { borderWidth: 1 }
    // }
});

export const getThemeColors = (
    themeValue?: { theme?: { colors?: Record<string, string> } } | null
) => ({
    background: designTokens.colors.canvas,
    black: designTokens.colors.textPrimary,
    white: designTokens.colors.textPrimary,
    grey0: designTokens.colors.textPrimary,
    grey1: '#d7dee6',
    grey2: designTokens.colors.textSecondary,
    grey3: designTokens.colors.textMuted,
    grey4: '#5d6977',
    grey5: '#38424d',
    primary: designTokens.colors.accent,
    success: designTokens.colors.success,
    warning: designTokens.colors.warning,
    error: designTokens.colors.danger,
    disabled: '#5d6977',
    ...(themeValue?.theme?.colors ?? {}),
});
