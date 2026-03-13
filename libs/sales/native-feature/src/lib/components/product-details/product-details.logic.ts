import { CartItem } from '@pos/sales/data-access';

export const toQuantityNumber = (quantityText: string): number =>
    quantityText === '' ? 0 : +quantityText;

export const calculateLinePrice = (
    quantityText: string,
    unitPrice: number
): number => toQuantityNumber(quantityText) * unitPrice;

export const isQuantityInputValid = (text: string): boolean => {
    if (text.length === 0) return true;
    const val = +text;
    return !isNaN(val) && /^[0-9]+(\.[0-9]*)*$/.test(text);
};

export const hasEnoughInventory = (
    enforceSalesBasedOnInventory: boolean | undefined,
    availableQuantity: number | undefined,
    requestedQuantityText: string
): boolean => {
    if (!enforceSalesBasedOnInventory) return true;
    if (availableQuantity === undefined) return true;
    return availableQuantity - toQuantityNumber(requestedQuantityText) >= 0;
};

export const buildCartUpsertItem = (
    item: CartItem,
    quantityText: string
): CartItem => ({
    identifier: item.identifier,
    product: item.product,
    quantity: toQuantityNumber(quantityText),
});
