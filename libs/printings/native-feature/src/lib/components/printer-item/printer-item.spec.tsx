
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { render } from '@testing-library/react-native';

import { PrinterItem } from './printer-item';

describe('PrinterItem', () => {
    const item: any = {
        identifier: 'printer-1',
        model: 'TSP100',
        ip: '10.0.0.20',
        interfaceType: 'Lan',
    };

    it('shows default printer badge when current item is default', () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText, queryByText } = render(
            <PrinterItem item={item} navigation={navigation} defaultPrinter={item} />
        );

        expect(getByText('Default Printer')).toBeTruthy();
        expect(queryByText('Set as Default')).toBeNull();
    });

    it('renders successfully when current item is not the default', () => {
        const navigation: any = { navigate: jest.fn() };
        const { container } = render(
            <PrinterItem
                item={item}
                navigation={navigation}
                defaultPrinter={{ ...item, identifier: 'printer-2' }}
                setAsDefault={jest.fn()}
            />
        );
        expect(container).toBeTruthy();
    });

    it('invokes setAsDefault action when not default', () => {
        const item: any = {
            identifier: 'printer-1',
            model: 'TSP100',
            ip: '10.0.0.20',
            interfaceType: 'Lan',
        };
        const navigation: any = { navigate: jest.fn() };
        const setAsDefault = jest.fn();
        const { UNSAFE_getAllByType } = render(
            <PrinterItem
                item={item}
                navigation={navigation}
                defaultPrinter={{ ...item, identifier: 'printer-2' }}
                setAsDefault={setAsDefault}
            />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[touchables.length - 1].props.onPress();
        expect(setAsDefault).toHaveBeenCalledWith(item);
    });
});
