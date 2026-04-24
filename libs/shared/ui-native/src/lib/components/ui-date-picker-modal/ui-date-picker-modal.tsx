import React, { useEffect, useState } from 'react';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { translateWithFallback } from '@pos/shared/utils';

export interface UIDatePickerModalProps {
    open: boolean;
    date: Date;
    mode?: 'date' | 'time' | 'datetime';
    title?: string;
    onConfirm: (date: Date) => void;
    onCancel: () => void;
}

export function UIDatePickerModal({
    open,
    date,
    mode = 'date',
    title = translateWithFallback('COMMON_SelectDate', 'Select date'),
    onConfirm,
    onCancel,
}: UIDatePickerModalProps) {
    const t = translateWithFallback;
    const [draftDate, setDraftDate] = useState(date);

    useEffect(() => {
        if (open) {
            setDraftDate(date);
        }
    }, [date, open]);

    const handleChange = (_event: DateTimePickerEvent, nextDate?: Date) => {
        if (nextDate) {
            setDraftDate(nextDate);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={open}
            onRequestClose={onCancel}
            presentationStyle="fullScreen"
            supportedOrientations={['landscape-left', 'landscape-right']}
            testID="ui-date-picker-modal"
        >
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <DateTimePicker
                        testID="ui-date-picker-modal-input"
                        value={draftDate}
                        mode={mode}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleChange}
                        themeVariant="dark"
                    />
                    <View style={styles.actions}>
                        <Pressable
                            testID="ui-date-picker-modal-cancel"
                            style={[styles.button, styles.secondaryButton]}
                            onPress={onCancel}
                        >
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                                {t('COMMON_Cancel', 'Cancel')}
                            </Text>
                        </Pressable>
                        <Pressable
                            testID="ui-date-picker-modal-confirm"
                            style={[styles.button, styles.primaryButton]}
                            onPress={() => onConfirm(draftDate)}
                        >
                            <Text style={styles.buttonText}>
                                {t('COMMON_Confirm', 'Confirm')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(3, 7, 18, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: 360,
        maxWidth: '100%',
        borderRadius: 20,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1f2937',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    actions: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        minWidth: 104,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    primaryButton: {
        backgroundColor: '#4aa3eb',
    },
    secondaryButton: {
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#334155',
    },
    buttonText: {
        color: '#f8fafc',
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryButtonText: {
        color: '#cbd5e1',
    },
});

export default UIDatePickerModal;
