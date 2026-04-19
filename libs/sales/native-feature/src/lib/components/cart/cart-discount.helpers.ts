import { CartItem, CartState } from '@pos/sales/data-access';
import { DiscountDefinition } from '@pos/discounts/domain';
import { ManualDraft } from './cart.types';

export const normalizeWeekday = (day: string) => day.trim().slice(0, 3).toUpperCase();

export const getScopedDateParts = (at: string, timezone?: string | null) => {
  const date = new Date(at);
  const scopedTimezone = timezone || 'UTC';

  return {
    weekday: normalizeWeekday(
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        timeZone: scopedTimezone,
      }).format(date)
    ),
    time: new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: scopedTimezone,
    }).format(date),
  };
};

export const isTimeWithinWindow = (
  current: string,
  start?: string | null,
  end?: string | null
) => {
  if (!start && !end) return true;
  if (start && !end) return current >= start;
  if (!start && end) return current <= end;
  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
};

export const isDefinitionActiveForContext = (
  definition: DiscountDefinition,
  at: string,
  timezone?: string | null,
  stationId?: string | null
) => {
  if (definition.status !== 'ACTIVE') return false;
  if (definition.startDate && at < definition.startDate) return false;
  if (definition.endDate && at > definition.endDate) return false;

  const { weekday, time } = getScopedDateParts(at, timezone);
  if (definition.daysOfWeek?.length) {
    const allowedDays = definition.daysOfWeek.map(normalizeWeekday);
    if (!allowedDays.includes(weekday)) {
      return false;
    }
  }

  if (!isTimeWithinWindow(time, definition.startTime, definition.endTime)) {
    return false;
  }

  if (definition.stationIds?.length) {
    if (!stationId || !definition.stationIds.includes(stationId)) {
      return false;
    }
  }

  return true;
};

export const baseAmountForDisplay = (
  scope: ManualDraft['scope'],
  cart: CartState,
  selectedLineTotal: number
) =>
  scope === 'ORDER'
    ? cart.footer.subtotal || cart.footer.baseSubtotal
    : selectedLineTotal;

interface AvailableManualDefinitionsInput {
  definitions: DiscountDefinition[];
  draftScope: ManualDraft['scope'];
  orderSubtotal: number;
  selectedLineSubtotal: number;
  selectedItem?: Pick<CartItem, 'identifier' | 'quantity' | 'product'> | null;
  selectedLineHasManualAdjustment: boolean;
  selectedLineDiscountCount: number;
  timestamp: string;
  timezone?: string | null;
  stationId?: string | null;
  canApplyOrderDiscount: boolean;
}

export const getAvailableManualDefinitions = ({
  definitions,
  draftScope,
  orderSubtotal,
  selectedLineSubtotal,
  selectedItem,
  selectedLineHasManualAdjustment,
  selectedLineDiscountCount,
  timestamp,
  timezone,
  stationId,
  canApplyOrderDiscount,
}: AvailableManualDefinitionsInput) =>
  definitions
    .filter(
      (definition) =>
        definition.type === 'MANUAL' &&
        (definition.method === 'PERCENT' || definition.method === 'AMOUNT') &&
        definition.scope === draftScope
    )
    .filter((definition) =>
      isDefinitionActiveForContext(definition, timestamp, timezone, stationId)
    )
    .filter((definition) => {
      const qualifyingSubtotal =
        definition.scope === 'ORDER' ? orderSubtotal : selectedLineSubtotal;

      if (
        definition.minSubtotal != null &&
        qualifyingSubtotal < definition.minSubtotal
      ) {
        return false;
      }

      if (draftScope === 'ORDER') {
        return canApplyOrderDiscount;
      }

      if (!selectedItem?.identifier || selectedItem.quantity === 0) {
        return false;
      }

      const productId = selectedItem.product.id;
      const categoryId = selectedItem.product.categoryId || '';

      if (
        definition.minQuantity != null &&
        selectedItem.quantity < definition.minQuantity
      ) {
        return false;
      }

      if (
        definition.excludeAlreadyDiscountedItems &&
        (selectedLineHasManualAdjustment || selectedLineDiscountCount > 0)
      ) {
        return false;
      }

      if (
        definition.applicableProductIds?.length &&
        !definition.applicableProductIds.includes(productId)
      ) {
        return false;
      }

      if (definition.excludedProductIds?.includes(productId)) {
        return false;
      }

      if (
        definition.applicableCategoryIds?.length &&
        !definition.applicableCategoryIds.includes(categoryId)
      ) {
        return false;
      }

      if (definition.excludedCategoryIds?.includes(categoryId)) {
        return false;
      }

      return true;
    })
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
    );
