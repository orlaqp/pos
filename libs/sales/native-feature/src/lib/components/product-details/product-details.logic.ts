import { CartItem } from '@pos/sales/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';

export const toQuantityNumber = (quantityText: string): number =>
    quantityText === '' ? 0 : +quantityText;

export const toSanitizedQuantityNumber = (
    quantityText: string,
    each = false
): number => {
    const numericValue = toQuantityNumber(quantityText);
    if (!each) {
        return numericValue;
    }

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return 0;
    }

    return Math.trunc(numericValue);
};

export const calculateLinePrice = (
    quantityText: string,
    unitPrice: number,
    each = false
): number => toSanitizedQuantityNumber(quantityText, each) * unitPrice;

export const isQuantityInputValid = (text: string): boolean => {
    return isQuantityInputValidForUnit(text, false);
};

export const isQuantityInputValidForUnit = (
    text: string,
    each = false
): boolean => {
    if (text.length === 0) return true;
    if (each) {
        return /^[0-9]+$/.test(text);
    }

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
    quantity: toSanitizedQuantityNumber(
        quantityText,
        item.product.unitOfMeasure === EACH
    ),
});
