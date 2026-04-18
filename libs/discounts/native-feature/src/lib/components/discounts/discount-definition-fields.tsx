import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import {
  UICard,
  UIActions,
  UIDateTimeField,
  UIInput,
  UINumericInput,
  UIOverlayMultiSelect,
  UIOverlaySelect,
  UIScreen,
  UISwitch,
} from '@pos/shared/ui-native';
import {
  dayOfWeekOptions,
  definitionTypeOptions,
  DefinitionFormValues,
  getDefinitionFieldAvailability,
  methodOptions,
  scopeOptions,
  stackModeOptions,
  statusOptions,
} from './discounts.helpers';
import { DiscountsStyles } from './discounts.styles';

interface OptionItem {
  id?: string;
  name: string;
}

interface DiscountDefinitionFieldsProps {
  form: UseFormReturn<DefinitionFormValues>;
  styles: DiscountsStyles;
  title: string;
  subtitle: string;
  promoMode: boolean;
  loading: boolean;
  busy: boolean;
  editingId?: string;
  showAdvanced: boolean;
  definitionPreview: string;
  categoryOptions: OptionItem[];
  productOptions: OptionItem[];
  stationOptions: OptionItem[];
  deleteBusy?: boolean;
  onToggleAdvanced: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function DiscountDefinitionFields({
  form,
  styles,
  title,
  subtitle,
  promoMode,
  loading,
  busy,
  editingId,
  showAdvanced,
  definitionPreview,
  categoryOptions,
  productOptions,
  stationOptions,
  deleteBusy = false,
  onToggleAdvanced,
  onSave,
  onCancel,
  onDelete,
}: DiscountDefinitionFieldsProps) {
  const definitionTypeList = promoMode
    ? [definitionTypeOptions[2]]
    : definitionTypeOptions.slice(0, 2);
  const methodList = promoMode ? methodOptions.slice(0, 2) : methodOptions;
  const scope = form.watch('scope');
  const appliesToAllProducts = form.watch('appliesToAllProducts');
  const availability = getDefinitionFieldAvailability({
    scope,
    appliesToAllProducts,
  });

  return (
    <UIScreen>
      <FormProvider {...form}>
        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
              <UICard tone="muted" radius="lg" style={styles.headerCard}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
              </UICard>

              {loading ? (
                <UICard style={styles.emptyCard}>
                  <Text style={styles.headerTitle}>Loading definition…</Text>
                </UICard>
              ) : (
                <>
                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Core</Text>
                    <UIInput name="name" label="Name" placeholder="Name" rules={{ required: 'Name is required' }} />
                    <UIInput name="description" label="Description" placeholder="Description" />
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Type</Text>
                        <UIOverlaySelect name="type" title="Select type" list={definitionTypeList} selectedId={form.watch('type')} />
                      </View>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Status</Text>
                        <UIOverlaySelect name="status" title="Select status" list={statusOptions} selectedId={form.watch('status')} />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Scope</Text>
                        <UIOverlaySelect name="scope" title="Select scope" list={scopeOptions} selectedId={form.watch('scope')} />
                      </View>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Method</Text>
                        <UIOverlaySelect name="method" title="Select method" list={methodList} selectedId={form.watch('method')} />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Stack mode</Text>
                        <UIOverlaySelect name="stackMode" title="Select stack mode" list={stackModeOptions} selectedId={form.watch('stackMode')} />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput name="priority" label="Priority" keyboardType="number-pad" placeholder="100" />
                      </View>
                    </View>
                    {promoMode ? (
                      <UIInput name="code" label="Promo code" placeholder="SPRING10" rules={{ required: 'Promo code is required' }} />
                    ) : null}
                    <UINumericInput name="value" label="Value" allowDecimals keyboardType="decimal-pad" placeholder="0" />
                    <View style={styles.previewCard}>
                      <Text style={styles.previewTitle}>This discount will…</Text>
                      <Text style={styles.previewBody}>{definitionPreview}</Text>
                    </View>
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Eligibility</Text>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UINumericInput
                          name="minSubtotal"
                          label="Min subtotal"
                          allowDecimals
                          keyboardType="decimal-pad"
                          placeholder="Optional"
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput
                          name="minQuantity"
                          label="Min quantity"
                          allowDecimals
                          keyboardType="decimal-pad"
                          placeholder="Optional"
                          disabled={!availability.minQuantityEnabled}
                        />
                      </View>
                    </View>
                    {!availability.minQuantityEnabled ? (
                      <Text style={styles.fieldHint}>
                        Min quantity only applies to line-level discounts.
                      </Text>
                    ) : null}
                    {promoMode ? (
                      <UINumericInput name="usageLimitTotal" label="Usage limit" keyboardType="number-pad" placeholder="Optional" />
                    ) : null}
                    <View style={styles.formColumnWide}>
                      <Text style={styles.fieldLabel}>Applicable categories</Text>
                      <UIOverlayMultiSelect
                        name="applicableCategoryIds"
                        title="Select applicable categories"
                        emptyLabel="Choose categories"
                        list={categoryOptions}
                        searchable
                        searchPlaceholder="Filter categories"
                        disabled={!availability.applicableFiltersEnabled}
                      />
                    </View>
                    <View style={styles.formColumnWide}>
                      <Text style={styles.fieldLabel}>Applicable products</Text>
                      <UIOverlayMultiSelect
                        name="applicableProductIds"
                        title="Select applicable products"
                        emptyLabel="Choose products"
                        list={productOptions}
                        searchable
                        searchPlaceholder="Filter products"
                        disabled={!availability.applicableFiltersEnabled}
                      />
                    </View>
                    {!availability.productTargetingToggleEnabled ? (
                      <Text style={styles.fieldHint}>
                        Product targeting only applies to line-level discounts.
                      </Text>
                    ) : appliesToAllProducts ? (
                      <Text style={styles.fieldHint}>
                        Turn off "Applies to all products" to target specific products or categories.
                      </Text>
                    ) : null}
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Schedule</Text>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="startDate"
                          label="Start date"
                          placeholder="Select start date"
                          mode="date"
                          title="Select start date"
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="endDate"
                          label="End date"
                          placeholder="Select end date"
                          mode="date"
                          title="Select end date"
                        />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="startTime"
                          label="Start time"
                          placeholder="Select start time"
                          mode="time"
                          title="Select start time"
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="endTime"
                          label="End time"
                          placeholder="Select end time"
                          mode="time"
                          title="Select end time"
                        />
                      </View>
                    </View>
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Rules</Text>
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Active</Text>
                      <UISwitch name="active" />
                    </View>
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Approval required</Text>
                      <UISwitch name="approvalRequired" />
                    </View>
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Reason required</Text>
                      <UISwitch name="reasonRequired" />
                    </View>
                    <Pressable style={styles.advancedToggle} onPress={onToggleAdvanced}>
                      <Text style={styles.advancedToggleText}>
                        {showAdvanced ? 'Hide advanced rules' : 'Show advanced rules'}
                      </Text>
                    </Pressable>
                    {showAdvanced ? (
                      <>
                        <View style={styles.formColumnWide}>
                          <Text style={styles.fieldLabel}>Days of week</Text>
                          <UIOverlayMultiSelect
                            name="daysOfWeek"
                            title="Select days of week"
                            emptyLabel="Choose days"
                            list={dayOfWeekOptions}
                          />
                        </View>
                        <View style={styles.formColumnWide}>
                          <Text style={styles.fieldLabel}>Excluded categories</Text>
                          <UIOverlayMultiSelect
                            name="excludedCategoryIds"
                            title="Select excluded categories"
                            emptyLabel="Choose categories"
                            list={categoryOptions}
                            searchable
                            searchPlaceholder="Filter categories"
                            disabled={!availability.exclusionFiltersEnabled}
                          />
                        </View>
                        <View style={styles.formColumnWide}>
                          <Text style={styles.fieldLabel}>Excluded products</Text>
                          <UIOverlayMultiSelect
                            name="excludedProductIds"
                            title="Select excluded products"
                            emptyLabel="Choose products"
                            list={productOptions}
                            searchable
                            searchPlaceholder="Filter products"
                            disabled={!availability.exclusionFiltersEnabled}
                          />
                        </View>
                        <View style={styles.formColumnWide}>
                          <Text style={styles.fieldLabel}>Stations</Text>
                          <UIOverlayMultiSelect
                            name="stationIds"
                            title="Select stations"
                            emptyLabel="Choose stations"
                            list={stationOptions}
                          />
                        </View>
                      </>
                    ) : null}
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Exclude already discounted items</Text>
                      <UISwitch
                        name="excludeAlreadyDiscountedItems"
                        disabled={!availability.excludeAlreadyDiscountedItemsEnabled}
                      />
                    </View>
                    <View style={styles.toggleRowNoBorder}>
                      <Text style={styles.toggleLabel}>Applies to all products</Text>
                      <UISwitch
                        name="appliesToAllProducts"
                        disabled={!availability.productTargetingToggleEnabled}
                      />
                    </View>
                    {!availability.exclusionFiltersEnabled ? (
                      <Text style={styles.fieldHint}>
                        Exclusions and "already discounted" rules only apply to line-level discounts.
                      </Text>
                    ) : null}
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
                    testID="discount-delete-button"
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
