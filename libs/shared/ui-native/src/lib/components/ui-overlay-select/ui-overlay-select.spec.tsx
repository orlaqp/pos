import React from 'react';
import { render } from '@testing-library/react-native';
import { FormProvider, useForm } from 'react-hook-form';

import { UIOverlaySelect } from './ui-overlay-select';

function Wrapper({ children }: { children: React.ReactNode }) {
    const form = useForm<{ brandId?: string }>({ defaultValues: { brandId: undefined } });
    return <FormProvider {...form}>{children}</FormProvider>;
}

describe('UiOverlaySelect', () => {
    it('should render successfully', () => {
        const { toJSON } = render(
            <Wrapper>
                <UIOverlaySelect
                    name="brandId"
                    title="Select brand"
                    list={[{ id: '1', name: 'Brand A' }]}
                    selectedId={undefined}
                />
            </Wrapper>
        );
        expect(toJSON()).toBeTruthy();
    });
});
