import { Button } from '@rneui/themed';
import React from 'react';
import { Storage } from 'aws-amplify';

import { View, Text } from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';


/* eslint-disable-next-line */
export interface CategoryFormProps {}

export function CategoryForm(props: CategoryFormProps) {
    const launchLibrary = async () => {
        try {
            const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
            const asset = res.assets?.at(0);

            if (!asset?.uri) return
            console.log('asset', asset);

            const response = await fetch(asset?.uri);
            console.log('fetch response', response);
            
            const blob = await response.blob();
            console.log('blob');
            
            const key = `category-${asset?.fileName}`;
            const putRes = await Storage.put(key, blob);
            console.log('put response', putRes);
            console.log(putRes.key);

            const signedUrl = await Storage.get(key, { download: false })
            console.log('Signed URL', signedUrl);
            
        } catch (error) {
            console.error('error', error);
        }
    }
  return (
    <View>
      
        
    </View>
  );
}

export default CategoryForm;
