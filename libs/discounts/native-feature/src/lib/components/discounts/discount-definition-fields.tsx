import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { translateWithFallback } from '@pos/shared/utils';
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
  buildDayOfWeekOptions,
  buildDefinitionTypeOptions,
  buildMethodOptions,
  buildScopeOptions,
  buildStackModeOptions,
  buildStatusOptions,
  DefinitionFormValues,
  getDefinitionFieldAvailability,
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
  const t = translateWithFallback;
  const definitionTypeOptions = buildDefinitionTypeOptions(t);
  const methodOptions = buildMethodOptions(t);
  const scopeOptions = buildScopeOptions(t);
  const stackModeOptions = buildStackModeOptions(t);
  const statusOptions = buildStatusOptions(t);
  const dayOfWeekOptions = buildDayOfWeekOptions(t);
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
                  <Text style={styles.headerTitle}>
                    {t('DISCOUNT_LoadingDefinition', 'Loading definition...')}
                  </Text>
                </UICard>
              ) : (
                <>
                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>{t('DISCOUNT_CoreSection', 'Core')}</Text>
                    <Text style={styles.sectionSubtitle}>
                      {t(
                        'DISCOUNT_CoreSectionSubtitle',
                        'Name the offer and define the basic pricing behavior.'
                      )}
                    </Text>
                    <UIInput
                      name="name"
                      label={t('COMMON_Name', 'Name')}
                      placeholder={t('COMMON_Name', 'Name')}
                      rules={{ required: t('COMMON_NameRequired', 'Name is required') }}
                    />
                    <UIInput
                      name="description"
                      label={t('COMMON_Description', 'Description')}
                      placeholder={t('COMMON_Description', 'Description')}
                    />
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>{t('COMMON_Type', 'Type')}</Text>
                        <UIOverlaySelect
                          name="type"
                          title={t('DISCOUNT_SelectType', 'Select type')}
                          list={definitionTypeList}
                          selectedId={form.watch('type')}
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>{t('COMMON_Status', 'Status')}</Text>
                        <UIOverlaySelect
                          name="status"
                          title={t('DISCOUNT_SelectStatus', 'Select status')}
                          list={statusOptions}
                          selectedId={form.watch('status')}
                        />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>{t('COMMON_Scope', 'Scope')}</Text>
                        <UIOverlaySelect
                          name="scope"
                          title={t('DISCOUNT_SelectScope', 'Select scope')}
                          list={scopeOptions}
                          selectedId={form.watch('scope')}
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>{t('COMMON_Method', 'Method')}</Text>
                        <UIOverlaySelect
                          name="method"
                          title={t('DISCOUNT_SelectMethod', 'Select method')}
                          list={methodList}
                          selectedId={form.watch('method')}
                        />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>
                          {t('DISCOUNT_StackModeLabel', 'Stack mode')}
                        </Text>
                        <UIOverlaySelect
                          name="stackMode"
                          title={t('DISCOUNT_SelectStackMode', 'Select stack mode')}
                          list={stackModeOptions}
                          selectedId={form.watch('stackMode')}
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput
                          name="priority"
                          label={t('COMMON_Priority', 'Priority')}
                          keyboardType="number-pad"
                          placeholder="100"
                        />
                      </View>
                    </View>
                    {promoMode ? (
                      <UIInput
                        name="code"
                        label={t('DISCOUNT_PromoCodeLabel', 'Promo code')}
                        placeholder="SPRING10"
                        rules={{
                          required: t('DISCOUNT_PromoCodeRequired', 'Promo code is required'),
                        }}
                      />
                    ) : null}
                    <UINumericInput
                      name="value"
                      label={t('COMMON_Value', 'Value')}
                      allowDecimals
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                    <View style={styles.previewCard}>
                      <Text style={styles.previewTitle}>
                        {t('DISCOUNT_PreviewTitle', 'This discount will...')}
                      </Text>
                      <Text style={styles.previewBody}>{definitionPreview}</Text>
                    </View>
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>
                      {t('DISCOUNT_EligibilitySection', 'Eligibility')}
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {t(
                        'DISCOUNT_EligibilitySectionSubtitle',
                        'Limit when this offer can apply by basket size, quantity, category, or product.'
                      )}
                    </Text>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UINumericInput
                          name="minSubtotal"
                          label={t('DISCOUNT_MinSubtotal', 'Min subtotal')}
                          allowDecimals
                          keyboardType="decimal-pad"
                          placeholder={t('COMMON_Optional', 'Optional')}
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput
                          name="minQuantity"
                          label={t('DISCOUNT_MinQuantity', 'Min quantity')}
                          allowDecimals
                          keyboardType="decimal-pad"
                          placeholder={t('COMMON_Optional', 'Optional')}
                          disabled={!availability.minQuantityEnabled}
                        />
                      </View>
                    </View>
                    {!availability.minQuantityEnabled ? (
                      <Text style={styles.fieldHint}>
                        {t(
                          'DISCOUNT_MinQuantityHint',
                          'Min quantity only applies to line-level discounts.'
                        )}
                      </Text>
                    ) : null}
                    {promoMode ? (
                      <UINumericInput
                        name="usageLimitTotal"
                        label={t('DISCOUNT_UsageLimit', 'Usage limit')}
                        keyboardType="number-pad"
                        placeholder={t('COMMON_Optional', 'Optional')}
                      />
                    ) : null}
                    <View style={styles.formColumnWide}>
                      <Text style={styles.fieldLabel}>
                        {t('DISCOUNT_ApplicableCategories', 'Applicable categories')}
                      </Text>
                      <UIOverlayMultiSelect
                        name="applicableCategoryIds"
                        title={t('DISCOUNT_SelectApplicableCategories', 'Select applicable categories')}
                        emptyLabel={t('DISCOUNT_ChooseCategories', 'Choose categories')}
                        list={categoryOptions}
                        searchable
                        searchPlaceholder={t('DISCOUNT_FilterCategories', 'Filter categories')}
                        disabled={!availability.applicableFiltersEnabled}
                      />
                    </View>
                    <View style={styles.formColumnWide}>
                      <Text style={styles.fieldLabel}>
                        {t('DISCOUNT_ApplicableProducts', 'Applicable products')}
                      </Text>
                      <UIOverlayMultiSelect
                        name="applicableProductIds"
                        title={t('DISCOUNT_SelectApplicableProducts', 'Select applicable products')}
                        emptyLabel={t('DISCOUNT_ChooseProducts', 'Choose products')}
                        list={productOptions}
                        searchable
                        searchPlaceholder={t('DISCOUNT_FilterProducts', 'Filter products')}
                        disabled={!availability.applicableFiltersEnabled}
                      />
                    </View>
                    {!availability.productTargetingToggleEnabled ? (
                      <Text style={styles.fieldHint}>
                        {t(
                          'DISCOUNT_ProductTargetingHint',
                          'Product targeting only applies to line-level discounts.'
                        )}
                      </Text>
                    ) : appliesToAllProducts ? (
                      <Text style={styles.fieldHint}>
                        {t(
                          'DISCOUNT_AppliesToAllProductsHint',
                          'Turn off "Applies to all products" to target specific products or categories.'
                        )}
                      </Text>
                    ) : null}
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>
                      {t('DISCOUNT_ScheduleSection', 'Schedule')}
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {t(
                        'DISCOUNT_ScheduleSectionSubtitle',
                        'Optional windows keep offers available only during the right dates and times.'
                      )}
                    </Text>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="startDate"
                          label={t('COMMON_StartDate', 'Start date')}
                          placeholder={t('DISCOUNT_SelectStartDate', 'Select start date')}
                          mode="date"
                          title={t('DISCOUNT_SelectStartDate', 'Select start date')}
                          clearable
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="endDate"
                          label={t('COMMON_EndDate', 'End date')}
                          placeholder={t('DISCOUNT_SelectEndDate', 'Select end date')}
                          mode="date"
                          title={t('DISCOUNT_SelectEndDate', 'Select end date')}
                          clearable
                        />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="startTime"
                          label={t('COMMON_StartTime', 'Start time')}
                          placeholder={t('DISCOUNT_SelectStartTime', 'Select start time')}
                          mode="time"
                          title={t('DISCOUNT_SelectStartTime', 'Select start time')}
                          clearable
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="endTime"
                          label={t('COMMON_EndTime', 'End time')}
                          placeholder={t('DISCOUNT_SelectEndTime', 'Select end time')}
                          mode="time"
                          title={t('DISCOUNT_SelectEndTime', 'Select end time')}
                          clearable
                        />
                      </View>
                    </View>
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>
                      {t('DISCOUNT_RulesSection', 'Rules')}
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {t(
                        'DISCOUNT_RulesSectionSubtitle',
                        'Advanced controls for stacking, exclusions, stations, and product-wide behavior.'
                      )}
                    </Text>
                    <Text style={styles.fieldHint}>
                      {t(
                        'DISCOUNT_RulesStatusHint',
                        'Use Status in the Core section to control whether this discount is active.'
                      )}
                    </Text>
                    <Pressable style={styles.advancedToggle} onPress={onToggleAdvanced}>
                      <Text style={styles.advancedToggleText}>
                        {showAdvanced
                          ? t('DISCOUNT_HideAdvancedRules', 'Hide advanced rules')
                          : t('DISCOUNT_ShowAdvancedRules', 'Show advanced rules')}
                      </Text>
                    </Pressable>
                    {showAdvanced ? (
                      <>
                        <View style={styles.formColumnWide}>
                          <Text style={styles.fieldLabel}>
                            {t('DISCOUNT_DaysOfWeek', 'Days of week')}
                          </Text>
                          <UIOverlayMultiSelect
                            name="daysOfWeek"
                            title={t('DISCOUNT_SelectDaysOfWeek', 'Select days of week')}
                            emptyLabel={t('DISCOUNT_ChooseDays', 'Choose days')}
                            list={dayOfWeekOptions}
                          />
                        </View>
                        <View style={styles.formColumnWide}>
                          <Text style={styles.fieldLabel}>
                            {t('DISCOUNT_ExcludedCategories', 'Excluded categories')}
                          </Text>
                          <UIOverlayMultiSelect
                            name="excludedCategoryIds"
                            title={t('DISCOUNT_SelectExcludedCategories', 'Select excluded categories')}
                            emptyLabel={t('DISCOUNT_ChooseCategories', 'Choose categories')}
                            list={categoryOptions}
                            searchable
                            searchPlaceholder={t('DISCOUNT_FilterCategories', 'Filter categories')}
                            disabled={!availability.exclusionFiltersEnabled}
                          />
                        </View>
                        <View style={styles.formColumnWide}>
                          <Text style={styles.fieldLabel}>
                            {t('DISCOUNT_ExcludedProducts', 'Excluded products')}
                          </Text>
                          <UIOverlayMultiSelect
                            name="excludedProductIds"
                            title={t('DISCOUNT_SelectExcludedProducts', 'Select excluded products')}
                            emptyLabel={t('DISCOUNT_ChooseProducts', 'Choose products')}
                            list={productOptions}
                            searchable
                            searchPlaceholder={t('DISCOUNT_FilterProducts', 'Filter products')}
                            disabled={!availability.exclusionFiltersEnabled}
                          />
                        </View>
                        <View style={styles.formColumnWide}>
                          <Text style={styles.fieldLabel}>
                            {t('COMMON_Stations', 'Stations')}
                          </Text>
                          <UIOverlayMultiSelect
                            name="stationIds"
                            title={t('DISCOUNT_SelectStations', 'Select stations')}
                            emptyLabel={t('DISCOUNT_ChooseStations', 'Choose stations')}
                            list={stationOptions}
                          />
                        </View>
                      </>
                    ) : null}
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>
                        {t(
                          'DISCOUNT_ExcludeAlreadyDiscountedItems',
                          'Exclude already discounted items'
                        )}
                      </Text>
                      <UISwitch
                        name="excludeAlreadyDiscountedItems"
                        disabled={!availability.excludeAlreadyDiscountedItemsEnabled}
                      />
                    </View>
                    <View style={styles.toggleRowNoBorder}>
                      <Text style={styles.toggleLabel}>
                        {t('DISCOUNT_AppliesToAllProducts', 'Applies to all products')}
                      </Text>
                      <UISwitch
                        name="appliesToAllProducts"
                        disabled={!availability.productTargetingToggleEnabled}
                      />
                    </View>
                    {!availability.exclusionFiltersEnabled ? (
                      <Text style={styles.fieldHint}>
                        {t(
                          'DISCOUNT_ExclusionsHint',
                          'Exclusions and "already discounted" rules only apply to line-level discounts.'
                        )}
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
                      {deleteBusy
                        ? t('COMMON_Deleting', 'Deleting...')
                        : t('COMMON_Delete', 'Delete')}
                    </Text>
                  </Pressable>
                ) : (
                  <View />
                )}
                <UIActions
                  busy={busy || loading || deleteBusy}
                  submitTitle={
                    editingId
                      ? t('COMMON_Update', 'Update')
                      : t('COMMON_Save', 'Save')
                  }
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
