import React from 'react';
import { render } from '@testing-library/react-native';
import { FormProvider, useForm } from 'react-hook-form';

import { UISwitch } from './ui-switch';

function Wrapper({ children }: { children: React.ReactNode }) {
    const form = useForm<{ enabled: boolean }>({
        defaultValues: { enabled: false },
    });
    return <FormProvider {...form}>{children}</FormProvider>;
}

describe('UiSwitch', () => {
    it('should render successfully', () => {
        const { toJSON } = render(
            <Wrapper>
                <UISwitch name="enabled" label="Enabled" />
            </Wrapper>
        );
        expect(toJSON()).toBeTruthy();
    });
});
