import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View, Text } from 'react-native';

export function withPage(WrapperComponent: React.ComponentType<any>) {
    return () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const sharedStyles = useSharedStyles();

        return (
            <View style={sharedStyles.page}>
                <WrapperComponent />
            </View>
        );
    };
}

export default withPage;
