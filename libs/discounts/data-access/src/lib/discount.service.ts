import { stampTenant } from '@pos/auth/data-access';
import { DataStore } from '@pos/shared/amplify';
import { DiscountDefinition, EmployeeDiscountPolicy } from '@pos/shared/models';
import {
  DiscountDefinitionEntity,
  DiscountEntityMapper,
  EmployeeDiscountPolicyEntity,
} from './discount.entity';

export class DiscountService {
  static async getDefinition(id: string) {
    const item = await DataStore.query(DiscountDefinition, id);
    return item ? DiscountEntityMapper.fromDefinition(item) : null;
  }

  static async listDefinitions(type?: 'MANUAL' | 'AUTOMATIC' | 'PROMO_CODE') {
    const items = await DataStore.query(DiscountDefinition);
    return items
      .filter((item) => (type ? item.type === type : true))
      .map((item) => DiscountEntityMapper.fromDefinition(item))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  static async saveDefinition(entity: DiscountDefinitionEntity) {
    if (!entity.id) {
      return DataStore.save(
        new DiscountDefinition(
          stampTenant({
            ...entity,
            active: entity.active ?? true,
            approvalRequired: entity.approvalRequired ?? false,
            reasonRequired: entity.reasonRequired ?? false,
            stackMode: entity.stackMode || 'STACKABLE',
            status: entity.status || 'ACTIVE',
            daysOfWeek: entity.daysOfWeek ?? undefined,
            applicableProductIds: entity.applicableProductIds ?? undefined,
            applicableCategoryIds: entity.applicableCategoryIds ?? undefined,
            excludedProductIds: entity.excludedProductIds ?? undefined,
            excludedCategoryIds: entity.excludedCategoryIds ?? undefined,
            storeIds: entity.storeIds ?? undefined,
            stationIds: entity.stationIds ?? undefined,
            excludeAlreadyDiscountedItems: entity.excludeAlreadyDiscountedItems ?? false,
            appliesToAllProducts: entity.appliesToAllProducts ?? false,
          }) as never
        )
      );
    }

    const existing = await DataStore.query(DiscountDefinition, entity.id);
    if (!existing) throw new Error(`Discount definition ${entity.id} not found`);

    return DataStore.save(
      DiscountDefinition.copyOf(existing, (updated) => {
        updated.name = entity.name;
        updated.code = entity.code;
        updated.description = entity.description;
        updated.status = entity.status;
        updated.type = entity.type;
        updated.method = entity.method;
        updated.scope = entity.scope;
        updated.value = entity.value;
        updated.priority = entity.priority ?? undefined;
        updated.stackMode = entity.stackMode;
        updated.approvalRequired = entity.approvalRequired ?? false;
        updated.reasonRequired = entity.reasonRequired ?? false;
        updated.startDate = entity.startDate ?? undefined;
        updated.endDate = entity.endDate ?? undefined;
        updated.daysOfWeek = entity.daysOfWeek ?? undefined;
        updated.startTime = entity.startTime ?? undefined;
        updated.endTime = entity.endTime ?? undefined;
        updated.minSubtotal = entity.minSubtotal ?? undefined;
        updated.minQuantity = entity.minQuantity ?? undefined;
        updated.usageLimitTotal = entity.usageLimitTotal ?? undefined;
        updated.usageCountTotal = entity.usageCountTotal ?? undefined;
        updated.applicableProductIds = entity.applicableProductIds ?? undefined;
        updated.applicableCategoryIds = entity.applicableCategoryIds ?? undefined;
        updated.excludedProductIds = entity.excludedProductIds ?? undefined;
        updated.excludedCategoryIds = entity.excludedCategoryIds ?? undefined;
        updated.excludeAlreadyDiscountedItems = entity.excludeAlreadyDiscountedItems ?? false;
        updated.appliesToAllProducts = entity.appliesToAllProducts ?? false;
        updated.storeIds = entity.storeIds ?? undefined;
        updated.stationIds = entity.stationIds ?? undefined;
        updated.active = entity.active;
      })
    );
  }

  static async listPolicies() {
    const items = await DataStore.query(EmployeeDiscountPolicy);
    return items
      .map((item) => DiscountEntityMapper.fromPolicy(item))
      .sort((a, b) => (a.roleKey || a.employeeId || '').localeCompare(b.roleKey || b.employeeId || ''));
  }

  static async getPolicy(id: string) {
    const item = await DataStore.query(EmployeeDiscountPolicy, id);
    return item ? DiscountEntityMapper.fromPolicy(item) : null;
  }

  static async savePolicy(entity: EmployeeDiscountPolicyEntity) {
    if (!entity.id) {
      return DataStore.save(
        new EmployeeDiscountPolicy(
          stampTenant({
            ...entity,
            active: entity.active ?? true,
          }) as never
        )
      );
    }

    const existing = await DataStore.query(EmployeeDiscountPolicy, entity.id);
    if (!existing) throw new Error(`Discount policy ${entity.id} not found`);

    return DataStore.save(
      EmployeeDiscountPolicy.copyOf(existing, (updated) => {
        updated.employeeId = entity.employeeId;
        updated.roleKey = entity.roleKey;
        updated.maxManualPercentDiscount = entity.maxManualPercentDiscount ?? undefined;
        updated.maxManualAmountDiscount = entity.maxManualAmountDiscount ?? undefined;
        updated.maxPriceOverrideAmount = entity.maxPriceOverrideAmount ?? undefined;
        updated.maxPriceOverridePercentBelowBase = entity.maxPriceOverridePercentBelowBase ?? undefined;
        updated.canApplyOrderDiscount = entity.canApplyOrderDiscount ?? false;
        updated.canOverridePrice = entity.canOverridePrice ?? false;
        updated.canApproveDiscounts = entity.canApproveDiscounts ?? false;
        updated.canApprovePriceOverrides = entity.canApprovePriceOverrides ?? false;
        updated.canUsePromoCodes = entity.canUsePromoCodes ?? false;
        updated.requireReasonForManualDiscounts = entity.requireReasonForManualDiscounts ?? false;
        updated.requireReasonForOverrides = entity.requireReasonForOverrides ?? false;
        updated.requireApprovalForOrderDiscount = entity.requireApprovalForOrderDiscount ?? false;
        updated.requireApprovalForAnyPriceOverride = entity.requireApprovalForAnyPriceOverride ?? false;
        updated.allowExclusiveDiscountOverride = entity.allowExclusiveDiscountOverride ?? false;
        updated.active = entity.active;
      })
    );
  }
}
