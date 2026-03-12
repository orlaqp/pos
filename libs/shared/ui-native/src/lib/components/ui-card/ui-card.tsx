import {
    RadiusToken,
    SpacingToken,
    useDesignTokens,
} from '@pos/theme/native/design-tokens';
import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

export type UICardTone = 'default' | 'muted' | 'accent';

export interface UICardProps extends Omit<ViewProps, 'style'> {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    padding?: SpacingToken;
    radius?: RadiusToken;
    tone?: UICardTone;
    elevated?: boolean;
}

export function UICard({
    children,
    style,
    padding = 'lg',
    radius = 'md',
    tone = 'default',
    elevated = false,
    ...props
}: UICardProps) {
    const tokens = useDesignTokens();

    const backgroundByTone: Record<UICardTone, string> = {
        default: tokens.colors.surface,
        muted: tokens.colors.surfaceMuted,
        accent: tokens.colors.surfaceAccent,
    };

    const baseStyle: ViewStyle = {
        backgroundColor: backgroundByTone[tone],
        borderColor: tokens.colors.border,
        borderWidth: 1,
        borderRadius: tokens.radii[radius],
        padding: tokens.spacing[padding],
    };

    const elevationStyle: ViewStyle | undefined = elevated
        ? {
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 8,
              shadowOffset: {
                  width: 0,
                  height: 4,
              },
              elevation: 5,
          }
        : undefined;

    return (
        <View {...props} style={[baseStyle, elevationStyle, style]}>
            {children}
        </View>
    );
}

export default UICard;
