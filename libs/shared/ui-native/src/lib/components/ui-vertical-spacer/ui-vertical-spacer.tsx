import React from 'react';

import { View } from 'react-native';

/* eslint-disable-next-line */
export interface UiVerticalSpacerProps {
    size: 'small' | 'medium' | 'large';
}

const sizeMap = {
    'small': 10,
    'medium': 20,
    'large': 40,
}

export function UIVerticalSpacer({ size }: UiVerticalSpacerProps) {
    return <View style={{ marginBottom: sizeMap[size] }} />;
}

export default UIVerticalSpacer;
