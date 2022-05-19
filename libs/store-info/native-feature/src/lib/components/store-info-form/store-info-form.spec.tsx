import React from 'react';
import { render } from '@testing-library/react-native';

import StoreInfoForm from './store-info-form';

describe('StoreInfoForm', () => {
    it('should render successfully', () => {
        const { container } = render(<StoreInfoForm />);
        expect(container).toBeTruthy();
    });
});
