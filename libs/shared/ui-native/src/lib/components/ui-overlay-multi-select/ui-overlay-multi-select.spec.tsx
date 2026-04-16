import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { FormProvider, useForm } from 'react-hook-form';

import { UIOverlayMultiSelect } from './ui-overlay-multi-select';

function Wrapper({ children }: { children: React.ReactNode }) {
    const form = useForm<{ productIds?: string[] }>({
        defaultValues: { productIds: [] },
    });

    return <FormProvider {...form}>{children}</FormProvider>;
}

describe('UIOverlayMultiSelect', () => {
    it('renders successfully without search', () => {
        const { toJSON } = render(
            <Wrapper>
                <UIOverlayMultiSelect
                    name="productIds"
                    title="Select products"
                    list={[{ id: '1', name: 'Apple' }]}
                />
            </Wrapper>
        );

        expect(toJSON()).toBeTruthy();
    });

    it('filters visible options when search is enabled', () => {
        const { getByTestId, getByText, queryByText } = render(
            <Wrapper>
                <UIOverlayMultiSelect
                    name="productIds"
                    title="Select products"
                    list={[
                        { id: '1', name: 'Apple' },
                        { id: '2', name: 'Bread' },
                    ]}
                    searchable
                    searchPlaceholder="Filter products"
                />
            </Wrapper>
        );

        fireEvent.press(getByTestId('ui-overlay-multi-select-trigger-productIds'));
        expect(getByTestId('ui-overlay-multi-select-search-productIds')).toBeTruthy();
        expect(getByText('Apple')).toBeTruthy();
        expect(getByText('Bread')).toBeTruthy();

        fireEvent.changeText(
            getByTestId('ui-overlay-multi-select-search-productIds'),
            'app'
        );

        expect(getByText('Apple')).toBeTruthy();
        expect(queryByText('Bread')).toBeNull();
    });
});
