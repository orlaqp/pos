import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import {
  UICard,
  UIActions,
  UIInput,
  UINumericInput,
  UIOverlaySelect,
  UIScreen,
  UISwitch,
} from '@pos/shared/ui-native';
import { PolicyFormValues, roleOptions } from './discounts.helpers';
import { DiscountsStyles } from './discounts.styles';

interface DiscountPolicyFieldsProps {
  form: UseFormReturn<PolicyFormValues>;
  styles: DiscountsStyles;
  editingId?: string;
  loading: boolean;
  busy: boolean;
  deleteBusy?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function DiscountPolicyFields({
  form,
  styles,
  editingId,
  loading,
  busy,
  deleteBusy = false,
  onSave,
  onCancel,
  onDelete,
}: DiscountPolicyFieldsProps) {
  return (
    <UIScreen>
      <FormProvider {...form}>
        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
              <UICard tone="muted" radius="lg" style={styles.headerCard}>
                <Text style={styles.headerTitle}>{editingId ? 'Edit Policy' : 'Policy Form'}</Text>
                <Text style={styles.headerSubtitle}>
                  Create or edit a role or employee policy for manual discounts, overrides, and approvals.
                </Text>
              </UICard>

              {loading ? (
                <UICard style={styles.emptyCard}>
                  <Text style={styles.headerTitle}>Loading policy…</Text>
                </UICard>
              ) : (
                <>
                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Target</Text>
                    <Text style={styles.fieldLabel}>Role</Text>
                    <UIOverlaySelect name="roleKey" title="Select role" list={roleOptions} selectedId={form.watch('roleKey')} />
                    <UIInput name="employeeId" label="Employee ID (optional)" placeholder="Optional employee override" />
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Thresholds</Text>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UINumericInput name="maxManualPercentDiscount" label="Max manual %" keyboardType="decimal-pad" allowDecimals placeholder="0" />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput name="maxManualAmountDiscount" label="Max manual amount" keyboardType="decimal-pad" allowDecimals placeholder="0" />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UINumericInput name="maxPriceOverrideAmount" label="Max override amount" keyboardType="decimal-pad" allowDecimals placeholder="0" />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput name="maxPriceOverridePercentBelowBase" label="Max override below base %" keyboardType="decimal-pad" allowDecimals placeholder="0" />
                      </View>
                    </View>
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Capabilities</Text>
                    {[
                      ['canApplyOrderDiscount', 'Can apply order discounts'],
                      ['canOverridePrice', 'Can override price'],
                      ['canApproveDiscounts', 'Can approve discounts'],
                      ['canApprovePriceOverrides', 'Can approve overrides'],
                      ['canUsePromoCodes', 'Can use promo codes'],
                      ['requireReasonForManualDiscounts', 'Require reason for manual discounts'],
                      ['requireReasonForOverrides', 'Require reason for overrides'],
                      ['requireApprovalForOrderDiscount', 'Require approval for order discounts'],
                      ['requireApprovalForAnyPriceOverride', 'Require approval for any override'],
                      ['allowExclusiveDiscountOverride', 'Allow exclusive discount override'],
                      ['active', 'Active'],
                    ].map(([name, label], index, items) => (
                      <View key={name} style={index === items.length - 1 ? styles.toggleRowNoBorder : styles.toggleRow}>
                        <Text style={styles.toggleLabel}>{label}</Text>
                        <UISwitch name={name} />
                      </View>
                    ))}
                  </UICard>
                </>
              )}
            </View>
          </ScrollView>
          <View style={styles.actionBar}>
            <UICard tone="muted" style={styles.actionBarCard}>
              <View style={styles.formActionRow}>
                {editingId && onDelete ? (
                  <Pressable
                    testID="policy-delete-button"
                    style={[styles.deleteButton, styles.inlineDeleteButton]}
                    disabled={busy || loading || deleteBusy}
                    onPress={onDelete}
                  >
                    <Text style={styles.deleteButtonText}>
                      {deleteBusy ? 'Deleting…' : 'Delete'}
                    </Text>
                  </Pressable>
                ) : (
                  <View />
                )}
                <UIActions
                  busy={busy || loading || deleteBusy}
                  submitTitle={editingId ? 'Update' : 'Save'}
                  submitAction={onSave}
                  cancelAction={onCancel}
                />
              </View>
            </UICard>
          </View>
        </View>
      </FormProvider>
    </UIScreen>
  );
}
