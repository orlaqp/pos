import { useTheme, Button } from '@rneui/themed';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

import EmptyBox from '../../assets/empty-box.png';

export type UIEmptyStateAction = {
    title: string;
    onPress: () => unknown;
    testID?: string;
    type?: 'solid' | 'outline';
    icon?: {
        name: string;
        type?: string;
        color?: string;
        size?: number;
    };
};

export interface EmptyStateProps {
    title?: string;
    subtitle?: string;
    actions?: UIEmptyStateAction[];
    imageSize?: number;
    picture?: ImageSourcePropType;
    showIllustration?: boolean;
    containerStyle?: object;
    contentStyle?: object;
    text?: string;
    actionText?: string;
    action?: () => unknown;
    icon?: string;
}

export function UIEmptyState({
    title,
    subtitle,
    actions,
    imageSize,
    picture,
    showIllustration = false,
    containerStyle,
    contentStyle,
    text,
    actionText,
    action,
    icon,
}: EmptyStateProps) {
    const theme = useTheme();
    const colors = theme?.theme?.colors || { primary: '#4aa3eb', grey3: '#8491a2' };
    const styles = useStyles(colors.primary, colors.grey3);
    const resolvedTitle = title || text || '';
    const resolvedActions =
        actions ||
        (actionText && action
            ? [
                  {
                      title: actionText,
                      onPress: action,
                      type: 'outline' as const,
                      icon: {
                          name: icon || 'plus',
                          type: 'material-community',
                          color: colors.primary,
                          size: 18,
                      },
                  },
              ]
            : []);
    const size = imageSize || 160;

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={[styles.content, contentStyle]}>
                {showIllustration ? (
                    <Image
                        source={picture || EmptyBox}
                        style={{ width: size, height: size }}
                        resizeMode="contain"
                    />
                ) : null}
                <Text style={styles.title}>{resolvedTitle}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                {resolvedActions.length ? (
                    <View style={styles.actions}>
                        {resolvedActions.map((item) => {
                            const isOutline = item.type === 'outline';

                            return (
                                <Button
                                    key={item.title}
                                    testID={item.testID}
                                    title={item.title}
                                    type={isOutline ? 'outline' : 'solid'}
                                    onPress={item.onPress}
                                    buttonStyle={
                                        isOutline ? styles.secondaryAction : styles.primaryAction
                                    }
                                    titleStyle={
                                        isOutline
                                            ? styles.secondaryActionTitle
                                            : styles.primaryActionTitle
                                    }
                                    icon={
                                        item.icon
                                            ? {
                                                  ...item.icon,
                                                  color:
                                                      item.icon.color ||
                                                      (isOutline ? colors.primary : '#ffffff'),
                                              }
                                            : undefined
                                    }
                                />
                            );
                        })}
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const useStyles = (accent: string, secondaryText: string) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 16,
        },
        content: {
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 520,
        },
        title: {
            color: '#ffffff',
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 6,
            textAlign: 'center',
        },
        subtitle: {
            color: secondaryText,
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'center',
            marginBottom: 20,
        },
        actions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
        },
        primaryAction: {
            backgroundColor: accent,
            borderRadius: 24,
            paddingHorizontal: 16,
            minHeight: 46,
        },
        primaryActionTitle: {
            color: '#ffffff',
            fontWeight: '700',
            marginLeft: 8,
        },
        secondaryAction: {
            borderRadius: 24,
            borderColor: accent,
            paddingHorizontal: 16,
            minHeight: 46,
        },
        secondaryActionTitle: {
            color: accent,
            fontWeight: '700',
            marginLeft: 8,
        },
    });

export default UIEmptyState;
