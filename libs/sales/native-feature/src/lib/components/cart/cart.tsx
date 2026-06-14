import {
    cartActions,
    CartItem,
    CartPayment as ICartPayment,
    CartState,
    selectCart,
} from '@pos/sales/data-access';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button } from '@rneui/themed';
import React, { useEffect, useMemo, useState } from 'react';

import { View, Alert, Text, Image, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { useSharedStyles } from '@pos/theme/native';

import CartLine from '../cart-line/cart-line';
import CartPaymentDialog from '../cart-payment/cart-payment-dialog';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { Role } from '@pos/auth/data-access';
import { ProductEntity } from '@pos/products/data-access';
import { selectStore } from '@pos/store-info/data-access';
import { getGlobalSettings, selectStation } from '@pos/settings/data-access';
import { translateWithFallback } from '@pos/shared/utils';
import {
    buildDiscountBreakdown,
    buildOrderSummary,
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
import { CartDiscountActions } from './cart-discount-actions';
import { CartManualDiscountDialog } from './cart-manual-discount-dialog';
import { CartOrderSummaryDialog } from './cart-order-summary-dialog';
import { CartPriceOverrideDialog } from './cart-price-override-dialog';
import { CartPromoDialog } from './cart-promo-dialog';
import { createCartStyles } from './cart.styles';
import {
    defaultManualDraft,
    defaultOverrideDraft,
    ManualDraft,
    OverrideDraft,
} from './cart.types';
import {
    baseAmountForDisplay,
    getAvailableManualDefinitions,
} from './cart-discount.helpers';
import { isE2EEnabled } from '@pos/shared/utils';

const EmptyCart = require('../../../assets/images/empty-cart.png');

export type CartMode = 'order' | 'payment';

export interface CartProps {
    mode: CartMode;
    preferPayFromSalesScreen?: boolean;
    onSubmit: (
        cart: CartState,
        payments?: ICartPayment[],
        options?: {
            intent?: 'save_open_order' | 'receive_payment';
        },
    ) => void;
    products: ProductEntity[];
    onInteractionComplete: () => void;
}

const mapDefinitionToPricing = (definition: any): DiscountDefinition => ({
    ...definition,
    status: definition.status as DiscountDefinition['status'],
    type: definition.type as DiscountDefinition['type'],
    method: definition.method as DiscountDefinition['method'],
    scope: definition.scope as DiscountDefinition['scope'],
    stackMode: definition.stackMode as DiscountDefinition['stackMode'],
});

const normalizePromoCode = (code: string) => code.trim().toUpperCase();

const isDefinitionEnabledForPricing = (definition: DiscountDefinition) =>
    definition.status === 'ACTIVE';

const DISCOUNT_CONTROLS_ENABLED = true;
const ROLE_BASED_DISCOUNT_POLICY: EmployeeDiscountPolicy = {
    canApplyOrderDiscount: true,
    canOverridePrice: true,
    canUsePromoCodes: true,
    active: true,
};
const RESTRICTED_DISCOUNT_POLICY: EmployeeDiscountPolicy = {
    canApplyOrderDiscount: false,
    canOverridePrice: false,
    canUsePromoCodes: false,
    active: true,
};

export function Cart({
    mode,
    preferPayFromSalesScreen = false,
    onSubmit,
    products,
    onInteractionComplete,
}: CartProps) {
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const localStyles = createCartStyles(tokens);
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const employee = useSelector(selectLoginEmployee);
    const storeInfo = useSelector(selectStore);
    const stationInfo = useSelector(selectStation);
    const globalSettings = useSelector(getGlobalSettings);
    const [receivePayment, setReceivePayment] = useState<boolean>(false);
    const [discountsLoading, setDiscountsLoading] = useState(false);
    const [discountError, setDiscountError] = useState<string>();
    const [actionsExpanded, setActionsExpanded] = useState(false);
    const [discountSectionCollapsed, setDiscountSectionCollapsed] =
        useState(false);
    const [orderSummaryVisible, setOrderSummaryVisible] = useState(false);
    const [promoVisible, setPromoVisible] = useState(false);
    const [manualVisible, setManualVisible] = useState(false);
    const [overrideVisible, setOverrideVisible] = useState(false);
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [manualDraft, setManualDraft] =
        useState<ManualDraft>(defaultManualDraft);
    const [overrideDraft, setOverrideDraft] =
        useState<OverrideDraft>(defaultOverrideDraft);
    const ready = isCartReady(cart);
    const invalidItemCount = cart.items.filter(
        (item) => item.quantity === 0,
    ).length;
    const pricingWarnings = cart.appliedDiscountSummary?.warnings || [];
    const discountBreakdown = useMemo(
        () => buildDiscountBreakdown(cart.appliedDiscountSummary),
        [cart.appliedDiscountSummary],
    );
    const orderSummary = useMemo(() => buildOrderSummary(cart), [cart]);
    const selectedItem = cart.selected;
    const selectedLineSummary = cart.appliedDiscountSummary?.lineSummaries.find(
        (summary) => summary.lineId === selectedItem?.identifier,
    );
    const selectedLineTotal =
        selectedLineSummary?.lineSubtotalBeforeOrderDiscount ??
        (selectedItem ? selectedItem.quantity * selectedItem.product.price : 0);
    const manualDraftValue =
        manualDraft.method === 'PERCENT'
            ? manualDraft.percentValue
            : manualDraft.amountValue;
    const approvalTargetName = selectedItem?.product.name || 'this order';
    const t = translateWithFallback;

    const hasDiscountSummary =
        cart.footer.discount > 0 ||
        cart.promoCodes.length > 0 ||
        pricingWarnings.length > 0;
    const hasDiscountAccess =
        (employee?.roles || []).includes(Role.Discounts) ||
        (employee?.roles || []).includes(Role.Admin);
    const canUsePromoCodes = hasDiscountAccess;
    const canApplyOrderDiscount = hasDiscountAccess;
    const canOverridePrice = hasDiscountAccess;
    const canViewDiscountControls =
        DISCOUNT_CONTROLS_ENABLED && hasDiscountAccess;
    const payFromSalesScreen = mode === 'order' && preferPayFromSalesScreen;
    const creditCardSurchargePercent =
        globalSettings?.creditCardSurchargePercent ?? 0;
    const selectedLineHasManualAdjustment =
        !!selectedItem?.identifier &&
        (cart.manualDiscounts.some(
            (discount) =>
                discount.scope === 'LINE' &&
                discount.lineId === selectedItem.identifier,
        ) ||
            cart.priceOverrides.some(
                (override) => override.lineId === selectedItem.identifier,
            ));
    const hasOrderManualAdjustment = cart.manualDiscounts.some(
        (discount) => discount.scope === 'ORDER',
    );
    const availableManualDefinitions = useMemo(() => {
        const currentTimestamp = new Date().toISOString();
        const orderSubtotal =
            cart.footer.baseSubtotal || cart.footer.subtotal || 0;
        const selectedLineSubtotal = selectedLineTotal || 0;

        return getAvailableManualDefinitions({
            definitions: cart.definitions || [],
            draftScope: manualDraft.scope,
            orderSubtotal,
            selectedLineSubtotal,
            selectedItem,
            selectedLineHasManualAdjustment,
            selectedLineDiscountCount:
                selectedLineSummary?.discounts?.length || 0,
            timestamp: currentTimestamp,
            timezone: storeInfo?.timezone,
            stationId: stationInfo?.stationNumber,
            canApplyOrderDiscount,
        });
    }, [
        canApplyOrderDiscount,
        cart.definitions,
        cart.footer.baseSubtotal,
        cart.footer.subtotal,
        manualDraft.scope,
        selectedItem,
        selectedLineHasManualAdjustment,
        selectedLineSummary?.discounts,
        stationInfo?.stationNumber,
        storeInfo?.timezone,
    ]);

    useEffect(() => {
        dispatch(
            cartActions.setPolicy(
                hasDiscountAccess
                    ? ROLE_BASED_DISCOUNT_POLICY
                    : RESTRICTED_DISCOUNT_POLICY,
            ),
        );
    }, [dispatch, hasDiscountAccess]);

    useEffect(() => {
        let active = true;
        let receivedLiveDefinitions = false;

        const applyDefinitions = (definitions: any[]) => {
            dispatch(
                cartActions.setDefinitions(
                    definitions
                        .map((definition) => mapDefinitionToPricing(definition))
                        .filter(isDefinitionEnabledForPricing),
                ),
            );
        };

        const loadDiscountContext = async () => {
            if (!employee?.id) {
                dispatch(cartActions.setDefinitions([]));
                setDiscountsLoading(false);
                setDiscountError(undefined);
                return;
            }

            setDiscountsLoading(true);
            setDiscountError(undefined);

            try {
                const definitions = await DiscountService.listDefinitions();

                if (!active || receivedLiveDefinitions) {
                    return;
                }

                applyDefinitions(definitions);
            } catch (error) {
                if (!active) {
                    return;
                }

                dispatch(cartActions.setDefinitions([]));
                setDiscountError(
                    error instanceof Error
                        ? error.message
                        : 'Unable to load discount rules.',
                );
            } finally {
                if (active) {
                    setDiscountsLoading(false);
                }
            }
        };

        const definitionSubscription = employee?.id
            ? DiscountService.subscribeDefinitionChanges((definitions) => {
                  if (!active) {
                      return;
                  }

                  receivedLiveDefinitions = true;
                  setDiscountError(undefined);
                  applyDefinitions(definitions);
                  setDiscountsLoading(false);
              })
            : undefined;

        if (!employee?.id) {
            loadDiscountContext();
        } else if (!receivedLiveDefinitions) {
            loadDiscountContext();
        } else {
            setDiscountsLoading(false);
        }

        return () => {
            active = false;
            if (typeof definitionSubscription === 'function') {
                definitionSubscription();
            } else {
                definitionSubscription?.unsubscribe?.();
            }
        };
    }, [dispatch, employee?.id]);

    useEffect(() => {
        dispatch(
            cartActions.setPricingContext({
                timezone: storeInfo?.timezone,
                storeId: storeInfo?.id,
                // Discount definitions are authored against the configured station number.
                stationId: stationInfo?.stationNumber,
                taxRate: (globalSettings?.taxValue ?? 0) / 100,
            }),
        );
    }, [
        dispatch,
        globalSettings?.taxValue,
        stationInfo?.stationNumber,
        storeInfo?.id,
        storeInfo?.timezone,
    ]);

    const onSelect = (item: CartItem) => {
        if (cart.selected?.identifier === item.identifier) {
            dispatch(cartActions.select(undefined));
            onInteractionComplete();
            return;
        }

        dispatch(cartActions.select(item));
        onInteractionComplete();
    };

    const onOpenDetails = (item: CartItem) => {
        dispatch(
            cartActions.setActiveProduct({
                identifier: item.identifier,
                product: item.product,
                quantity: item.quantity,
            }),
        );
    };

    const onRemove = (item: CartItem) => {
        dispatch(cartActions.removeProduct(item));
        onInteractionComplete();
    };

    const onIncrement = (item: CartItem) => {
        dispatch(
            cartActions.upsert({
                identifier: item.identifier,
                product: item.product,
                quantity: item.quantity + 1,
            }),
        );
        onInteractionComplete();
    };

    const onDecrement = (item: CartItem) => {
        if (item.quantity <= 1) {
            dispatch(cartActions.removeProduct(item));
            onInteractionComplete();
            return;
        }

        dispatch(
            cartActions.upsert({
                identifier: item.identifier,
                product: item.product,
                quantity: item.quantity - 1,
            }),
        );
        onInteractionComplete();
    };

    const paymentEntered = (payments: ICartPayment[]) => {
        setReceivePayment(false);
        onSubmit(cart, payments, { intent: 'receive_payment' });
        onInteractionComplete();
    };

    const submitOrder = () => {
        if (!validateProductInventory()) return;

        if (mode === 'payment' || payFromSalesScreen) {
            setReceivePayment(true);
        } else {
            setOrderSummaryVisible(true);
        }
    };

    const confirmPrintOrder = () => {
        setOrderSummaryVisible(false);
        onSubmit(cart, undefined, { intent: 'save_open_order' });
        onInteractionComplete();
    };

    const e2eCheckoutAction =
        mode === 'order' && !payFromSalesScreen
            ? confirmPrintOrder
            : submitOrder;
    const e2eCheckoutLabel =
        mode === 'order' && !payFromSalesScreen
            ? t('E2E_PrintOrder', 'E2E Print Order')
            : t('E2E_Checkout', 'E2E Checkout');

    const validateProductInventory = () => {
        const notAvailableProducts = getUnavailableProductMessages(
            cart.items,
            products,
        );

        if (notAvailableProducts.length) {
            Alert.alert(
                t(
                    'CART_InventoryNotAvailableTitle',
                    'Product(s) not available',
                ),
                `${t(
                    'CART_InventoryNotAvailableMessage',
                    'You do not have enough of these product(s) in inventory:',
                )}\n${notAvailableProducts}`,
            );
        }

        return !notAvailableProducts.length;
    };

    const disabledActionReason = useMemo(() => {
        if (!selectedItem)
            return t(
                'CART_SelectLineForAdjustments',
                'Select a cart line for line-level adjustments.',
            );
        if (selectedItem.quantity === 0)
            return t(
                'CART_ResolveWeightBeforePricing',
                'Resolve the item weight before applying pricing actions.',
            );
        return null;
    }, [selectedItem, t]);

    const openPromoDialog = () => {
        if (!canUsePromoCodes) {
            Alert.alert(
                t(
                    'CART_PromoCodesNotAllowed',
                    'Promo codes are not allowed for this employee.',
                ),
            );
            return;
        }
        setPromoVisible(true);
    };

    const submitPromoCode = () => {
        const code = normalizePromoCode(promoCodeInput);
        if (!code) {
            Alert.alert(t('CART_PromoCodeRequired', 'Promo code is required.'));
            return;
        }

        dispatch(cartActions.addPromoCode({ code }));
        setPromoCodeInput('');
        setPromoVisible(false);
        onInteractionComplete();
    };

    const openManualDiscountDialog = () => {
        if (manualDraft.scope === 'ORDER' && !canApplyOrderDiscount) {
            Alert.alert(
                t(
                    'CART_OrderDiscountsNotAllowed',
                    'Order discounts are not allowed for this employee.',
                ),
            );
            return;
        }
        setManualVisible(true);
    };

    const selectManualDefinition = (definitionId: string) => {
        const definition = availableManualDefinitions.find(
            (item) => item.id === definitionId,
        );
        if (!definition) {
            return;
        }

        setManualDraft((current) => ({
            ...current,
            scope: definition.scope,
            method: definition.method,
            selectedDefinitionId: definition.id,
            percentValue:
                definition.method === 'PERCENT'
                    ? String(definition.value)
                    : current.percentValue,
            amountValue:
                definition.method === 'AMOUNT'
                    ? String(definition.value)
                    : current.amountValue,
        }));
    };

    const submitManualDiscount = async () => {
        const value = Number(manualDraftValue);
        if (!Number.isFinite(value) || value <= 0) {
            Alert.alert(
                t(
                    'CART_EnterValidDiscountValue',
                    'Enter a valid discount value.',
                ),
            );
            return;
        }

        if (manualDraft.scope === 'LINE' && !selectedItem?.identifier) {
            Alert.alert(
                t(
                    'CART_SelectLineBeforeDiscount',
                    'Select a cart line before applying a line discount.',
                ),
            );
            return;
        }

        if (manualDraft.scope === 'ORDER' && !canApplyOrderDiscount) {
            Alert.alert(
                t(
                    'CART_OrderDiscountsNotAllowed',
                    'Order discounts are not allowed for this employee.',
                ),
            );
            return;
        }

        const request: ManualDiscountRequest = {
            kind: 'MANUAL_DISCOUNT',
            scope: manualDraft.scope,
            method: manualDraft.method,
            value,
            definitionId: manualDraft.selectedDefinitionId,
            lineId:
                manualDraft.scope === 'LINE'
                    ? selectedItem?.identifier
                    : undefined,
            name:
                availableManualDefinitions.find(
                    (definition) =>
                        definition.id === manualDraft.selectedDefinitionId,
                )?.name ||
                (manualDraft.scope === 'ORDER'
                    ? t('CART_ManualOrderDiscount', 'Manual order discount')
                    : t('CART_ManualLineDiscount', 'Manual line discount')),
            reasonCode: manualDraft.reasonCode.trim() || undefined,
            reasonNote: manualDraft.reasonNote.trim() || undefined,
        };

        dispatch(cartActions.applyManualDiscount(request));
        setManualDraft(defaultManualDraft());
        setManualVisible(false);
        onInteractionComplete();
    };

    const openOverrideDialog = () => {
        if (!selectedItem?.identifier) {
            Alert.alert(
                t(
                    'CART_SelectLineBeforePriceOverride',
                    'Select a cart line before overriding price.',
                ),
            );
            return;
        }
        if (!canOverridePrice) {
            Alert.alert(
                t(
                    'CART_PriceOverridesNotAllowed',
                    'Price overrides are not allowed for this employee.',
                ),
            );
            return;
        }
        setOverrideVisible(true);
    };

    const submitOverride = async () => {
        if (!selectedItem?.identifier) {
            Alert.alert(
                t(
                    'CART_SelectLineBeforePriceOverride',
                    'Select a cart line before overriding price.',
                ),
            );
            return;
        }

        const finalPrice = Number(overrideDraft.finalPrice);
        if (!Number.isFinite(finalPrice) || finalPrice < 0) {
            Alert.alert(
                t(
                    'CART_EnterValidFinalUnitPrice',
                    'Enter a valid final unit price.',
                ),
            );
            return;
        }

        const request: PriceOverrideRequest = {
            kind: 'PRICE_OVERRIDE',
            lineId: selectedItem.identifier,
            finalPrice,
            name: t('SALES_PriceOverride', 'Price override'),
            reasonCode: overrideDraft.reasonCode.trim() || undefined,
            reasonNote: overrideDraft.reasonNote.trim() || undefined,
        };

        dispatch(cartActions.applyPriceOverride(request));
        setOverrideDraft(defaultOverrideDraft());
        setOverrideVisible(false);
        onInteractionComplete();
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
                    {t(
                        'CART_EmptyHint',
                        'Scan items or search the catalog to start a sale.',
                    )}
                </Text>
            </View>
        );
    }

    return (
        <View style={localStyles.root}>
            <View style={localStyles.linesWrap}>
                <ScrollView
                    testID="cart-lines-scroll"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={localStyles.linesContent}
                >
                    {cart.items.map((i) => {
                        const lineSummary =
                            cart.appliedDiscountSummary?.lineSummaries.find(
                                (summary) => summary.lineId === i.identifier,
                            );

                        return (
                            <CartLine
                                key={i.identifier || i.product.id}
                                item={i}
                                selected={
                                    cart.selected?.identifier === i.identifier
                                }
                                appliedDiscounts={lineSummary?.discounts}
                                lineDiscountTotal={
                                    (lineSummary?.lineDiscountTotal || 0) +
                                    (lineSummary?.allocatedOrderDiscountTotal ||
                                        0)
                                }
                                lineTotal={lineSummary?.lineTotalBeforeTax}
                                onOpenDetails={onOpenDetails}
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
                {typeof __DEV__ !== 'undefined' && __DEV__ && isE2EEnabled() ? (
                    <View style={localStyles.e2eShortcutContainer}>
                        <Pressable
                            testID="cart-pay-order-e2e-shortcut"
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={e2eCheckoutLabel}
                            disabled={!ready}
                            onPress={e2eCheckoutAction}
                            style={[
                                localStyles.e2eShortcutButton,
                                !ready && localStyles.primaryButtonDisabled,
                            ]}
                        >
                            <Text style={localStyles.e2eShortcutTitle}>
                                {e2eCheckoutLabel}
                            </Text>
                        </Pressable>
                    </View>
                ) : null}
                {canViewDiscountControls && (
                    <CartDiscountActions
                        styles={localStyles}
                        selectedItemName={selectedItem?.product.name}
                        discountsLoading={discountsLoading}
                        actionsExpanded={actionsExpanded}
                        sectionCollapsed={discountSectionCollapsed}
                        hasDiscountSummary={hasDiscountSummary}
                        savingsTotal={cart.footer.savingsTotal}
                        discountBreakdown={discountBreakdown}
                        promoCodes={cart.promoCodes}
                        pricingWarnings={pricingWarnings}
                        discountError={discountError}
                        disabledActionReason={disabledActionReason}
                        selectedLineHasManualAdjustment={
                            selectedLineHasManualAdjustment
                        }
                        hasOrderManualAdjustment={hasOrderManualAdjustment}
                        onToggleSectionCollapsed={() => {
                            setDiscountSectionCollapsed((current) => !current);
                            onInteractionComplete();
                        }}
                        onToggleExpanded={() => {
                            setActionsExpanded((current) => !current);
                            onInteractionComplete();
                        }}
                        onOpenPromo={openPromoDialog}
                        onOpenManual={openManualDiscountDialog}
                        onOpenOverride={openOverrideDialog}
                        onRemovePromo={(code) => {
                            dispatch(cartActions.removePromoCode(code));
                            onInteractionComplete();
                        }}
                        onClearLinePricing={() => {
                            dispatch(
                                cartActions.removePricingAdjustment({
                                    lineId: selectedItem?.identifier,
                                }),
                            );
                            onInteractionComplete();
                        }}
                        onClearOrderDiscount={() => {
                            dispatch(
                                cartActions.removePricingAdjustment({
                                    scope: 'ORDER',
                                }),
                            );
                            onInteractionComplete();
                        }}
                    />
                )}

                {!ready && invalidItemCount > 0 ? (
                    <Text style={localStyles.warningText}>
                        {invalidItemCount === 1
                            ? t(
                                  'CART_OneItemNeedsWeight',
                                  '1 item needs weight before checkout',
                              )
                            : t(
                                  'CART_MultipleItemsNeedWeight',
                                  '{{count}} items need weight before checkout',
                                  { count: invalidItemCount },
                              )}
                    </Text>
                ) : null}
                {payFromSalesScreen ? (
                    <Button
                        testID="cart-save-open-order-button"
                        title={t('CART_SaveOpenOrder', 'Save Open Order')}
                        type="outline"
                        disabled={!ready}
                        onPress={() => {
                            if (!validateProductInventory()) return;
                            setOrderSummaryVisible(true);
                        }}
                        buttonStyle={localStyles.checkoutSecondaryButton}
                        titleStyle={localStyles.checkoutSecondaryButtonTitle}
                        containerStyle={
                            localStyles.checkoutSecondaryButtonContainer
                        }
                    />
                ) : null}
                <Button
                    testID="cart-pay-order-button"
                    title={
                        !ready && invalidItemCount > 0
                            ? t(
                                  'CART_ResolveItemsToContinue',
                                  'Resolve cart items to continue',
                              )
                            : payFromSalesScreen || mode === 'payment'
                              ? `${t('CART_ReceivePayment', 'Receive Payment')}  •  $${cart.footer.total.toFixed(2)}`
                              : mode === 'order'
                                ? `${t('CART_PrintOrder', 'Print Order')}  •  $${cart.footer.total.toFixed(2)}`
                                : `${t('CART_ReceivePayment', 'Receive Payment')}  •  $${cart.footer.total.toFixed(2)}`
                    }
                    icon={{
                        name:
                            !ready && invalidItemCount > 0
                                ? 'alert-circle-outline'
                                : payFromSalesScreen || mode === 'payment'
                                  ? 'credit-card-check-outline'
                                  : 'printer',
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

            <CartOrderSummaryDialog
                visible={orderSummaryVisible}
                styles={localStyles}
                overlayStyle={[styles.overlay, localStyles.summaryDialog]}
                orderSummary={orderSummary}
                discountBreakdown={discountBreakdown}
                onClose={() => {
                    setOrderSummaryVisible(false);
                    onInteractionComplete();
                }}
                onConfirm={confirmPrintOrder}
            />

            <CartPaymentDialog
                visible={receivePayment}
                cart={cart}
                canReceiveChecks={
                    employee?.roles?.includes(Role.Checks) || false
                }
                creditCardSurchargePercent={creditCardSurchargePercent}
                onClose={() => {
                    setReceivePayment(false);
                    onInteractionComplete();
                }}
                onPaymentEntered={paymentEntered}
            />

            {canViewDiscountControls && (
                <>
                    <CartPromoDialog
                        visible={promoVisible}
                        styles={localStyles}
                        overlayStyle={[
                            styles.overlay,
                            localStyles.compactDialog,
                        ]}
                        promoCodeInput={promoCodeInput}
                        placeholderTextColor={tokens.colors.textSecondary}
                        onChangePromoCode={setPromoCodeInput}
                        onClose={() => {
                            setPromoVisible(false);
                            onInteractionComplete();
                        }}
                        onSubmit={submitPromoCode}
                    />

                    <CartManualDiscountDialog
                        visible={manualVisible}
                        styles={localStyles}
                        overlayStyle={[
                            styles.overlay,
                            localStyles.mediumDialog,
                        ]}
                        draft={manualDraft}
                        availableDefinitions={availableManualDefinitions.map(
                            (definition) => ({
                                id: definition.id,
                                name: definition.name,
                                method: definition.method,
                                value: definition.value,
                                scope: definition.scope,
                            }),
                        )}
                        approvalTargetName={approvalTargetName}
                        baseAmount={baseAmountForDisplay(
                            manualDraft.scope,
                            cart,
                            selectedLineTotal,
                        )}
                        placeholderTextColor={tokens.colors.textSecondary}
                        onClose={() => {
                            setManualVisible(false);
                            onInteractionComplete();
                        }}
                        onSubmit={submitManualDiscount}
                        onSelectDefinition={selectManualDefinition}
                        onChange={(updater) =>
                            setManualDraft((current) => updater(current))
                        }
                    />

                    <CartPriceOverrideDialog
                        visible={overrideVisible}
                        styles={localStyles}
                        overlayStyle={[
                            styles.overlay,
                            localStyles.mediumDialog,
                        ]}
                        draft={overrideDraft}
                        selectedItemName={selectedItem?.product.name}
                        basePrice={selectedItem?.product.price || 0}
                        placeholderTextColor={tokens.colors.textSecondary}
                        onClose={() => {
                            setOverrideVisible(false);
                            onInteractionComplete();
                        }}
                        onSubmit={submitOverride}
                        onChange={(updater) => setOverrideDraft(updater)}
                    />
                </>
            )}
        </View>
    );
}

export default Cart;
