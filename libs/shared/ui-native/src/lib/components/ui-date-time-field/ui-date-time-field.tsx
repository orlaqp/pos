import React, { useMemo, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { UIDatePickerModal } from '../ui-date-picker-modal/ui-date-picker-modal';

type UIDateTimeFieldProps = {
  name: string;
  label: string;
  placeholder: string;
  mode: 'date' | 'time';
  title?: string;
  rules?: RegisterOptions;
  disabled?: boolean;
};

const pad = (value: number) => `${value}`.padStart(2, '0');

const parseStoredValue = (value: string, mode: 'date' | 'time') => {
  if (!value.trim()) {
    return new Date();
  }

  if (mode === 'time') {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);

    if (match) {
      const date = new Date();
      date.setHours(Number(match[1]), Number(match[2]), 0, 0);
      return date;
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatDisplayValue = (value: string, mode: 'date' | 'time') => {
  if (!value.trim()) {
    return '';
  }

  const parsed = parseStoredValue(value, mode);

  if (mode === 'time') {
    return parsed.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return parsed.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const toStoredValue = (date: Date, mode: 'date' | 'time') => {
  if (mode === 'time') {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  return date.toISOString();
};

export function UIDateTimeField({
  name,
  label,
  placeholder,
  mode,
  title,
  rules,
  disabled = false,
}: UIDateTimeFieldProps) {
  const { control } = useFormContext();
  const sharedStyles = useSharedStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          marginTop: 10,
        },
        label: {
          color: theme.theme.colors.grey2,
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 6,
          marginLeft: 10,
        },
        field: {
          minHeight: 56,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: theme.theme.colors.grey5,
          borderWidth: 1,
          borderColor: 'transparent',
          justifyContent: 'center',
        },
        fieldDisabled: {
          opacity: 0.6,
        },
        fieldValue: {
          color: theme.theme.colors.grey0,
          fontSize: 16,
          textAlign: 'right',
        },
        placeholder: {
          color: theme.theme.colors.grey3,
        },
        error: {
          color: theme.theme.colors.error,
          fontSize: 12,
          marginTop: 6,
          marginLeft: 10,
        },
        focused: {
          borderColor: theme.theme.colors.primary,
        },
      }),
    [theme.theme.colors]
  );

  return (
    <Controller
      control={control}
      name={name}
      defaultValue=""
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const stringValue =
          typeof value === 'string' ? value : value == null ? '' : String(value);
        const displayValue = formatDisplayValue(stringValue, mode);
        const pickerDate = parseStoredValue(stringValue, mode);

        return (
          <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <Pressable
              testID={`ui-date-time-field-${name}`}
              disabled={disabled}
              style={[
                sharedStyles.inputContainerStyle,
                styles.field,
                open ? styles.focused : undefined,
                disabled ? styles.fieldDisabled : undefined,
              ]}
              onPress={() => setOpen(true)}
            >
              <Text
                style={[
                  sharedStyles.inputStyle,
                  styles.fieldValue,
                  !displayValue ? styles.placeholder : undefined,
                ]}
              >
                {displayValue || placeholder}
              </Text>
            </Pressable>
            {error?.message ? <Text style={styles.error}>{error.message}</Text> : null}
            <UIDatePickerModal
              open={open}
              date={pickerDate}
              mode={mode}
              title={title || label}
              onConfirm={(date) => {
                setOpen(false);
                onChange(toStoredValue(date, mode));
              }}
              onCancel={() => setOpen(false)}
            />
          </View>
        );
      }}
    />
  );
}

export default UIDateTimeField;
