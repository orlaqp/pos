import React from 'react';
import { Dialog } from '@rneui/themed';
import { CartItem } from '@pos/sales/data-access';
import ProductDetails from '../product-details/product-details';

interface SalesProductDialogProps {
    product?: CartItem;
    overlayStyle: object;
    enforceSalesBasedOnInventory?: boolean;
    onClose: () => void;
    onUpsertCart: (item: CartItem) => void;
}

export function SalesProductDialog({
    product,
    overlayStyle,
    enforceSalesBasedOnInventory,
    onClose,
    onUpsertCart,
}: SalesProductDialogProps) {
    return (
        <Dialog
            isVisible={!!product}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={overlayStyle}
        >
            {product ? (
                <ProductDetails
                    item={product}
                    upsertCart={onUpsertCart}
                    enforceSalesBasedOnInventory={enforceSalesBasedOnInventory}
                />
            ) : null}
        </Dialog>
    );
}
