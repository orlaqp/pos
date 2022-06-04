import React from 'react';
import { render } from '@testing-library/react-native';

import ReportViewer from './report-viewer';

describe('ReportViewer', () => {
    it('should render successfully', () => {
        const { container } = render(<ReportViewer />);
        expect(container).toBeTruthy();
    });
});
