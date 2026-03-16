import {
    cartActions,
    CartItem,
    CartPayment as ICartPayment,
    CartState,
    selectCart,
} from '@pos/sales/data-access';
import { UICard } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, Dialog } from '@rneui/themed';
import React, { useEffect, useMemo, useState } from 'react';
import i18next from 'i18next';

import { View, TextInput, Alert, Text, StyleSheet, Image, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { useSharedStyles } from '@pos/theme/native';

import CartLine from '../cart-line/cart-line';
import EmptyCart from '../../../../../../../apps/mobile-ui/assets/illustrations/empty-cart-1600.png';
import CartPayment from '../cart-payment/cart-payment';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { Role } from '@pos/auth/data-access';
import { ProductEntity } from '@pos/products/data-access';
import { selectStore } from '@pos/store-info/data-access';
import { selectStation } from '@pos/settings/data-access';
import {
    buildOrderSummary,
    getEbtEligibleTotal,
    getUnavailableProductMessages,
    isCartReady,
} from './cart.logic';
import { DiscountService } from '@pos/discounts/data-access';
import {
    DiscountDefinition,
    EmployeeDiscountPolicy,
    ManualDiscountRequest,
    PriceOverrideRequest,
} from '@pos/discounts/domain';
import { DataStore } from '@pos/shared/amplify';
import { Station } from '@pos/shared/models';
import DeviceInfo from 'react-native-device-info';

export type CartMode = 'order' | 'payment';

export interface CartProps {
    mode: CartMode;
    onSubmit: (cart: CartState, payments?: ICartPayment[]) => void;
    searchRef: React.RefObject<TextInput>;
    products: ProductEntity[];
}

type ManualDraft = {
    scope: 'LINE' | 'ORDER';
    method: 'PERCENT' | 'AMOUNT';
    value: string;
    reasonCode: string;
    reasonNote: string;
    approverEmployeeId: string;
    approverEmployeeName: string;
    approvalReference: string;
};

type OverrideDraft = {
    finalPrice: string;
    reasonCode: string;
    reasonNote: string;
    approverEmployeeId: string;
    approverEmployeeName: string;
    approvalReference: string;
};

const defaultManualDraft = (): ManualDraft => ({
    scope: 'LINE',
    method: 'PERCENT',
    value: '',
    reasonCode: '',
    reasonNote: '',
    approverEmployeeId: '',
    approverEmployeeName: '',
    approvalReference: '',
});

const defaultOverrideDraft = (): OverrideDraft => ({
    finalPrice: '',
    reasonCode: '',
    reasonNote: '',
    approverEmployeeId: '',
    approverEmployeeName: '',
    approvalReference: '',
});

const mapDefinitionToPricing = (definition: any): DiscountDefinition => ({
    ...definition,
    status: definition.status as DiscountDefinition['status'],
    type: definition.type as DiscountDefinition['type'],
    method: definition.method as DiscountDefinition['method'],
    scope: definition.scope as DiscountDefinition['scope'],
    stackMode: definition.stackMode as DiscountDefinition['stackMode'],
});

const mapPolicyToPricing = (policy: any): EmployeeDiscountPolicy => ({
    ...policy,
});

const normalizePromoCode = (code: string) => code.trim().toUpperCase();

const resolveApprovalForManualDiscount = (
    draft: ManualDraft,
    policy: EmployeeDiscountPolicy | undefined,
    baseAmount: number
) => {
    if (!policy) return false;
    const value = Number(draft.value);
    if (draft.scope === 'ORDER' && policy.requireApprovalForOrderDiscount) return true;
    if (draft.method === 'PERCENT') {
        const limit = policy.maxManualPercentDiscount == null ? 100 : policy.maxManualPercentDiscount;
        return value > limit;
    }

    const limit = policy.maxManualAmountDiscount == null ? Number.MAX_SAFE_INTEGER : policy.maxManualAmountDiscount;
    return value > limit || value > baseAmount;
};

const resolveApprovalForOverride = (
    draft: OverrideDraft,
    policy: EmployeeDiscountPolicy | undefined,
    baseUnitPrice: number
) => {
    if (!policy) return false;
    if (policy.requireApprovalForAnyPriceOverride) return true;

    const finalPrice = Number(draft.finalPrice);
    const delta = Math.max(0, baseUnitPrice - finalPrice);
    const amountLimit =
        policy.maxPriceOverrideAmount == null ? Number.MAX_SAFE_INTEGER : policy.maxPriceOverrideAmount;

    if (delta > amountLimit) return true;

    const pctBelowBase = baseUnitPrice <= 0 ? 0 : (delta / baseUnitPrice) * 100;
    const percentLimit =
        policy.maxPriceOverridePercentBelowBase == null
            ? 100
            : policy.maxPriceOverridePercentBelowBase;

    return pctBelowBase > percentLimit;
};

const buildApprovalContext = (
    approverEmployeeId: string,
    approverEmployeeName: string,
    approvalReference: string
) => {
    if (!approverEmployeeId.trim()) {
        return undefined;
    }

    return {
        approverEmployeeId: approverEmployeeId.trim(),
        approverEmployeeName: approverEmployeeName.trim() || undefined,
        approvalReference: approvalReference.trim() || undefined,
    };
};

export function Cart({ mode, onSubmit, searchRef, products }: CartProps) {
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const localStyles = useStyles(tokens);
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const employee = useSelector(selectLoginEmployee);
    const storeInfo = useSelector(selectStore);
    const stationInfo = useSelector(selectStation);
    const [receivePayment, setReceivePayment] = useState<boolean>(false);
    const [discountsLoading, setDiscountsLoading] = useState(false);
    const [discountError, setDiscountError] = useState<string>();
    const [actionsExpanded, setActionsExpanded] = useState(false);
    const [orderSummaryVisible, setOrderSummaryVisible] = useState(false);
    const [promoVisible, setPromoVisible] = useState(false);
    const [manualVisible, setManualVisible] = useState(false);
    const [overrideVisible, setOverrideVisible] = useState(false);
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [manualDraft, setManualDraft] = useState<ManualDraft>(defaultManualDraft);
    const [overrideDraft, setOverrideDraft] = useState<OverrideDraft>(defaultOverrideDraft);
    const ready = isCartReady(cart);
    const ebtEligibleTotal = getEbtEligibleTotal(cart);
    const invalidItemCount = cart.items.filter((item) => item.quantity === 0).length;
    const orderLevelAdjustments = cart.appliedDiscountSummary?.orderLevelAdjustments || [];
    const pricingWarnings = cart.appliedDiscountSummary?.warnings || [];
    const orderSummary = useMemo(() => buildOrderSummary(cart), [cart]);
    const selectedItem = cart.selected;
    const selectedLineSummary = cart.appliedDiscountSummary?.lineSummaries.find(
        (summary) => summary.lineId === selectedItem?.identifier
    );
    const selectedLineTotal =
        selectedLineSummary?.lineSubtotalBeforeOrderDiscount ??
        (selectedItem ? selectedItem.quantity * selectedItem.product.price : 0);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    const hasDiscountSummary =
        cart.footer.discount > 0 || cart.promoCodes.length > 0 || pricingWarnings.length > 0;
    const canUsePromoCodes = cart.policy?.canUsePromoCodes !== false;
    const canApplyOrderDiscount = cart.policy?.canApplyOrderDiscount !== false;
    const canOverridePrice = cart.policy?.canOverridePrice !== false;
    const selectedLineHasManualAdjustment =
        !!selectedItem?.identifier &&
        (cart.manualDiscounts.some(
            (discount) => discount.scope === 'LINE' && discount.lineId === selectedItem.identifier
        ) ||
            cart.priceOverrides.some((override) => override.lineId === selectedItem.identifier));
    const hasOrderManualAdjustment = cart.manualDiscounts.some(
        (discount) => discount.scope === 'ORDER'
    );

    useEffect(() => {
        let active = true;

        const loadDiscountContext = async () => {
            if (!employee?.id) {
                dispatch(cartActions.setDefinitions([]));
                dispatch(cartActions.setPolicy(undefined));
                return;
            }

            setDiscountsLoading(true);
            setDiscountError(undefined);

            try {
                const [definitions, policies] = await Promise.all([
                    DiscountService.listDefinitions(),
                    DiscountService.listPolicies(),
                ]);

                if (!active) {
                    return;
                }

                dispatch(
                    cartActions.setDefinitions(definitions.map((definition) => mapDefinitionToPricing(definition)))
                );

                const matchedPolicy = DiscountService.resolvePolicyForEmployee(employee, policies);
                dispatch(
                    cartActions.setPolicy(
                        matchedPolicy ? mapPolicyToPricing(matchedPolicy) : undefined
                    )
                );
            } catch (error) {
                if (!active) {
                    return;
                }

                dispatch(cartActions.setDefinitions([]));
                dispatch(cartActions.setPolicy(undefined));
                setDiscountError(
                    error instanceof Error ? error.message : 'Unable to load discount rules.'
                );
            } finally {
                if (active) {
                    setDiscountsLoading(false);
                }
            }
        };

        loadDiscountContext();

        return () => {
            active = false;
        };
    }, [dispatch, employee]);

    useEffect(() => {
        let active = true;

        const syncPricingContext = async () => {
            let stationId: string | undefined;

            try {
                const deviceId = DeviceInfo.getUniqueIdSync();
                const stations = await DataStore.query(Station, (station) =>
                    station.deviceId.eq(deviceId)
                );
                stationId = stations[0]?.id;
            } catch {
                stationId = undefined;
            }

            if (!active) {
                return;
            }

            dispatch(
                cartActions.setPricingContext({
                    timezone: storeInfo?.timezone,
                    storeId: storeInfo?.id,
                    stationId,
                })
            );
        };

        syncPricingContext();

        return () => {
            active = false;
        };
    }, [dispatch, stationInfo?.stationNumber, storeInfo?.id, storeInfo?.timezone]);

    const onSelect = (item: CartItem) => {
        if (cart.selected?.identifier === item.identifier) {
            dispatch(cartActions.select(undefined));
            return;
        }

        dispatch(cartActions.select(item));
    };

    const onRemove = (item: CartItem) => {
        dispatch(cartActions.removeProduct(item));
    };

    const onIncrement = (item: CartItem) => {
        dispatch(
            cartActions.upsert({
                identifier: item.identifier,
                product: item.product,
                quantity: item.quantity + 1,
            })
        );
    };

    const onDecrement = (item: CartItem) => {
        if (item.quantity <= 1) {
            dispatch(cartActions.removeProduct(item));
            return;
        }

        dispatch(
            cartActions.upsert({
                identifier: item.identifier,
                product: item.product,
                quantity: item.quantity - 1,
            })
        );
    };

    const paymentEntered = (payments: ICartPayment[]) => {
        setReceivePayment(false);
        onSubmit(cart, payments);
    };

    const submitOrder = () => {
        if (!validateProductInventory()) return;

        if (mode === 'payment') {
            setReceivePayment(true);
        } else {
            setOrderSummaryVisible(true);
        }
    };

    const confirmPrintOrder = () => {
        setOrderSummaryVisible(false);
        onSubmit(cart);
    };

    const validateProductInventory = () => {
        const notAvailableProducts = getUnavailableProductMessages(
            cart.items,
            products
        );

        if (notAvailableProducts.length) {
            Alert.alert(
                t('CART_InventoryNotAvailableTitle', 'Product(s) not available'),
                `${t(
                    'CART_InventoryNotAvailableMessage',
                    'You do not have enough of these product(s) in inventory:'
                )}\n${notAvailableProducts}`
            );
        }

        return !notAvailableProducts.length;
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            searchRef.current?.focus();
        }, 25);

        return () => clearTimeout(timer);
    }, [cart, searchRef]);

    const disabledActionReason = useMemo(() => {
        if (!selectedItem) return 'Select a cart line for line-level adjustments.';
        if (selectedItem.quantity === 0) return 'Resolve the item weight before applying pricing actions.';
        return null;
    }, [selectedItem]);

    const openPromoDialog = () => {
        if (!canUsePromoCodes) {
            Alert.alert('Promo codes are not allowed for this employee.');
            return;
        }
        setPromoVisible(true);
    };

    const submitPromoCode = () => {
        const code = normalizePromoCode(promoCodeInput);
        if (!code) {
            Alert.alert('Promo code is required.');
            return;
        }

        dispatch(cartActions.addPromoCode({ code }));
        setPromoCodeInput('');
        setPromoVisible(false);
    };

    const openManualDiscountDialog = () => {
        if (manualDraft.scope === 'ORDER' && !canApplyOrderDiscount) {
            Alert.alert('Order discounts are not allowed for this employee.');
            return;
        }
        setManualVisible(true);
    };

    const submitManualDiscount = () => {
        const value = Number(manualDraft.value);
        if (!Number.isFinite(value) || value <= 0) {
            Alert.alert('Enter a valid discount value.');
            return;
        }

        if (manualDraft.scope === 'LINE' && !selectedItem?.identifier) {
            Alert.alert('Select a cart line before applying a line discount.');
            return;
        }

        if (manualDraft.scope === 'ORDER' && !canApplyOrderDiscount) {
            Alert.alert('Order discounts are not allowed for this employee.');
            return;
        }

        const baseAmount =
            manualDraft.scope === 'ORDER'
                ? cart.footer.subtotal || cart.footer.baseSubtotal
                : selectedLineTotal;
        const approvalRequired = resolveApprovalForManualDiscount(
            manualDraft,
            cart.policy,
            baseAmount
        );
        const approval = buildApprovalContext(
            manualDraft.approverEmployeeId,
            manualDraft.approverEmployeeName,
            manualDraft.approvalReference
        );

        if (approvalRequired && !approval?.approverEmployeeId) {
            Alert.alert(
                'Approval required',
                'This discount requires approval. Enter the approver details to continue.'
            );
            return;
        }

        const request: ManualDiscountRequest = {
            kind: 'MANUAL_DISCOUNT',
            scope: manualDraft.scope,
            method: manualDraft.method,
            value,
            lineId: manualDraft.scope === 'LINE' ? selectedItem?.identifier : undefined,
            name:
                manualDraft.scope === 'ORDER'
                    ? 'Manual order discount'
                    : 'Manual line discount',
            reasonCode: manualDraft.reasonCode.trim() || undefined,
            reasonNote: manualDraft.reasonNote.trim() || undefined,
            approval,
        };

        dispatch(cartActions.applyManualDiscount(request));
        setManualDraft(defaultManualDraft());
        setManualVisible(false);
    };

    const openOverrideDialog = () => {
        if (!selectedItem?.identifier) {
            Alert.alert('Select a cart line before overriding price.');
            return;
        }
        if (!canOverridePrice) {
            Alert.alert('Price overrides are not allowed for this employee.');
            return;
        }
        setOverrideVisible(true);
    };

    const submitOverride = () => {
        if (!selectedItem?.identifier) {
            Alert.alert('Select a cart line before overriding price.');
            return;
        }

        const finalPrice = Number(overrideDraft.finalPrice);
        if (!Number.isFinite(finalPrice) || finalPrice < 0) {
            Alert.alert('Enter a valid final unit price.');
            return;
        }

        const approvalRequired = resolveApprovalForOverride(
            overrideDraft,
            cart.policy,
            selectedItem.product.price
        );
        const approval = buildApprovalContext(
            overrideDraft.approverEmployeeId,
            overrideDraft.approverEmployeeName,
            overrideDraft.approvalReference
        );

        if (approvalRequired && !approval?.approverEmployeeId) {
            Alert.alert(
                'Approval required',
                'This override requires approval. Enter the approver details to continue.'
            );
            return;
        }

        const request: PriceOverrideRequest = {
            kind: 'PRICE_OVERRIDE',
            lineId: selectedItem.identifier,
            finalPrice,
            name: 'Price override',
            reasonCode: overrideDraft.reasonCode.trim() || undefined,
            reasonNote: overrideDraft.reasonNote.trim() || undefined,
            approval,
        };

        dispatch(cartActions.applyPriceOverride(request));
        setOverrideDraft(defaultOverrideDraft());
        setOverrideVisible(false);
    };

    if (!cart.items.length) {
        return (
            <View style={localStyles.emptyWrap}>
                <Image
                    source={EmptyCart}
                    style={localStyles.emptyImage}
                    resizeMode="contain"
                />
                <Text style={localStyles.emptyText}>
                    {t('CART_Empty', 'Cart is empty')}
                </Text>
                <Text style={localStyles.emptyHint}>
                    Scan items or search the catalog to start a sale.
                </Text>
            </View>
        );
    }

    return (
        <View style={localStyles.root}>
            <View style={localStyles.linesWrap}>
                <ScrollView contentContainerStyle={localStyles.linesContent}>
                    {cart.items.map((i) => {
                        const lineSummary = cart.appliedDiscountSummary?.lineSummaries.find(
                            (summary) => summary.lineId === i.identifier
                        );

                        return (
                            <CartLine
                                key={i.identifier || i.product.id}
                                item={i}
                                selected={cart.selected?.identifier === i.identifier}
                                appliedDiscounts={lineSummary?.discounts}
                                lineDiscountTotal={
                                    (lineSummary?.lineDiscountTotal || 0) +
                                    (lineSummary?.allocatedOrderDiscountTotal || 0)
                                }
                                lineTotal={lineSummary?.lineTotalBeforeTax}
                                onSelect={onSelect}
                                onRemove={onRemove}
                                onIncrement={onIncrement}
                                onDecrement={onDecrement}
                            />
                        );
                    })}
                </ScrollView>
            </View>

            <View style={localStyles.actionsWrap}>
                <UICard style={localStyles.discountActionCard}>
                    <View style={localStyles.discountActionHeader}>
                        <View style={localStyles.discountHeaderContent}>
                            <Text style={localStyles.discountActionTitle}>Discounts</Text>
                            <Text style={localStyles.discountActionHint}>
                                {selectedItem
                                    ? `Selected: ${selectedItem.product.name}`
                                    : 'Select a line for line-level actions.'}
                            </Text>
                        </View>
                        <View style={localStyles.discountHeaderMeta}>
                            {discountsLoading ? (
                                <Text style={localStyles.discountActionStatus}>Loading rules…</Text>
                            ) : null}
                            <Pressable
                                style={localStyles.expandButton}
                                onPress={() => setActionsExpanded((current) => !current)}
                            >
                                <Text style={localStyles.expandButtonText}>
                                    {actionsExpanded ? 'Hide actions' : 'Show actions'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                    {hasDiscountSummary ? (
                        <>
                            <Text style={localStyles.summaryValue}>
                                Saved ${cart.footer.savingsTotal.toFixed(2)}
                            </Text>
                            {orderLevelAdjustments.map((adjustment) => (
                                <Text
                                    key={adjustment.discountApplicationId}
                                    style={localStyles.summaryLine}
                                >
                                    {adjustment.name}: -${adjustment.discountAmount.toFixed(2)}
                                </Text>
                            ))}
                            {cart.promoCodes.length ? (
                                <View style={localStyles.promoChipRow}>
                                    {cart.promoCodes.map((promo) => (
                                        <Pressable
                                            key={promo.code}
                                            style={localStyles.promoChip}
                                            onPress={() =>
                                                dispatch(cartActions.removePromoCode(promo.code))
                                            }
                                        >
                                            <Text style={localStyles.promoChipText}>{promo.code} ×</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </>
                    ) : null}
                    {discountError ? (
                        <Text style={localStyles.warningInline}>{discountError}</Text>
                    ) : null}
                    {disabledActionReason ? (
                        <Text style={localStyles.actionMutedCopy}>{disabledActionReason}</Text>
                    ) : null}
                    {pricingWarnings.map((warning) => (
                        <Text key={warning} style={localStyles.warningInline}>
                            {warning}
                        </Text>
                    ))}
                    {actionsExpanded ? (
                        <>
                            <View style={localStyles.discountActionRow}>
                                <Pressable
                                    style={localStyles.discountActionButton}
                                    onPress={openPromoDialog}
                                    disabled={discountsLoading}
                                >
                                    <Text style={localStyles.discountActionButtonText}>Promo</Text>
                                </Pressable>
                                <Pressable
                                    style={localStyles.discountActionButton}
                                    onPress={openManualDiscountDialog}
                                    disabled={discountsLoading}
                                >
                                    <Text style={localStyles.discountActionButtonText}>Manual</Text>
                                </Pressable>
                                <Pressable
                                    style={localStyles.discountActionButton}
                                    onPress={openOverrideDialog}
                                    disabled={discountsLoading}
                                >
                                    <Text style={localStyles.discountActionButtonText}>Override</Text>
                                </Pressable>
                            </View>
                            {selectedLineHasManualAdjustment || hasOrderManualAdjustment ? (
                                <View style={localStyles.discountActionRow}>
                                    {selectedLineHasManualAdjustment ? (
                                        <Pressable
                                            style={localStyles.discountSecondaryButton}
                                            onPress={() =>
                                                dispatch(
                                                    cartActions.removePricingAdjustment({
                                                        lineId: selectedItem?.identifier,
                                                    })
                                                )
                                            }
                                        >
                                            <Text style={localStyles.discountSecondaryButtonText}>
                                                Clear line pricing
                                            </Text>
                                        </Pressable>
                                    ) : null}
                                    {hasOrderManualAdjustment ? (
                                        <Pressable
                                            style={localStyles.discountSecondaryButton}
                                            onPress={() =>
                                                dispatch(
                                                    cartActions.removePricingAdjustment({
                                                        scope: 'ORDER',
                                                    })
                                                )
                                            }
                                        >
                                            <Text style={localStyles.discountSecondaryButtonText}>
                                                Clear order discount
                                            </Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            ) : null}
                        </>
                    ) : null}
                </UICard>

                {!ready && invalidItemCount > 0 ? (
                    <Text style={localStyles.warningText}>
                        {invalidItemCount === 1
                            ? '1 item needs weight before checkout'
                            : `${invalidItemCount} items need weight before checkout`}
                    </Text>
                ) : null}
                <Button
                    testID="cart-pay-order-button"
                    title={
                        !ready && invalidItemCount > 0
                            ? 'Resolve cart items to continue'
                            : mode === 'order'
                              ? `${t('CART_PrintOrder', 'Print Order')}  •  $${cart.footer.total.toFixed(2)}`
                              : `${t('CART_ReceivePayment', 'Receive Payment')}  •  $${cart.footer.total.toFixed(2)}`
                    }
                    icon={{
                        name:
                            !ready && invalidItemCount > 0
                                ? 'alert-circle-outline'
                                : mode === 'order'
                                  ? 'printer'
                                  : 'credit-card-check-outline',
                        type: 'material-community',
                        color: ready ? '#ffffff' : tokens.colors.textSecondary,
                    }}
                    type="solid"
                    disabled={!ready}
                    onPress={submitOrder}
                    buttonStyle={localStyles.primaryButton}
                    disabledStyle={localStyles.primaryButtonDisabled}
                    titleStyle={[
                        localStyles.primaryButtonTitle,
                        !ready && localStyles.primaryButtonTitleDisabled,
                    ]}
                    containerStyle={localStyles.primaryButtonContainer}
                />
            </View>

            <Dialog
                isVisible={orderSummaryVisible}
                onBackdropPress={() => setOrderSummaryVisible(false)}
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                overlayStyle={[styles.overlay, localStyles.summaryDialog]}
            >
                <View style={localStyles.summarySurface}>
                    <Text style={localStyles.dialogTitle}>Order summary</Text>
                    <Text style={localStyles.dialogHint}>
                        Review the order with the customer before printing.
                    </Text>
                    <ScrollView
                        style={localStyles.summaryDialogScroll}
                        contentContainerStyle={localStyles.summaryDialogContent}
                    >
                        <View style={localStyles.summarySection}>
                            <Text style={localStyles.summarySectionTitle}>Items</Text>
                            {orderSummary.lines.map((line) => (
                                <View key={line.id} style={localStyles.summaryItemRow}>
                                    <View style={localStyles.summaryItemMain}>
                                        <Text style={localStyles.summaryItemName}>{line.name}</Text>
                                        <Text style={localStyles.summaryItemMeta}>
                                            ${line.unitPrice.toFixed(2)} x {line.quantity} {line.unitLabel}
                                        </Text>
                                        {line.discounts.map((discount) => (
                                            <Text
                                                key={discount.discountApplicationId}
                                                style={localStyles.summaryDiscountLine}
                                            >
                                                {discount.name}: -${discount.discountAmount.toFixed(2)}
                                            </Text>
                                        ))}
                                    </View>
                                    <View style={localStyles.summaryItemTotals}>
                                        {line.savings > 0 ? (
                                            <Text style={localStyles.summaryItemOriginal}>
                                                ${line.originalTotal.toFixed(2)}
                                            </Text>
                                        ) : null}
                                        <Text style={localStyles.summaryItemFinal}>
                                            ${line.finalTotal.toFixed(2)}
                                        </Text>
                                        {line.savings > 0 ? (
                                            <Text style={localStyles.summaryItemSavings}>
                                                Saved ${line.savings.toFixed(2)}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            ))}
                        </View>

                        {(orderSummary.discountTotal > 0 ||
                            orderSummary.promoCodes.length > 0 ||
                            orderSummary.warnings.length > 0) && (
                            <View style={localStyles.summarySection}>
                                <Text style={localStyles.summarySectionTitle}>Savings</Text>
                                {orderSummary.discountTotal > 0 ? (
                                    <Text style={localStyles.summaryValue}>
                                        Saved ${orderSummary.savingsTotal.toFixed(2)}
                                    </Text>
                                ) : null}
                                {orderLevelAdjustments.map((adjustment) => (
                                    <Text
                                        key={adjustment.discountApplicationId}
                                        style={localStyles.summaryLine}
                                    >
                                        {adjustment.name}: -${adjustment.discountAmount.toFixed(2)}
                                    </Text>
                                ))}
                                {orderSummary.promoCodes.length ? (
                                    <View style={localStyles.promoChipRow}>
                                        {orderSummary.promoCodes.map((code) => (
                                            <View key={code} style={localStyles.promoChipStatic}>
                                                <Text style={localStyles.promoChipText}>{code}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : null}
                                {orderSummary.warnings.map((warning) => (
                                    <Text key={warning} style={localStyles.warningInline}>
                                        {warning}
                                    </Text>
                                ))}
                            </View>
                        )}

                        <View style={localStyles.summarySection}>
                            <Text style={localStyles.summarySectionTitle}>Totals</Text>
                            <View style={localStyles.totalRow}>
                                <Text style={localStyles.totalLabel}>Subtotal</Text>
                                <Text style={localStyles.totalValue}>
                                    ${orderSummary.subtotal.toFixed(2)}
                                </Text>
                            </View>
                            {orderSummary.discountTotal > 0 ? (
                                <View style={localStyles.totalRow}>
                                    <Text style={localStyles.totalLabel}>Discounts</Text>
                                    <Text style={localStyles.totalValueSuccess}>
                                        -${orderSummary.discountTotal.toFixed(2)}
                                    </Text>
                                </View>
                            ) : null}
                            <View style={localStyles.totalRow}>
                                <Text style={localStyles.totalLabel}>Tax</Text>
                                <Text style={localStyles.totalValue}>
                                    ${orderSummary.tax.toFixed(2)}
                                </Text>
                            </View>
                            {orderSummary.ebtEligibleTotal > 0 ? (
                                <View style={localStyles.totalRow}>
                                    <Text style={localStyles.totalLabel}>EBT eligible</Text>
                                    <Text style={localStyles.totalValue}>
                                        ${orderSummary.ebtEligibleTotal.toFixed(2)}
                                    </Text>
                                </View>
                            ) : null}
                            <View style={[localStyles.totalRow, localStyles.totalRowStrong]}>
                                <Text style={localStyles.totalLabelStrong}>Total</Text>
                                <Text style={localStyles.totalValueStrong}>
                                    ${orderSummary.total.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                    <View style={localStyles.summaryFooter}>
                        <View style={localStyles.summaryFooterTotalBlock}>
                            <Text style={localStyles.summaryFooterLabel}>Total</Text>
                            <Text style={localStyles.summaryFooterValue}>
                                ${orderSummary.total.toFixed(2)}
                            </Text>
                        </View>
                        <View style={localStyles.summaryFooterActions}>
                            <Button
                                type="clear"
                                title="Back to cart"
                                onPress={() => setOrderSummaryVisible(false)}
                                buttonStyle={localStyles.summarySecondaryButton}
                                titleStyle={localStyles.summarySecondaryButtonTitle}
                            />
                            <Button
                                testID="order-summary-print-button"
                                onPress={confirmPrintOrder}
                                icon={{
                                    name: 'printer',
                                    type: 'material-community',
                                    color: '#ffffff',
                                    size: 22,
                                }}
                                buttonStyle={localStyles.summaryPrimaryIconButton}
                            />
                        </View>
                    </View>
                </View>
            </Dialog>

            <Dialog
                isVisible={receivePayment}
                onBackdropPress={() => setReceivePayment(false)}
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                overlayStyle={[styles.overlay, { width: 450 }]}
            >
                <CartPayment
                    total={cart.footer.total}
                    ebtEligibleTotal={ebtEligibleTotal}
                    canReceiveChecks={employee?.roles.includes(Role.Checks) || false}
                    onPaymentEntered={paymentEntered}
                />
            </Dialog>

            <Dialog
                isVisible={promoVisible}
                onBackdropPress={() => setPromoVisible(false)}
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                overlayStyle={[styles.overlay, localStyles.compactDialog]}
            >
                <Text style={localStyles.dialogTitle}>Apply promo code</Text>
                <Text style={localStyles.dialogHint}>Promo codes recalculate the cart immediately.</Text>
                <TextInput
                    value={promoCodeInput}
                    onChangeText={setPromoCodeInput}
                    placeholder="SPRING10"
                    placeholderTextColor={tokens.colors.textSecondary}
                    autoCapitalize="characters"
                    style={localStyles.dialogInput}
                />
                <View style={localStyles.dialogActionRow}>
                    <Button type="clear" title="Cancel" onPress={() => setPromoVisible(false)} />
                    <Button title="Apply" onPress={submitPromoCode} />
                </View>
            </Dialog>

            <Dialog
                isVisible={manualVisible}
                onBackdropPress={() => setManualVisible(false)}
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                overlayStyle={[styles.overlay, localStyles.mediumDialog]}
            >
                <Text style={localStyles.dialogTitle}>Manual discount</Text>
                <Text style={localStyles.dialogHint}>
                    Apply a one-off line or order discount using the current employee policy.
                </Text>
                <View style={localStyles.segmentRow}>
                    {(['LINE', 'ORDER'] as const).map((scope) => (
                        <Pressable
                            key={scope}
                            style={[
                                localStyles.segmentButton,
                                manualDraft.scope === scope && localStyles.segmentButtonActive,
                            ]}
                            onPress={() =>
                                setManualDraft((current) => ({
                                    ...current,
                                    scope,
                                }))
                            }
                        >
                            <Text
                                style={[
                                    localStyles.segmentButtonText,
                                    manualDraft.scope === scope &&
                                        localStyles.segmentButtonTextActive,
                                ]}
                            >
                                {scope}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                <View style={localStyles.segmentRow}>
                    {(['PERCENT', 'AMOUNT'] as const).map((method) => (
                        <Pressable
                            key={method}
                            style={[
                                localStyles.segmentButton,
                                manualDraft.method === method && localStyles.segmentButtonActive,
                            ]}
                            onPress={() =>
                                setManualDraft((current) => ({
                                    ...current,
                                    method,
                                }))
                            }
                        >
                            <Text
                                style={[
                                    localStyles.segmentButtonText,
                                    manualDraft.method === method &&
                                        localStyles.segmentButtonTextActive,
                                ]}
                            >
                                {method === 'PERCENT' ? 'Percent' : 'Amount'}
                            </Text>
                        </Pressable>
                    ))}
                </View>
                <TextInput
                    value={manualDraft.value}
                    onChangeText={(value) =>
                        setManualDraft((current) => ({
                            ...current,
                            value,
                        }))
                    }
                    placeholder={manualDraft.method === 'PERCENT' ? '10' : '5.00'}
                    placeholderTextColor={tokens.colors.textSecondary}
                    keyboardType="decimal-pad"
                    style={localStyles.dialogInput}
                />
                <TextInput
                    value={manualDraft.reasonCode}
                    onChangeText={(reasonCode) =>
                        setManualDraft((current) => ({
                            ...current,
                            reasonCode,
                        }))
                    }
                    placeholder="Reason code (optional)"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <TextInput
                    value={manualDraft.reasonNote}
                    onChangeText={(reasonNote) =>
                        setManualDraft((current) => ({
                            ...current,
                            reasonNote,
                        }))
                    }
                    placeholder="Reason note (optional)"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <Text style={localStyles.dialogSubheading}>Approval details if required</Text>
                <TextInput
                    value={manualDraft.approverEmployeeId}
                    onChangeText={(approverEmployeeId) =>
                        setManualDraft((current) => ({
                            ...current,
                            approverEmployeeId,
                        }))
                    }
                    placeholder="Approver employee ID"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <TextInput
                    value={manualDraft.approverEmployeeName}
                    onChangeText={(approverEmployeeName) =>
                        setManualDraft((current) => ({
                            ...current,
                            approverEmployeeName,
                        }))
                    }
                    placeholder="Approver name"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <TextInput
                    value={manualDraft.approvalReference}
                    onChangeText={(approvalReference) =>
                        setManualDraft((current) => ({
                            ...current,
                            approvalReference,
                        }))
                    }
                    placeholder="Approval reference"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <View style={localStyles.dialogActionRow}>
                    <Button type="clear" title="Cancel" onPress={() => setManualVisible(false)} />
                    <Button title="Apply" onPress={submitManualDiscount} />
                </View>
            </Dialog>

            <Dialog
                isVisible={overrideVisible}
                onBackdropPress={() => setOverrideVisible(false)}
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                overlayStyle={[styles.overlay, localStyles.mediumDialog]}
            >
                <Text style={localStyles.dialogTitle}>Price override</Text>
                <Text style={localStyles.dialogHint}>
                    Override the selected line price while respecting policy limits.
                </Text>
                <TextInput
                    value={overrideDraft.finalPrice}
                    onChangeText={(finalPrice) =>
                        setOverrideDraft((current) => ({
                            ...current,
                            finalPrice,
                        }))
                    }
                    placeholder={selectedItem ? selectedItem.product.price.toFixed(2) : '0.00'}
                    placeholderTextColor={tokens.colors.textSecondary}
                    keyboardType="decimal-pad"
                    style={localStyles.dialogInput}
                />
                <TextInput
                    value={overrideDraft.reasonCode}
                    onChangeText={(reasonCode) =>
                        setOverrideDraft((current) => ({
                            ...current,
                            reasonCode,
                        }))
                    }
                    placeholder="Reason code (optional)"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <TextInput
                    value={overrideDraft.reasonNote}
                    onChangeText={(reasonNote) =>
                        setOverrideDraft((current) => ({
                            ...current,
                            reasonNote,
                        }))
                    }
                    placeholder="Reason note (optional)"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <Text style={localStyles.dialogSubheading}>Approval details if required</Text>
                <TextInput
                    value={overrideDraft.approverEmployeeId}
                    onChangeText={(approverEmployeeId) =>
                        setOverrideDraft((current) => ({
                            ...current,
                            approverEmployeeId,
                        }))
                    }
                    placeholder="Approver employee ID"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <TextInput
                    value={overrideDraft.approverEmployeeName}
                    onChangeText={(approverEmployeeName) =>
                        setOverrideDraft((current) => ({
                            ...current,
                            approverEmployeeName,
                        }))
                    }
                    placeholder="Approver name"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <TextInput
                    value={overrideDraft.approvalReference}
                    onChangeText={(approvalReference) =>
                        setOverrideDraft((current) => ({
                            ...current,
                            approvalReference,
                        }))
                    }
                    placeholder="Approval reference"
                    placeholderTextColor={tokens.colors.textSecondary}
                    style={localStyles.dialogInput}
                />
                <View style={localStyles.dialogActionRow}>
                    <Button type="clear" title="Cancel" onPress={() => setOverrideVisible(false)} />
                    <Button title="Apply" onPress={submitOverride} />
                </View>
            </Dialog>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        root: {
            flex: 1,
            flexDirection: 'column',
        },
        emptyWrap: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: tokens.spacing.lg,
        },
        emptyImage: {
            width: 220,
            height: 220,
            marginBottom: tokens.spacing.sm,
        },
        emptyText: {
            color: tokens.colors.textPrimary,
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
        },
        emptyHint: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'center',
            marginTop: tokens.spacing.xs,
            maxWidth: 260,
        },
        linesWrap: {
            flex: 1,
        },
        linesContent: {
            paddingBottom: tokens.spacing.xs,
        },
        actionsWrap: {
            marginTop: tokens.spacing.sm,
        },
        discountActionCard: {
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            padding: tokens.spacing.sm,
            marginBottom: tokens.spacing.sm,
        },
        discountActionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: tokens.spacing.sm,
        },
        discountHeaderContent: {
            flex: 1,
        },
        discountHeaderMeta: {
            alignItems: 'flex-end',
            gap: tokens.spacing.xs,
        },
        discountActionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '800',
        },
        discountActionHint: {
            color: tokens.colors.textSecondary,
            fontSize: 12,
            marginTop: 4,
        },
        discountActionStatus: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '700',
        },
        expandButton: {
            borderRadius: 999,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}55`,
            backgroundColor: `${tokens.colors.accent}12`,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: 6,
        },
        expandButtonText: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '800',
        },
        actionMutedCopy: {
            color: tokens.colors.textSecondary,
            fontSize: 12,
            marginTop: tokens.spacing.xs,
        },
        discountActionRow: {
            flexDirection: 'row',
            gap: tokens.spacing.xs,
            marginTop: tokens.spacing.sm,
        },
        discountActionButton: {
            flex: 1,
            borderRadius: tokens.radii.sm,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}66`,
            backgroundColor: `${tokens.colors.accent}14`,
            paddingVertical: tokens.spacing.xs,
            alignItems: 'center',
        },
        discountActionButtonText: {
            color: tokens.colors.accent,
            fontSize: 13,
            fontWeight: '800',
        },
        discountSecondaryButton: {
            flex: 1,
            borderRadius: tokens.radii.sm,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surface,
            paddingVertical: tokens.spacing.xs,
            alignItems: 'center',
        },
        discountSecondaryButtonText: {
            color: tokens.colors.textSecondary,
            fontSize: 12,
            fontWeight: '700',
        },
        summaryValue: {
            color: tokens.colors.success,
            fontSize: 18,
            fontWeight: '800',
            marginTop: tokens.spacing.sm,
            marginBottom: tokens.spacing.xs,
        },
        summaryLine: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            lineHeight: 18,
        },
        promoChipRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.spacing.xs,
            marginTop: tokens.spacing.xs,
        },
        promoChip: {
            borderRadius: 999,
            paddingHorizontal: tokens.spacing.xs,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}55`,
            backgroundColor: `${tokens.colors.accent}14`,
        },
        promoChipText: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '700',
        },
        promoChipStatic: {
            borderRadius: 999,
            paddingHorizontal: tokens.spacing.xs,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}55`,
            backgroundColor: `${tokens.colors.accent}14`,
        },
        warningText: {
            color: tokens.colors.danger,
            fontSize: 13,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: tokens.spacing.xs,
        },
        warningInline: {
            color: tokens.colors.warning,
            fontSize: 12,
            fontWeight: '700',
            marginTop: tokens.spacing.xs,
        },
        primaryButtonContainer: {
            borderRadius: tokens.radii.md,
            overflow: 'hidden',
        },
        primaryButton: {
            minHeight: 60,
            borderRadius: tokens.radii.md,
            backgroundColor: tokens.colors.accent,
        },
        primaryButtonDisabled: {
            minHeight: 60,
            borderRadius: tokens.radii.md,
            backgroundColor: tokens.colors.surfaceMuted,
            borderWidth: 1,
            borderColor: tokens.colors.border,
        },
        primaryButtonTitle: {
            fontSize: 20,
            fontWeight: '800',
        },
        primaryButtonTitleDisabled: {
            color: tokens.colors.textSecondary,
        },
        compactDialog: {
            width: 360,
        },
        summaryDialog: {
            width: 560,
            maxHeight: 560,
            backgroundColor: 'transparent',
            padding: 0,
            borderWidth: 0,
            shadowColor: 'transparent',
        },
        summarySurface: {
            borderRadius: 28,
            borderWidth: 1,
            borderColor: '#C7D0DB33',
            backgroundColor: '#080B10',
            padding: tokens.spacing.xl,
            overflow: 'hidden',
        },
        summaryDialogScroll: {
            maxHeight: 420,
        },
        summaryDialogContent: {
            paddingBottom: tokens.spacing.md,
        },
        mediumDialog: {
            width: 520,
        },
        dialogTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.4,
            marginBottom: 6,
        },
        dialogHint: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
            lineHeight: 20,
            marginBottom: tokens.spacing.md,
        },
        dialogInput: {
            borderWidth: 1,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radii.sm,
            backgroundColor: tokens.colors.surfaceMuted,
            color: tokens.colors.textPrimary,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.sm,
            marginBottom: tokens.spacing.xs,
        },
        dialogActionRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: tokens.spacing.sm,
            marginTop: tokens.spacing.sm,
        },
        summarySection: {
            marginTop: tokens.spacing.md,
            paddingTop: tokens.spacing.md,
            borderTopWidth: 1,
            borderTopColor: `${tokens.colors.border}88`,
        },
        summarySectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '800',
            letterSpacing: 0.2,
            marginBottom: tokens.spacing.sm,
        },
        summaryItemRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            backgroundColor: `${tokens.colors.accent}0D`,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.md,
            marginBottom: tokens.spacing.sm,
        },
        summaryItemMain: {
            flex: 1,
        },
        summaryItemName: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '800',
        },
        summaryItemMeta: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            marginTop: 6,
        },
        summaryDiscountLine: {
            color: tokens.colors.accent,
            fontSize: 13,
            fontWeight: '700',
            marginTop: 6,
        },
        summaryItemTotals: {
            alignItems: 'flex-end',
            minWidth: 110,
        },
        summaryItemOriginal: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            textDecorationLine: 'line-through',
        },
        summaryItemFinal: {
            color: tokens.colors.textPrimary,
            fontSize: 22,
            fontWeight: '800',
        },
        summaryItemSavings: {
            color: tokens.colors.success,
            fontSize: 13,
            fontWeight: '800',
            marginTop: 4,
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: tokens.spacing.sm,
        },
        totalRowStrong: {
            marginTop: tokens.spacing.sm,
            paddingTop: tokens.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: tokens.colors.border,
        },
        totalLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
            fontWeight: '600',
        },
        totalLabelStrong: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '800',
        },
        totalValue: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '700',
        },
        totalValueSuccess: {
            color: tokens.colors.success,
            fontSize: 15,
            fontWeight: '800',
        },
        totalValueStrong: {
            color: tokens.colors.textPrimary,
            fontSize: 20,
            fontWeight: '800',
        },
        summarySecondaryButton: {
            minHeight: 48,
            borderRadius: 18,
            paddingHorizontal: tokens.spacing.md,
        },
        summarySecondaryButtonTitle: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
            fontWeight: '800',
        },
        summaryFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: tokens.spacing.md,
            marginTop: tokens.spacing.lg,
            paddingTop: tokens.spacing.md,
            borderTopWidth: 1,
            borderTopColor: `${tokens.colors.border}88`,
        },
        summaryFooterTotalBlock: {
            flex: 1,
        },
        summaryFooterLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        summaryFooterValue: {
            color: tokens.colors.textPrimary,
            fontSize: 32,
            fontWeight: '800',
            marginTop: 4,
        },
        summaryFooterActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing.sm,
        },
        summaryPrimaryIconButton: {
            minWidth: 64,
            minHeight: 56,
            borderRadius: 20,
            backgroundColor: tokens.colors.accent,
            paddingHorizontal: tokens.spacing.md,
        },
        segmentRow: {
            flexDirection: 'row',
            gap: tokens.spacing.xs,
            marginBottom: tokens.spacing.sm,
        },
        segmentButton: {
            flex: 1,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radii.sm,
            paddingVertical: tokens.spacing.xs,
            alignItems: 'center',
            backgroundColor: tokens.colors.surfaceMuted,
        },
        segmentButtonActive: {
            borderColor: `${tokens.colors.accent}88`,
            backgroundColor: `${tokens.colors.accent}18`,
        },
        segmentButtonText: {
            color: tokens.colors.textSecondary,
            fontWeight: '700',
        },
        segmentButtonTextActive: {
            color: tokens.colors.accent,
        },
        dialogSubheading: {
            color: tokens.colors.textPrimary,
            fontSize: 13,
            fontWeight: '800',
            marginTop: tokens.spacing.xs,
            marginBottom: tokens.spacing.xs,
        },
    });

export default Cart;
