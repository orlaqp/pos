import React from 'react';
import { render } from '@testing-library/react-native';

import UiFileUpload from './ui-file-upload';

describe('UiFileUpload', () => {
    it('should render successfully', () => {
        const { container } = render(<UiFileUpload />);
        expect(container).toBeTruthy();
    });
});
