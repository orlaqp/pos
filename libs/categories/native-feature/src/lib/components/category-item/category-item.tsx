import React, { useEffect, useState } from 'react';

import { View, Text, Image, StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { Category } from '@pos/models';
import { AssetsService } from 'libs/shared/ui-native/src/lib/components/ui-file-upload/assets.service';

/* eslint-disable-next-line */
export interface CategoryItemProps {
    item: Category;
}

export function CategoryItem({ item }: CategoryItemProps) {
    const theme = useTheme();
    const styles = useStyles();
    const [uri, setUri] = useState<string | undefined>();

    useEffect(() => {
        async function getImageUri() {
            if (!item.picture) {
                return setUri(undefined);
            }
            setUri(await AssetsService.getAssetUri(item.picture));
        }

        getImageUri();
    }, [item])

    return (
        <View style={styles.dataRow}>
            <Image 
                source={{ uri }}
                // style={{ width: width || 95, height: height || 115 }}
                resizeMode='contain'
                style={{
                    flex: 1.3,
                    height: 2*25,
                    width: 2*100,
                }}
            />
            <View style={{ flex: 5 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
            <View
                style={{
                    flex: 2,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Button
                    type="clear"
                    title="Edit"
                    icon={{
                        name: 'pencil-outline',
                        type: 'material-community',
                    }}
                />
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                />
            </View>
        </View>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            dataRow: {
                ...sharedStyles.row,
                padding: 20,
                backgroundColor: `${theme.theme.colors.searchBg}44`,
                borderRadius: 10,
                marginBottom: 10,
            },
            name: {
                fontSize: 18,
                color: theme.theme.colors.grey0,
                marginBottom: 5,
            },
            description: {
                fontSize: 14,
                color: theme.theme.colors.grey3,
            },
        }),
    };
};

export default CategoryItem;
