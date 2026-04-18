import React, { useMemo, useState } from 'react';
import { Button, Overlay, useTheme } from '@rneui/themed';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { IdName } from '../ui-overlay-select/ui-overlay-select';

export interface UIOverlayMultiSelectProps {
  name: string;
  title: string;
  list: IdName[];
  selectedIds?: string[] | null;
  rules?: RegisterOptions;
  emptyLabel?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const normalizeIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

export function UIOverlayMultiSelect({
  name,
  title,
  list,
  rules,
  emptyLabel,
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Filter options',
}: UIOverlayMultiSelectProps) {
  const theme = useTheme();
  const searchColors = theme?.theme?.colors || {
    grey2: '#8f9baa',
  };
  const { control } = useFormContext();
  const styles = useStyles();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const options = list || [];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((item) => {
      const nameMatches = item.name.toLowerCase().includes(normalizedQuery);
      const idMatches = item.id?.toLowerCase().includes(normalizedQuery);

      return nameMatches || !!idMatches;
    });
  }, [options, normalizedQuery]);

  const openOverlay = () => {
    setSearchQuery('');
    setVisible(true);
  };

  const closeOverlay = () => {
    setSearchQuery('');
    setVisible(false);
  };

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      rules={rules}
      render={({ field: { onChange, value } }) => {
        const selectedIds = normalizeIds(value);
        const selectedItems = options.filter((item) => item.id && selectedIds.includes(item.id));
        const buttonTitle =
          selectedItems.length > 0
            ? selectedItems.map((item) => item.name).join(', ')
            : emptyLabel || title;

        const toggleId = (id?: string) => {
          if (!id) {
            return;
          }

          if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((item) => item !== id));
            return;
          }

          onChange([...selectedIds, id]);
        };

        return (
          <>
            <Button
              title={buttonTitle}
              onPress={() => {
                if (!disabled) {
                  openOverlay();
                }
              }}
              testID={name ? `ui-overlay-multi-select-trigger-${name}` : undefined}
              buttonStyle={styles.button}
              type="outline"
              titleStyle={styles.buttonTitle}
              disabled={disabled}
              disabledStyle={styles.buttonDisabled}
              disabledTitleStyle={styles.buttonTitleDisabled}
            />
            <Overlay
              isVisible={visible}
              onBackdropPress={closeOverlay}
              overlayStyle={styles.overlay}
              supportedOrientations={['landscape-left', 'landscape-right']}
              presentationStyle="fullScreen"
            >
              <View style={styles.overlayContent}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayEyebrow}>Select</Text>
                  <Text style={styles.overlayTitle}>{title}</Text>
                  <Text style={styles.overlaySubtitle}>
                    Choose one or more options to continue.
                  </Text>
                </View>
                {searchable ? (
                  <View style={styles.searchWrap}>
                    <TextInput
                      testID={
                        name ? `ui-overlay-multi-select-search-${name}` : undefined
                      }
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder={searchPlaceholder}
                      placeholderTextColor={searchColors.grey2}
                      style={styles.searchInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                      clearButtonMode="while-editing"
                    />
                  </View>
                ) : null}
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item, index) => `${item.id || item.name}-${index}`}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      {normalizedQuery ? 'No matching options' : 'No options available'}
                    </Text>
                  }
                  renderItem={({ item }) => {
                    const selected = !!item.id && selectedIds.includes(item.id);

                    return (
                      <TouchableOpacity
                        style={[
                          styles.dataRow,
                          selected ? styles.dataRowSelected : undefined,
                        ]}
                        onPress={() => toggleId(item.id)}
                      >
                        <View style={styles.optionCopy}>
                          <Text style={styles.name}>{item.name}</Text>
                          <Text style={styles.optionMeta}>{item.id || item.name}</Text>
                        </View>
                        <View style={[styles.checkbox, selected ? styles.checkboxSelected : undefined]}>
                          {selected ? <Text style={styles.checkboxMark}>✓</Text> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
                <View style={styles.footer}>
                  <Pressable style={styles.footerButtonSecondary} onPress={() => onChange([])}>
                    <Text style={styles.footerButtonSecondaryText}>Clear</Text>
                  </Pressable>
                  <Pressable style={styles.footerButtonPrimary} onPress={closeOverlay}>
                    <Text style={styles.footerButtonPrimaryText}>Done</Text>
                  </Pressable>
                </View>
              </View>
            </Overlay>
          </>
        );
      }}
    />
  );
}

const useStyles = () => {
  const theme = useTheme();
  const colors = theme?.theme?.colors || {
    background: '#000000',
    grey2: '#8f9baa',
    grey1: '#ffffff',
    primary: '#4aa3eb',
  };
  const sharedStyles = useSharedStyles();

  return useMemo(
    () => ({
      ...StyleSheet.create({
        overlay: {
          backgroundColor: colors.background,
          width: 460,
          maxHeight: 560,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          padding: 0,
          overflow: 'hidden',
        },
        overlayContent: {
          minHeight: 120,
          padding: 18,
        },
        searchWrap: {
          paddingBottom: 12,
        },
        overlayHeader: {
          paddingBottom: 14,
        },
        overlayEyebrow: {
          color: colors.primary,
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1.4,
          marginBottom: 6,
          textTransform: 'uppercase',
        },
        overlayTitle: {
          color: colors.grey1,
          fontSize: 22,
          fontWeight: '700',
        },
        overlaySubtitle: {
          color: colors.grey2,
          fontSize: 14,
          lineHeight: 20,
          marginTop: 6,
        },
        listContent: {
          paddingTop: 4,
          paddingBottom: 6,
        },
        searchInput: {
          color: colors.grey1,
          fontSize: 15,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.10)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          paddingHorizontal: 14,
          paddingVertical: 11,
        },
        emptyText: {
          color: colors.grey2,
          textAlign: 'center',
          paddingVertical: 28,
        },
        button: {
          margin: 10,
          borderRadius: 10,
          minHeight: 46,
          borderColor: colors.primary,
          borderWidth: 1,
          backgroundColor: 'transparent',
          paddingHorizontal: 14,
        },
        buttonDisabled: {
          opacity: 0.7,
          borderColor: 'rgba(255,255,255,0.16)',
          backgroundColor: 'rgba(255,255,255,0.03)',
        },
        buttonTitle: {
          color: colors.primary,
          fontSize: 14,
          fontWeight: '600',
          paddingLeft: 15,
          paddingRight: 15,
        },
        buttonTitleDisabled: {
          color: colors.grey2,
        },
        name: {
          color: colors.grey1,
          fontSize: 15,
          fontWeight: '600',
        },
        optionCopy: {
          flex: 1,
          paddingRight: 12,
        },
        optionMeta: {
          color: colors.grey2,
          fontSize: 12,
          marginTop: 2,
        },
        dataRow: {
          ...sharedStyles.row,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 14,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.02)',
          alignItems: 'center',
        },
        dataRowSelected: {
          borderColor: colors.primary,
          backgroundColor: 'rgba(74,163,235,0.10)',
        },
        checkbox: {
          width: 24,
          height: 24,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.02)',
        },
        checkboxSelected: {
          borderColor: colors.primary,
          backgroundColor: colors.primary,
        },
        checkboxMark: {
          color: '#0b1220',
          fontWeight: '800',
          fontSize: 13,
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingTop: 10,
        },
        footerButtonPrimary: {
          minWidth: 104,
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 10,
          backgroundColor: colors.primary,
        },
        footerButtonPrimaryText: {
          color: '#0b1220',
          fontSize: 15,
          fontWeight: '700',
        },
        footerButtonSecondary: {
          minWidth: 104,
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 10,
          backgroundColor: '#1f2937',
          borderWidth: 1,
          borderColor: '#334155',
        },
        footerButtonSecondaryText: {
          color: '#cbd5e1',
          fontSize: 15,
          fontWeight: '700',
        },
      }),
    }),
    [colors.background, colors.grey1, colors.grey2, colors.primary, sharedStyles.row]
  );
};

export default UIOverlayMultiSelect;
