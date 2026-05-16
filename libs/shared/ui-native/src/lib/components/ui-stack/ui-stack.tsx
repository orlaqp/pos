import { SpacingToken, useDesignTokens } from '@pos/theme/native/design-tokens';
import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

export interface UIStackProps extends Omit<ViewProps, 'style'> {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    direction?: 'vertical' | 'horizontal';
    spacing?: SpacingToken;
    align?: ViewStyle['alignItems'];
    justify?: ViewStyle['justifyContent'];
    wrap?: boolean;
}

export function UIStack({
    children,
    style,
    direction = 'vertical',
    spacing = 'md',
    align,
    justify,
    wrap = false,
    ...props
}: UIStackProps) {
    const tokens = useDesignTokens();
    const gapSize = tokens.spacing[spacing];
    const items = React.Children.toArray(children).filter(Boolean);
    const isRow = direction === 'horizontal';

    const containerStyle: ViewStyle = {
        flexDirection: isRow ? 'row' : 'column',
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
    };

    return (
        <View {...props} style={[containerStyle, style]}>
            {items.map((child, index) => {
                const isLast = index === items.length - 1;
                const itemSpacingStyle: ViewStyle | undefined = isLast
                    ? undefined
                    : (isRow ? { marginRight: gapSize } : { marginBottom: gapSize });

                return (
                    <View key={`ui-stack-item-${index}`} style={itemSpacingStyle}>
                        {child}
                    </View>
                );
            })}
        </View>
    );
}

export default UIStack;
