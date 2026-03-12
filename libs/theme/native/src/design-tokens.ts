export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
} as const;

export const radii = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
} as const;

export const typography = {
    caption: 12,
    body: 16,
    subtitle: 18,
    title: 24,
    hero: 42,
} as const;

export const layout = {
    contentMaxWidth: 1200,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;

export const designTokens = {
    spacing,
    radii,
    typography,
    layout,
    colors: {
        canvas: '#000000',
        surface: '#2f374244',
        surfaceMuted: '#2f37422a',
        surfaceAccent: '#4aa3eb33',
        border: '#2f374288',
        textPrimary: '#f7f9fc',
        textSecondary: '#aab6c2',
        textMuted: '#8491a2',
        accent: '#4aa3eb',
        success: '#34c759',
        warning: '#ffb020',
        danger: '#ff5a5f',
    },
} as const;

export const useDesignTokens = () => designTokens;
