import {
    cartActions,
    CartItem,
    CartPayment as ICartPayment,
    CartState,
    selectCart,
} from '@pos/sales/data-access';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, Dialog } from '@rneui/themed';
import React, { useEffect, useMemo, useState } from 'react';
import i18next from 'i18next';

import { View, Alert, Text, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { useSharedStyles } from '@pos/theme/native';

import CartLine from '../cart-line/cart-line';
import EmptyCart from '../../../../../../../apps/mobile-ui/assets/illustrations/empty-cart-1600.png';
import CartPayment from '../cart-payment/cart-payment';
import { EmployeeService, selectLoginEmployee } from '@pos/employees/data-access';
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
import { DiscountService, EmployeeDiscountPolicyEntity } from '@pos/discounts/data-access';
import {
    DiscountDefinition,
    EmployeeDiscountPolicy,
    ManualDiscountRequest,
    PriceOverrideRequest,
} from '@pos/discounts/domain';
import { DataStore } from '@pos/shared/amplify';
import { Station } from '@pos/shared/models';
import DeviceInfo from 'react-native-device-info';
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

export type CartMode = 'order' | 'payment';

export interface CartProps {
    mode: CartMode;
    onSubmit: (cart: CartState, payments?: ICartPayment[]) => void;
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
    const value = Number(
        draft.method === 'PERCENT' ? draft.percentValue : draft.amountValue
    );
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

const formatEmployeeName = (employee: {
    firstName?: string | null;
    lastName?: string | null;
    code?: string | null;
}) => {
    const displayName = [employee.firstName, employee.lastName]
        .filter((value): value is string => !!value && value.trim().length > 0)
        .join(' ')
        .trim();

    return displayName || employee.code?.trim() || 'Approver';
};

const DISCOUNT_CONTROLS_ENABLED = true;

const baseAmountForDisplay = (
    scope: ManualDraft['scope'],
    cart: CartState,
    selectedLineTotal: number
) =>
    scope === 'ORDER'
        ? cart.footer.subtotal || cart.footer.baseSubtotal
        : selectedLineTotal;

export function Cart({
    mode,
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
    const [availablePolicies, setAvailablePolicies] = useState<EmployeeDiscountPolicyEntity[]>([]);
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
    const manualDraftValue =
        manualDraft.method === 'PERCENT' ? manualDraft.percentValue : manualDraft.amountValue;
    const approvalTargetName = selectedItem?.product.name || 'this order';
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    const hasDiscountSummary =
        cart.footer.discount > 0 || cart.promoCodes.length > 0 || pricingWarnings.length > 0;
    const canUsePromoCodes = cart.policy?.canUsePromoCodes !== false;
    const canApplyOrderDiscount = cart.policy?.canApplyOrderDiscount !== false;
    const canOverridePrice = cart.policy?.canOverridePrice !== false;
    const canViewDiscountControls =
        DISCOUNT_CONTROLS_ENABLED && (employee?.roles || []).includes(Role.Discounts);
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

                setAvailablePolicies(policies);
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
                setAvailablePolicies([]);
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
            })
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
            })
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
            })
        );
        onInteractionComplete();
    };

    const paymentEntered = (payments: ICartPayment[]) => {
        setReceivePayment(false);
        onSubmit(cart, payments);
        onInteractionComplete();
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
        onInteractionComplete();
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
        onInteractionComplete();
    };

    const resolveApprovalByPin = async (
        approvalPin: string,
        approvalType: 'discount' | 'override'
    ) => {
        const normalizedPin = approvalPin.trim();

        if (!normalizedPin) {
            return undefined;
        }

        const approver = await EmployeeService.getEmployee(normalizedPin);
        if (!approver?.id) {
            throw new Error('No active employee matches that approval PIN.');
        }

        const approverPolicy = DiscountService.resolvePolicyForEmployee(
            approver,
            availablePolicies
        );
        const hasApprovalAccess =
            approvalType === 'discount'
                ? approverPolicy?.canApproveDiscounts === true
                : approverPolicy?.canApprovePriceOverrides === true;

        if (!hasApprovalAccess) {
            throw new Error(
                approvalType === 'discount'
                    ? 'This employee cannot approve discounts.'
                    : 'This employee cannot approve price overrides.'
            );
        }

        return {
            approverEmployeeId: approver.id,
            approverEmployeeName: formatEmployeeName(approver),
            approvalReference: undefined,
        };
    };

    const openManualDiscountDialog = () => {
        if (manualDraft.scope === 'ORDER' && !canApplyOrderDiscount) {
            Alert.alert('Order discounts are not allowed for this employee.');
            return;
        }
        setManualVisible(true);
    };

    const submitManualDiscount = async () => {
        const value = Number(manualDraftValue);
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
        let approval;

        try {
            approval = await resolveApprovalByPin(manualDraft.approvalPin, 'discount');
        } catch (error) {
            Alert.alert(
                'Approval failed',
                error instanceof Error ? error.message : 'Unable to validate approval PIN.'
            );
            return;
        }

        if (approvalRequired && !approval?.approverEmployeeId) {
            Alert.alert('Approval required', 'Enter an approval PIN to continue.');
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
        onInteractionComplete();
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

    const submitOverride = async () => {
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
        let approval;

        try {
            approval = await resolveApprovalByPin(overrideDraft.approvalPin, 'override');
        } catch (error) {
            Alert.alert(
                'Approval failed',
                error instanceof Error ? error.message : 'Unable to validate approval PIN.'
            );
            return;
        }

        if (approvalRequired && !approval?.approverEmployeeId) {
            Alert.alert('Approval required', 'Enter an approval PIN to continue.');
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
                {canViewDiscountControls && (
                    <CartDiscountActions
                        styles={localStyles}
                        selectedItemName={selectedItem?.product.name}
                        discountsLoading={discountsLoading}
                        actionsExpanded={actionsExpanded}
                        hasDiscountSummary={hasDiscountSummary}
                        savingsTotal={cart.footer.savingsTotal}
                        orderLevelAdjustments={orderLevelAdjustments}
                        promoCodes={cart.promoCodes}
                        pricingWarnings={pricingWarnings}
                        discountError={discountError}
                        disabledActionReason={disabledActionReason}
                        selectedLineHasManualAdjustment={selectedLineHasManualAdjustment}
                        hasOrderManualAdjustment={hasOrderManualAdjustment}
                        onToggleExpanded={() => setActionsExpanded((current) => !current)}
                        onOpenPromo={openPromoDialog}
                        onOpenManual={openManualDiscountDialog}
                        onOpenOverride={openOverrideDialog}
                        onRemovePromo={(code) => dispatch(cartActions.removePromoCode(code))}
                        onClearLinePricing={() =>
                            dispatch(
                                cartActions.removePricingAdjustment({
                                    lineId: selectedItem?.identifier,
                                })
                            )
                        }
                        onClearOrderDiscount={() =>
                            dispatch(
                                cartActions.removePricingAdjustment({
                                    scope: 'ORDER',
                                })
                            )
                        }
                    />
                )}

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

            <CartOrderSummaryDialog
                visible={orderSummaryVisible}
                styles={localStyles}
                overlayStyle={[styles.overlay, localStyles.summaryDialog]}
                orderSummary={orderSummary}
                orderLevelAdjustments={orderLevelAdjustments}
                onClose={() => {
                    setOrderSummaryVisible(false);
                    onInteractionComplete();
                }}
                onConfirm={confirmPrintOrder}
            />

            <Dialog
                isVisible={receivePayment}
                onBackdropPress={() => {
                    setReceivePayment(false);
                    onInteractionComplete();
                }}
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

            {canViewDiscountControls && (
                <>
                    <CartPromoDialog
                        visible={promoVisible}
                        styles={localStyles}
                        overlayStyle={[styles.overlay, localStyles.compactDialog]}
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
                        overlayStyle={[styles.overlay, localStyles.mediumDialog]}
                        draft={manualDraft}
                        approvalTargetName={approvalTargetName}
                        baseAmount={baseAmountForDisplay(manualDraft.scope, cart, selectedLineTotal)}
                        placeholderTextColor={tokens.colors.textSecondary}
                        onClose={() => {
                            setManualVisible(false);
                            onInteractionComplete();
                        }}
                        onSubmit={submitManualDiscount}
                        onChange={(updater) => setManualDraft(updater)}
                    />

                    <CartPriceOverrideDialog
                        visible={overrideVisible}
                        styles={localStyles}
                        overlayStyle={[styles.overlay, localStyles.mediumDialog]}
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
