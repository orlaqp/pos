import { Alert } from 'react-native';

export const confirm = (subject: string, text: string, confirmAction: () => unknown) => {
    Alert.alert(
        subject || 'Are you sure?',
        text || 'You will not be able to undo this operation',
        [
            { text: 'No' },
            { text: 'Yes', onPress: confirmAction },
        ]
    );
};