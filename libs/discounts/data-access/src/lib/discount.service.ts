import { stampTenant } from '@pos/auth/data-access';
import { API, DataStore } from '@pos/shared/amplify';
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

type GraphqlResponse<T> = {
  data?: T | null;
  errors?: Array<{ message?: string } | null> | null;
};

const listDiscountDefinitionsQuery = /* GraphQL */ `
  query ListDiscountDefinitions($filter: ModelDiscountDefinitionFilterInput, $limit: Int, $nextToken: String) {
    listDiscountDefinitions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        tenantId
        name
        code
        description
        status
        type
        method
        scope
        value
        priority
        stackMode
        approvalRequired
        reasonRequired
        startDate
        endDate
        daysOfWeek
        startTime
        endTime
        minSubtotal
        minQuantity
        usageLimitTotal
        usageCountTotal
        applicableProductIds
        applicableCategoryIds
        excludedProductIds
        excludedCategoryIds
        excludeAlreadyDiscountedItems
        appliesToAllProducts
        stationIds
        active
        createdAt
        updatedAt
        _deleted
        _version
      }
      nextToken
    }
  }
`;

const listEmployeeDiscountPoliciesQuery = /* GraphQL */ `
  query ListEmployeeDiscountPolicies($filter: ModelEmployeeDiscountPolicyFilterInput, $limit: Int, $nextToken: String) {
    listEmployeeDiscountPolicies(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        tenantId
        employeeId
        roleKey
        maxManualPercentDiscount
        maxManualAmountDiscount
        maxPriceOverrideAmount
        maxPriceOverridePercentBelowBase
        canApplyOrderDiscount
        canOverridePrice
        canApproveDiscounts
        canApprovePriceOverrides
        canUsePromoCodes
        requireReasonForManualDiscounts
        requireReasonForOverrides
        requireApprovalForOrderDiscount
        requireApprovalForAnyPriceOverride
        allowExclusiveDiscountOverride
        active
        createdAt
        updatedAt
        _deleted
        _version
      }
      nextToken
    }
  }
`;

const deleteDiscountDefinitionMutation = /* GraphQL */ `
  mutation DeleteDiscountDefinition($input: DeleteDiscountDefinitionInput!) {
    deleteDiscountDefinition(input: $input) {
      id
      _deleted
      _version
    }
  }
`;

const deleteEmployeeDiscountPolicyMutation = /* GraphQL */ `
  mutation DeleteEmployeeDiscountPolicy($input: DeleteEmployeeDiscountPolicyInput!) {
    deleteEmployeeDiscountPolicy(input: $input) {
      id
      _deleted
      _version
    }
  }
`;

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

const mapRemoteDefinition = (item: any): DiscountDefinitionEntity => ({
  id: item.id,
  name: item.name,
  code: item.code,
  description: item.description,
  status: item.status,
  type: item.type,
  method: item.method,
  scope: item.scope,
  value: item.value,
  priority: item.priority,
  stackMode: item.stackMode,
  approvalRequired: item.approvalRequired ?? false,
  reasonRequired: item.reasonRequired ?? false,
  startDate: item.startDate,
  endDate: item.endDate,
  daysOfWeek: item.daysOfWeek ?? null,
  startTime: item.startTime,
  endTime: item.endTime,
  minSubtotal: item.minSubtotal,
  minQuantity: item.minQuantity,
  usageLimitTotal: item.usageLimitTotal,
  usageCountTotal: item.usageCountTotal,
  applicableProductIds: item.applicableProductIds ?? null,
  applicableCategoryIds: item.applicableCategoryIds ?? null,
  excludedProductIds: item.excludedProductIds ?? null,
  excludedCategoryIds: item.excludedCategoryIds ?? null,
  excludeAlreadyDiscountedItems: item.excludeAlreadyDiscountedItems ?? false,
  appliesToAllProducts: item.appliesToAllProducts ?? false,
  stationIds: item.stationIds ?? null,
  active: item.active,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const mapRemotePolicy = (item: any): EmployeeDiscountPolicyEntity => ({
  id: item.id,
  employeeId: item.employeeId,
  roleKey: item.roleKey,
  maxManualPercentDiscount: item.maxManualPercentDiscount,
  maxManualAmountDiscount: item.maxManualAmountDiscount,
  maxPriceOverrideAmount: item.maxPriceOverrideAmount,
  maxPriceOverridePercentBelowBase: item.maxPriceOverridePercentBelowBase,
  canApplyOrderDiscount: item.canApplyOrderDiscount,
  canOverridePrice: item.canOverridePrice,
  canApproveDiscounts: item.canApproveDiscounts,
  canApprovePriceOverrides: item.canApprovePriceOverrides,
  canUsePromoCodes: item.canUsePromoCodes,
  requireReasonForManualDiscounts: item.requireReasonForManualDiscounts,
  requireReasonForOverrides: item.requireReasonForOverrides,
  requireApprovalForOrderDiscount: item.requireApprovalForOrderDiscount,
  requireApprovalForAnyPriceOverride: item.requireApprovalForAnyPriceOverride,
  allowExclusiveDiscountOverride: item.allowExclusiveDiscountOverride,
  active: item.active,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const findRemoteDefinitionRecord = async (id: string) => {
  const response = await API.graphql<{
    listDiscountDefinitions?: {
      items?: Array<any | null> | null;
    } | null;
  }>({
    query: listDiscountDefinitionsQuery,
    variables: { limit: 200 },
    authMode: 'userPool',
  });

  return response?.data?.listDiscountDefinitions?.items?.find(
    (definition) =>
      isNotDeleted(definition as { _deleted?: boolean | null }) &&
      definition.id === id
  );
};

const findRemotePolicyRecord = async (id: string) => {
  const response = await API.graphql<{
    listEmployeeDiscountPolicies?: {
      items?: Array<any | null> | null;
    } | null;
  }>({
    query: listEmployeeDiscountPoliciesQuery,
    variables: { limit: 200 },
    authMode: 'userPool',
  });

  return response?.data?.listEmployeeDiscountPolicies?.items?.find(
    (policy) =>
      isNotDeleted(policy as { _deleted?: boolean | null }) &&
      policy.id === id
  );
};

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

const getGraphqlErrorMessage = (response: GraphqlResponse<unknown>, fallback: string) => {
  const messages = (response.errors || [])
    .filter((error): error is { message?: string } => !!error)
    .map((error) => error.message)
    .filter((message): message is string => typeof message === 'string' && message.trim().length > 0);

  return messages.length ? messages.join('; ') : fallback;
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

    const remoteItem = await findRemoteDefinitionRecord(id);
    return remoteItem ? mapRemoteDefinition(remoteItem) : null;
  }

  static async listDefinitions(type?: 'MANUAL' | 'AUTOMATIC' | 'PROMO_CODE') {
    const localItems = ((await DataStore.query(DiscountDefinition)) || [])
      .filter((item) => isNotDeleted(item as { _deleted?: boolean | null }))
      .filter((item) => (type ? item.type === type : true))
      .map((item) => DiscountEntityMapper.fromDefinition(item))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (localItems.length) {
      return localItems;
    }

    const response = await API.graphql<{
      listDiscountDefinitions?: {
        items?: Array<any | null> | null;
      } | null;
    }>({
      query: listDiscountDefinitionsQuery,
      variables: { limit: 200 },
      authMode: 'userPool',
    });

    const remoteItems = (response?.data?.listDiscountDefinitions?.items || [])
      .filter((item): item is any => isNotDeleted(item as { _deleted?: boolean | null }))
      .filter((item) => (type ? item.type === type : true))
      .map(mapRemoteDefinition);

    return sortDefinitions(remoteItems);
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
    const localVersion = (existing as { _version?: number } | undefined)?._version;
    const remoteItem = localVersion ? null : await findRemoteDefinitionRecord(id);
    const resolvedVersion = localVersion ?? remoteItem?._version;

    if (!resolvedVersion) throw new Error(`Discount definition ${id} not found`);

    const response = await API.graphql<{
      deleteDiscountDefinition?: { id: string } | null;
    }>({
      query: deleteDiscountDefinitionMutation,
      variables: {
        input: {
          id,
          _version: resolvedVersion,
        },
      },
      authMode: 'userPool',
    });

    if (response.errors?.length || !response.data?.deleteDiscountDefinition?.id) {
      throw new Error(
        getGraphqlErrorMessage(response, `Unable to delete discount definition ${id}`)
      );
    }

    removeDefinitionFromSnapshot(id);

    if (existing) {
      try {
        await DataStore.delete(existing);
      } catch {
        // The backend delete already succeeded; let sync settle local state if local delete races.
      }
    }

    return response.data.deleteDiscountDefinition;
  }

  static async listPolicies() {
    const localItems = ((await DataStore.query(EmployeeDiscountPolicy)) || [])
      .filter((item) => isNotDeleted(item as { _deleted?: boolean | null }))
      .map((item) => DiscountEntityMapper.fromPolicy(item))
      .sort((a, b) => (a.roleKey || a.employeeId || '').localeCompare(b.roleKey || b.employeeId || ''));

    if (localItems.length) {
      return localItems;
    }

    const response = await API.graphql<{
      listEmployeeDiscountPolicies?: {
        items?: Array<any | null> | null;
      } | null;
    }>({
      query: listEmployeeDiscountPoliciesQuery,
      variables: { limit: 200 },
      authMode: 'userPool',
    });

    const remoteItems = (response?.data?.listEmployeeDiscountPolicies?.items || [])
      .filter((item): item is any => isNotDeleted(item as { _deleted?: boolean | null }))
      .map(mapRemotePolicy);

    return sortPolicies(remoteItems);
  }

  static async getPolicy(id: string) {
    const item = await DataStore.query(EmployeeDiscountPolicy, id);
    if (isNotDeleted(item as { _deleted?: boolean | null })) {
      return DiscountEntityMapper.fromPolicy(item);
    }

    const remoteItem = await findRemotePolicyRecord(id);
    return remoteItem ? mapRemotePolicy(remoteItem) : null;
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
    const localVersion = (existing as { _version?: number } | undefined)?._version;
    const remoteItem = localVersion ? null : await findRemotePolicyRecord(id);
    const resolvedVersion = localVersion ?? remoteItem?._version;

    if (!resolvedVersion) throw new Error(`Discount policy ${id} not found`);

    const response = await API.graphql<{
      deleteEmployeeDiscountPolicy?: { id: string } | null;
    }>({
      query: deleteEmployeeDiscountPolicyMutation,
      variables: {
        input: {
          id,
          _version: resolvedVersion,
        },
      },
      authMode: 'userPool',
    });

    if (response.errors?.length || !response.data?.deleteEmployeeDiscountPolicy?.id) {
      throw new Error(
        getGraphqlErrorMessage(response, `Unable to delete discount policy ${id}`)
      );
    }

    removePolicyFromSnapshot(id);

    if (existing) {
      try {
        await DataStore.delete(existing);
      } catch {
        // The backend delete already succeeded; let sync settle local state if local delete races.
      }
    }

    return response.data.deleteEmployeeDiscountPolicy;
  }
}
