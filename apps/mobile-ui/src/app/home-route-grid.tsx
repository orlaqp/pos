import React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import { HomeScreenStyles } from './HomeScreen.styles';

interface PathDetails {
    title: string;
    path: string;
    icon: string;
    accentColor: string;
    subtitle?: string;
}

interface HomeRouteGridProps {
    paths: PathDetails[];
    routeAnimations: Animated.Value[];
    styles: HomeScreenStyles;
    onGoTo: (details: PathDetails) => void;
    pendingPath?: string | null;
}

export function HomeRouteGrid({
    paths,
    routeAnimations,
    styles,
    onGoTo,
    pendingPath,
}: HomeRouteGridProps) {
    return (
        <View style={styles.routeGrid}>
            {paths.map((path, index) => {
                const animation = routeAnimations[index];
                const animatedStyle = {
                    opacity: animation,
                    transform: [
                        {
                            scale: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.92, 1],
                            }),
                        },
                    ],
                };

                return (
                    <Animated.View key={path.title} style={animatedStyle}>
                        <TouchableOpacity
                            disabled={!!pendingPath}
                            onPress={() => onGoTo(path)}
                            testID={`home-nav-${path.path.toLowerCase()}`}
                        >
                            <View
                                style={[
                                    styles.bigButton,
                                    styles.routeCard,
                                    pendingPath === path.path && { opacity: 0.7 },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.routeAccent,
                                        { backgroundColor: path.accentColor },
                                    ]}
                                />
                                <View style={styles.routeCardTop}>
                                    <View
                                        style={[
                                            styles.routeIconWrap,
                                            { backgroundColor: `${path.accentColor}18` },
                                        ]}
                                    >
                                        <Icon
                                            name={path.icon}
                                            type="material-community"
                                            size={40}
                                            color={path.accentColor}
                                            containerStyle={styles.routeIcon}
                                        />
                                    </View>
                                    <Icon
                                        name="arrow-top-right"
                                        type="material-community"
                                        size={22}
                                        color={path.accentColor}
                                    />
                                </View>
                                <View style={styles.routeCardBody}>
                                    <Text style={styles.routeEyebrow}>{path.path}</Text>
                                    <Text style={styles.routeTitle}>{path.title}</Text>
                                    {path.subtitle ? (
                                        <Text style={styles.routeSubtitle}>
                                            {path.subtitle}
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </View>
    );
}
