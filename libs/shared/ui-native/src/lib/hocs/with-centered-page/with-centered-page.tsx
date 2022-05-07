import React from 'react';
import { useSharedStyles } from '@pos/theme/native';

import { View } from 'react-native';

export function withCenteredPage(WrapperComponent: React.ComponentType<any>) {
    return () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const sharedStyles = useSharedStyles();

        return (
            <View style={[sharedStyles.page, sharedStyles.centered]}>
                <WrapperComponent />
            </View>
        );
    };
}

export default withCenteredPage;
