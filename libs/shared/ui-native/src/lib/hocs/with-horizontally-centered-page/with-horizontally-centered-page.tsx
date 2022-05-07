import React from 'react';
import { useSharedStyles } from '@pos/theme/native';

import { View } from 'react-native';

export function withHorizontallyCenteredPage(WrapperComponent: React.ComponentType<any>) {
    return () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const sharedStyles = useSharedStyles();

        return (
            <View style={[sharedStyles.page, { alignItems: 'center' }]}>
                <WrapperComponent />
            </View>
        );
    };
}

export default withHorizontallyCenteredPage;
