import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { HomeRouteGrid } from './home-route-grid';

jest.mock('@rneui/themed', () => ({
    Icon: () => null,
    Text: ({ children }: { children: React.ReactNode }) => {
        const { Text } = require('react-native');
        return <Text>{children}</Text>;
    },
}));

describe('HomeRouteGrid', () => {
    const styles = {
        routeGrid: {},
        bigButton: {},
        centered: {},
        routeIconWrap: {},
        routeTitle: {},
    } as any;

    it('disables route presses while a route is already pending', () => {
        const onGoTo = jest.fn();
        const { getByTestId } = render(
            <HomeRouteGrid
                paths={[
                    {
                        title: 'Sales',
                        path: 'Sales',
                        icon: 'cart-outline',
                        accentColor: '#4db8ff',
                    },
                ]}
                routeAnimations={[new Animated.Value(1)]}
                styles={styles}
                onGoTo={onGoTo}
                pendingPath="Sales"
            />
        );

        fireEvent.press(getByTestId('home-nav-sales'));
        expect(onGoTo).not.toHaveBeenCalled();
    });
});
