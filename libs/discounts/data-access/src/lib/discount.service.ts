import { stampTenant } from '@pos/auth/data-access';
import { DataStore } from '@pos/shared/amplify';
import { DiscountDefinition, EmployeeDiscountPolicy } from '@pos/shared/models';
import uuid from 'react-native-uuid';
import {
  DiscountDefinitionEntity,
  DiscountEntityMapper,
  EmployeeDiscountPolicyEntity,
} from './discount.entity';

type DiscountPolicyEmployee = {
  id?: string;
  roles?: Array<string | null>;
};

type DiscountDefinitionListener = (
  items: DiscountDefinitionEntity[]
) => void;

type DiscountPolicyListener = (
  items: EmployeeDiscountPolicyEntity[]
) => void;

const sortDefinitions = (items: DiscountDefinitionEntity[]) =>
  items.sort((a, b) => a.name.localeCompare(b.name));

const sortPolicies = (items: EmployeeDiscountPolicyEntity[]) =>
  items.sort((a, b) => (a.roleKey || a.employeeId || '').localeCompare(b.roleKey || b.employeeId || ''));

const definitionListeners = new Map<DiscountDefinitionListener, { type?: 'MANUAL' | 'AUTOMATIC' | 'PROMO_CODE' }>();
const policyListeners = new Set<DiscountPolicyListener>();

let sharedDefinitionSubscription:
  | {
      unsubscribe: () => void;
    }
  | undefined;

let sharedPolicySubscription:
  | {
      unsubscribe: () => void;
    }
  | undefined;

let definitionSnapshot: DiscountDefinitionEntity[] = [];
let policySnapshot: EmployeeDiscountPolicyEntity[] = [];

const filterDefinitionsByType = (
  items: DiscountDefinitionEntity[],
  type?: 'MANUAL' | 'AUTOMATIC' | 'PROMO_CODE'
) => items.filter((item) => (type ? item.type === type : true));

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
  !!item && item._deleted !== true;

const notifyDefinitionListeners = (items: DiscountDefinitionEntity[]) => {
  definitionListeners.forEach((config, listener) => {
    listener(filterDefinitionsByType(items, config.type));
  });
};

const notifyPolicyListeners = (items: EmployeeDiscountPolicyEntity[]) => {
  policyListeners.forEach((listener) => listener(items));
};

const removeDefinitionFromSnapshot = (id: string) => {
  definitionSnapshot = definitionSnapshot.filter((item) => item.id !== id);
  notifyDefinitionListeners(definitionSnapshot);
};

const removePolicyFromSnapshot = (id: string) => {
  policySnapshot = policySnapshot.filter((item) => item.id !== id);
  notifyPolicyListeners(policySnapshot);
};

const ensureDefinitionSubscription = () => {
  if (sharedDefinitionSubscription) {
    return;
  }

  const subscription = DataStore.observeQuery(DiscountDefinition).subscribe(({ items }) => {
    definitionSnapshot = sortDefinitions(
      items
        .filter((item) => isNotDeleted(item as { _deleted?: boolean | null }))
        .map((item) => DiscountEntityMapper.fromDefinition(item))
    );
    notifyDefinitionListeners(definitionSnapshot);
  });

  sharedDefinitionSubscription = {
    unsubscribe() {
      subscription.unsubscribe();
      sharedDefinitionSubscription = undefined;
      definitionSnapshot = [];
    },
  };
};

const ensurePolicySubscription = () => {
  if (sharedPolicySubscription) {
    return;
  }

  const subscription = DataStore.observeQuery(EmployeeDiscountPolicy).subscribe(({ items }) => {
    policySnapshot = sortPolicies(
      items
        .filter((item) => isNotDeleted(item as { _deleted?: boolean | null }))
        .map((item) => DiscountEntityMapper.fromPolicy(item))
    );
    notifyPolicyListeners(policySnapshot);
  });

  sharedPolicySubscription = {
    unsubscribe() {
      subscription.unsubscribe();
      sharedPolicySubscription = undefined;
      policySnapshot = [];
    },
  };
};

export class DiscountService {
  static subscribeDefinitionChanges(
    listener: DiscountDefinitionListener,
    type?: 'MANUAL' | 'AUTOMATIC' | 'PROMO_CODE'
  ) {
    definitionListeners.set(listener, { type });
    ensureDefinitionSubscription();

    if (definitionSnapshot.length > 0) {
      listener(filterDefinitionsByType(definitionSnapshot, type));
    }

    return {
      unsubscribe() {
        definitionListeners.delete(listener);
        if (definitionListeners.size === 0) {
          sharedDefinitionSubscription?.unsubscribe();
        }
      },
    };
  }

  static subscribePolicyChanges(listener: DiscountPolicyListener) {
    policyListeners.add(listener);
    ensurePolicySubscription();

    if (policySnapshot.length > 0) {
      listener(policySnapshot);
    }

    return {
      unsubscribe() {
        policyListeners.delete(listener);
        if (policyListeners.size === 0) {
          sharedPolicySubscription?.unsubscribe();
        }
      },
    };
  }

  static resolvePolicyForEmployee(
    employee: DiscountPolicyEmployee | null | undefined,
    policies: EmployeeDiscountPolicyEntity[]
  ) {
    if (!employee || !policies.length) {
      return undefined;
    }

    const activePolicies = policies.filter((policy) => policy.active !== false);
    const exactPolicy = activePolicies.find(
      (policy) => !!policy.employeeId && policy.employeeId === employee.id
    );

    if (exactPolicy) {
      return exactPolicy;
    }

    const employeeRoles = (employee.roles || []).filter(
      (role): role is string => typeof role === 'string' && role.trim().length > 0
    );

    return activePolicies.find(
      (policy) => !!policy.roleKey && employeeRoles.includes(policy.roleKey)
    );
  }

  static async getDefinition(id: string) {
    const item = await DataStore.query(DiscountDefinition, id);
    if (isNotDeleted(item as { _deleted?: boolean | null })) {
      return DiscountEntityMapper.fromDefinition(item);
    }
    return null;
  }

  static async listDefinitions(type?: 'MANUAL' | 'AUTOMATIC' | 'PROMO_CODE') {
    return (((await DataStore.query(DiscountDefinition)) || []) as typeof definitionSnapshot)
      .filter((item) => isNotDeleted(item as { _deleted?: boolean | null }))
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
            id: uuid.v4().toString(),
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
        updated.stationIds = entity.stationIds ?? undefined;
        updated.active = entity.active;
      })
    );
  }

  static async deleteDefinition(id: string) {
    const existing = await DataStore.query(DiscountDefinition, id);
    if (!isNotDeleted(existing as { _deleted?: boolean | null })) {
      throw new Error(`Discount definition ${id} not found`);
    }

    await DataStore.delete(existing);
    removeDefinitionFromSnapshot(id);
  }

  static async listPolicies() {
    return (((await DataStore.query(EmployeeDiscountPolicy)) || []) as typeof policySnapshot)
      .filter((item) => isNotDeleted(item as { _deleted?: boolean | null }))
      .map((item) => DiscountEntityMapper.fromPolicy(item))
      .sort((a, b) => (a.roleKey || a.employeeId || '').localeCompare(b.roleKey || b.employeeId || ''));
  }

  static async getPolicy(id: string) {
    const item = await DataStore.query(EmployeeDiscountPolicy, id);
    if (isNotDeleted(item as { _deleted?: boolean | null })) {
      return DiscountEntityMapper.fromPolicy(item);
    }
    return null;
  }

  static async savePolicy(entity: EmployeeDiscountPolicyEntity) {
    if (!entity.id) {
      return DataStore.save(
        new EmployeeDiscountPolicy(
          stampTenant({
            ...entity,
            id: uuid.v4().toString(),
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

  static async deletePolicy(id: string) {
    const existing = await DataStore.query(EmployeeDiscountPolicy, id);
    if (!isNotDeleted(existing as { _deleted?: boolean | null })) {
      throw new Error(`Discount policy ${id} not found`);
    }

    await DataStore.delete(existing);
    removePolicyFromSnapshot(id);
  }
}
