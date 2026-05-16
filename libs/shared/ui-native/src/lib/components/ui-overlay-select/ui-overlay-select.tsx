import React, { useState } from 'react';
import { useSharedStyles } from '@pos/theme/native';
import { Button, Overlay, useTheme } from '@rneui/themed';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import { translateWithFallback } from '@pos/shared/utils';

export interface IdName {
    id?: string;
    name: string;
}

/* eslint-disable-next-line */
export interface UiOverlaySelectProps {
    name?: string;
    title: string;
    list: IdName[];
    selectedId: string | null | undefined;
    rules?: RegisterOptions;
    onSelection?: (item: IdName) => unknown;
    searchable?: boolean;
    searchPlaceholder?: string;
    clearable?: boolean;
    clearTitle?: string;
}

export const UIOverlaySelect = React.forwardRef<
    typeof Overlay,
    UiOverlaySelectProps
>((props, ref) => {
    const {
        name,
        title,
        list,
        onSelection,
        rules,
        searchable,
        searchPlaceholder,
        clearable,
        clearTitle,
    } = props;
    const t = translateWithFallback;
    const styles = useStyles();
    const [visible, setVisible] = useState(false);
    const [selected, setSelected] = useState<IdName>();
    const [searchText, setSearchText] = useState('');
    const { control } = useFormContext();
    const options = list || [];
    const normalizedSearch = searchText.trim().toLowerCase();
    const filteredOptions =
        searchable && normalizedSearch
            ? options.filter(
                  (item) =>
                      item.name.toLowerCase().includes(normalizedSearch) ||
                      String(item.id || '')
                          .toLowerCase()
                          .includes(normalizedSearch),
              )
            : options;

    const toggleOverlay = () => setVisible(!visible);
    const getSelected = (value: string) => options.find((i) => i.id === value);
    const hasSelection = (value: unknown) =>
        value !== undefined && value !== null && value !== '';
    const select = (item: IdName) => {
        setSelected(item);
        toggleOverlay();
        if (onSelection) onSelection(item);
    };

    if (name) {
        return (
            <Controller
                control={control}
                name={name}
                render={({
                    field: { onChange, value, onBlur, ref },
                    fieldState: { isTouched, isDirty, error },
                }) => (
                    <>
                        <Button
                            title={getSelected(value)?.name || title}
                            onPress={toggleOverlay}
                            buttonStyle={[
                                styles.button,
                                error ? styles.buttonError : undefined,
                            ]}
                            type="outline"
                            titleStyle={styles.buttonTitle}
                        />
                        {error?.message ? (
                            <Text style={styles.errorText}>
                                {error.message}
                            </Text>
                        ) : null}
                        <Overlay
                            isVisible={visible}
                            onBackdropPress={toggleOverlay}
                            overlayStyle={styles.overlay}
                            supportedOrientations={[
                                'landscape-left',
                                'landscape-right',
                            ]}
                            presentationStyle="fullScreen"
                        >
                            <View style={styles.overlayContent}>
                                <View style={styles.overlayHeader}>
                                    <Text style={styles.overlayEyebrow}>
                                        {t('COMMON_Select', 'Select')}
                                    </Text>
                                    <Text style={styles.overlayTitle}>
                                        {title}
                                    </Text>
                                    <Text style={styles.overlaySubtitle}>
                                        {t(
                                            'COMMON_ChooseOneOption',
                                            'Choose one option to continue.',
                                        )}
                                    </Text>
                                </View>
                                {searchable ? (
                                    <TextInput
                                        testID={`overlay-select-search-${name}`}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        placeholder={
                                            searchPlaceholder ||
                                            t('COMMON_Search', 'Search')
                                        }
                                        placeholderTextColor="#8f9baa"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        style={styles.searchInput}
                                    />
                                ) : null}
                                {clearable && hasSelection(value) ? (
                                    <Button
                                        testID={`overlay-select-clear-${name}`}
                                        title={
                                            clearTitle ||
                                            t(
                                                'COMMON_ClearSelection',
                                                'Clear selection',
                                            )
                                        }
                                        onPress={() => {
                                            onChange(null);
                                            setSelected(undefined);
                                            setSearchText('');
                                            toggleOverlay();
                                        }}
                                        type="outline"
                                        buttonStyle={styles.clearButton}
                                        titleStyle={styles.clearButtonTitle}
                                    />
                                ) : null}
                                <FlatList
                                    data={filteredOptions}
                                    keyExtractor={(item, index) =>
                                        `${item.id || item.name}-${index}`
                                    }
                                    contentContainerStyle={styles.listContent}
                                    ListEmptyComponent={
                                        <Text style={styles.emptyText}>
                                            {t(
                                                normalizedSearch
                                                    ? 'COMMON_NoMatchingOptions'
                                                    : 'COMMON_NoOptionsAvailable',
                                                normalizedSearch
                                                    ? 'No matching options'
                                                    : 'No options available',
                                            )}
                                        </Text>
                                    }
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.dataRow,
                                                item.id === value
                                                    ? styles.dataRowSelected
                                                    : undefined,
                                            ]}
                                            onPress={() => {
                                                onChange(item.id);
                                                select(item);
                                            }}
                                        >
                                            <View style={styles.optionCopy}>
                                                <Text style={styles.name}>
                                                    {item.name}
                                                </Text>
                                                <Text style={styles.optionMeta}>
                                                    {item.id || item.name}
                                                </Text>
                                            </View>
                                            {item.id === value ? (
                                                <Text
                                                    style={styles.selectedTag}
                                                >
                                                    {t(
                                                        'COMMON_Selected',
                                                        'Selected',
                                                    )}
                                                </Text>
                                            ) : null}
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </Overlay>
                    </>
                )}
                rules={rules}
            />
        );
    }

    return (
        <>
            <Button
                title={selected?.name || title}
                onPress={toggleOverlay}
                buttonStyle={styles.button}
                type="outline"
                titleStyle={styles.buttonTitle}
            />
            <Overlay
                isVisible={visible}
                onBackdropPress={toggleOverlay}
                overlayStyle={styles.overlay}
                supportedOrientations={['landscape-left', 'landscape-right']}
                presentationStyle="fullScreen"
            >
                <View style={styles.overlayContent}>
                    <View style={styles.overlayHeader}>
                        <Text style={styles.overlayEyebrow}>
                            {t('COMMON_Select', 'Select')}
                        </Text>
                        <Text style={styles.overlayTitle}>{title}</Text>
                        <Text style={styles.overlaySubtitle}>
                            {t(
                                'COMMON_ChooseOneOption',
                                'Choose one option to continue.',
                            )}
                        </Text>
                    </View>
                    {searchable ? (
                        <TextInput
                            testID="overlay-select-search"
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder={
                                searchPlaceholder ||
                                t('COMMON_Search', 'Search')
                            }
                            placeholderTextColor="#8f9baa"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.searchInput}
                        />
                    ) : null}
                    {clearable && selected ? (
                        <Button
                            testID="overlay-select-clear"
                            title={
                                clearTitle ||
                                t('COMMON_ClearSelection', 'Clear selection')
                            }
                            onPress={() => {
                                setSelected(undefined);
                                setSearchText('');
                                toggleOverlay();
                            }}
                            type="outline"
                            buttonStyle={styles.clearButton}
                            titleStyle={styles.clearButtonTitle}
                        />
                    ) : null}
                    <FlatList
                        data={filteredOptions}
                        keyExtractor={(item, index) =>
                            `${item.id || item.name}-${index}`
                        }
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                {t(
                                    normalizedSearch
                                        ? 'COMMON_NoMatchingOptions'
                                        : 'COMMON_NoOptionsAvailable',
                                    normalizedSearch
                                        ? 'No matching options'
                                        : 'No options available',
                                )}
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.dataRow,
                                    item.id === selected?.id
                                        ? styles.dataRowSelected
                                        : undefined,
                                ]}
                                onPress={() => select(item)}
                            >
                                <View style={styles.optionCopy}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.optionMeta}>
                                        {item.id || item.name}
                                    </Text>
                                </View>
                                {item.id === selected?.id ? (
                                    <Text style={styles.selectedTag}>
                                        {t('COMMON_Selected', 'Selected')}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Overlay>
        </>
    );
});

const useStyles = () => {
    const theme = useTheme();
    const colors = theme?.theme?.colors || {
        background: '#000000',
        grey2: '#8f9baa',
        grey1: '#ffffff',
        primary: '#4aa3eb',
    };
    const sharedStyles = useSharedStyles();

    return {
        ...StyleSheet.create({
            overlay: {
                backgroundColor: colors.background,
                width: 460,
                maxHeight: 520,
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
                paddingBottom: 2,
            },
            emptyText: {
                color: colors.grey2,
                textAlign: 'center',
                paddingVertical: 28,
            },
            searchInput: {
                color: colors.grey1,
                minHeight: 44,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                paddingHorizontal: 14,
                marginBottom: 12,
                fontSize: 15,
            },
            clearButton: {
                borderRadius: 10,
                minHeight: 40,
                borderColor: 'rgba(239,68,68,0.55)',
                backgroundColor: 'rgba(239,68,68,0.08)',
                marginBottom: 12,
            },
            clearButtonTitle: {
                color: '#fca5a5',
                fontSize: 14,
                fontWeight: '700',
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
            buttonError: {
                borderColor: '#ef4444',
            },
            buttonTitle: {
                color: colors.primary,
                fontSize: 14,
                fontWeight: '600',
                paddingLeft: 15,
                paddingRight: 15,
            },
            errorText: {
                color: '#ef4444',
                fontSize: 12,
                marginHorizontal: 12,
                marginTop: -4,
                marginBottom: 8,
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
            selectedTag: {
                color: colors.primary,
                fontSize: 12,
                fontWeight: '700',
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
            },
            dataRowSelected: {
                borderColor: colors.primary,
                backgroundColor: 'rgba(74,163,235,0.10)',
            },
        }),
    };
};
