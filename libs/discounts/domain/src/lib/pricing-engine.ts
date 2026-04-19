import {
  AppliedDiscountDetail,
  DiscountApplicationType,
  DiscountDefinition,
  DiscountMethod,
  DiscountScope,
  DiscountStackMode,
  EmployeeDiscountPolicy,
  ManualDiscountRequest,
  PriceOverrideRequest,
  PricingCartInput,
  PricingLineResult,
  PricingOrderResult,
  PricingPreviewResult,
  PromoCodeRequest,
} from './types';
import { buildAppliedDiscountSummary } from './discount-snapshot-builder';

const PRICING_VERSION = 'discounts-v1';

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function nowIso(now?: string): string {
  return now || new Date().toISOString();
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function calculateDiscountAmount(method: DiscountMethod, value: number, amount: number): number {
  if (method === 'PERCENT') {
    return roundCurrency((amount * value) / 100);
  }

  if (method === 'AMOUNT') {
    return roundCurrency(Math.min(value, amount));
  }

  if (method === 'FINAL_PRICE') {
    return roundCurrency(Math.max(0, amount - value));
  }

  return 0;
}

function policyValue(value: number | null | undefined, fallback: number): number {
  return value == null ? fallback : value;
}

function requiresApprovalForManualDiscount(
  request: ManualDiscountRequest,
  policy: EmployeeDiscountPolicy | null | undefined,
  lineBaseAmount?: number
) {
  if (!policy) return false;
  if (request.scope === 'ORDER' && policy.requireApprovalForOrderDiscount) return true;

  if (request.method === 'PERCENT') {
    return request.value > policyValue(policy.maxManualPercentDiscount, 100);
  }

  const limit = policyValue(policy.maxManualAmountDiscount, Number.MAX_SAFE_INTEGER);
  const requestedAmount = request.method === 'AMOUNT'
    ? request.value
    : lineBaseAmount == null
      ? 0
      : calculateDiscountAmount(request.method, request.value, lineBaseAmount);

  return requestedAmount > limit;
}

function requiresApprovalForOverride(
  request: PriceOverrideRequest,
  policy: EmployeeDiscountPolicy | null | undefined,
  baseUnitPrice: number
) {
  if (!policy) return false;
  if (policy.requireApprovalForAnyPriceOverride) return true;

  const delta = roundCurrency(Math.max(0, baseUnitPrice - request.finalPrice));
  if (delta > policyValue(policy.maxPriceOverrideAmount, Number.MAX_SAFE_INTEGER)) {
    return true;
  }

  const pctBelowBase = baseUnitPrice <= 0 ? 0 : roundCurrency((delta / baseUnitPrice) * 100);
  return pctBelowBase > policyValue(policy.maxPriceOverridePercentBelowBase, 100);
}

function ensureReasonIfRequired(
  reasonRequired: boolean,
  reasonCode?: string | null,
  reasonNote?: string | null
): string | null {
  if (!reasonRequired) return null;
  if (!reasonCode) return 'Reason code is required.';
  if (reasonCode === 'other' && !reasonNote?.trim()) {
    return 'Reason note is required when reason code is other.';
  }
  return null;
}

function isDefinitionActive(definition: DiscountDefinition, at: string): boolean {
  if (definition.status !== 'ACTIVE') return false;
  if (definition.startDate && at < definition.startDate) return false;
  if (definition.endDate && at > definition.endDate) return false;
  return true;
}

function normalizeWeekday(day: string): string {
  return day.trim().slice(0, 3).toUpperCase();
}

function getScopedDateParts(at: string, timezone?: string | null) {
  const date = new Date(at);
  const scopedTimezone = timezone || 'UTC';

  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: scopedTimezone,
  }).format(date);

  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: scopedTimezone,
  }).format(date);

  return {
    weekday: normalizeWeekday(weekday),
    time,
  };
}

function isTimeWithinWindow(current: string, start?: string | null, end?: string | null) {
  if (!start && !end) return true;
  if (start && !end) return current >= start;
  if (!start && end) return current <= end;
  if (!start || !end) return true;
  if (start <= end) {
    return current >= start && current <= end;
  }

  return current >= start || current <= end;
}

function isDefinitionContextEligible(definition: DiscountDefinition, input: PricingCartInput, at: string) {
  if (!isDefinitionActive(definition, at)) return false;

  const { weekday, time } = getScopedDateParts(at, input.timezone);
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
    if (!input.stationId || !definition.stationIds.includes(input.stationId)) {
      return false;
    }
  }

  return true;
}

function lineEligibleForDefinition(
  definition: DiscountDefinition,
  input: PricingCartInput,
  line: PricingCartInput['lines'][number],
  lineBaseAmount: number,
  qualifyingSubtotal: number,
  hasExistingLineDiscount: boolean,
  at: string
): boolean {
  if (line.discountable === false) return false;
  if (definition.scope !== 'LINE') return false;
  if (!isDefinitionContextEligible(definition, input, at)) return false;
  if (definition.minSubtotal != null && qualifyingSubtotal < definition.minSubtotal) return false;
  if (definition.minQuantity != null && line.quantity < definition.minQuantity) return false;
  if (definition.excludeAlreadyDiscountedItems && hasExistingLineDiscount) return false;
  if (definition.applicableProductIds?.length && !definition.applicableProductIds.includes(line.productId)) return false;
  if (definition.excludedProductIds?.includes(line.productId)) return false;
  if (definition.applicableCategoryIds?.length && !definition.applicableCategoryIds.includes(line.categoryId || '')) return false;
  if (definition.excludedCategoryIds?.includes(line.categoryId || '')) return false;
  return lineBaseAmount > 0;
}

function chooseBestLineDiscount(candidates: AppliedDiscountDetail[]): AppliedDiscountDetail[] {
  if (!candidates.length) return [];
  const exclusives = candidates.filter((candidate) => candidate.stackMode === 'EXCLUSIVE');
  if (exclusives.length) {
    const winner = [...exclusives].sort((a, b) => b.discountAmount - a.discountAmount || a.name.localeCompare(b.name))[0];
    return [winner];
  }

  const bestPriceOnly = candidates.filter((candidate) => candidate.stackMode === 'BEST_PRICE_ONLY');
  const stackable = candidates.filter((candidate) => candidate.stackMode === 'STACKABLE');

  const chosen: AppliedDiscountDetail[] = [...stackable];
  if (bestPriceOnly.length) {
    chosen.push(
      [...bestPriceOnly].sort((a, b) => b.discountAmount - a.discountAmount || a.name.localeCompare(b.name))[0]
    );
  }

  return chosen;
}

function prorateDiscount(totalDiscount: number, lineAmounts: { lineId: string; amount: number }[]) {
  if (totalDiscount <= 0 || !lineAmounts.length) {
    return lineAmounts.reduce<Record<string, number>>((acc, line) => {
      acc[line.lineId] = 0;
      return acc;
    }, {});
  }

  const base = roundCurrency(lineAmounts.reduce((sum, line) => sum + line.amount, 0));
  if (base <= 0) {
    return lineAmounts.reduce<Record<string, number>>((acc, line) => {
      acc[line.lineId] = 0;
      return acc;
    }, {});
  }

  const allocations: Record<string, number> = {};
  let allocated = 0;

  lineAmounts.forEach((line, index) => {
    if (index === lineAmounts.length - 1) {
      allocations[line.lineId] = roundCurrency(totalDiscount - allocated);
      return;
    }

    const share = roundCurrency((line.amount / base) * totalDiscount);
    allocations[line.lineId] = share;
    allocated = roundCurrency(allocated + share);
  });

  return allocations;
}

function buildApplication(
  params: {
    id: string;
    definitionId?: string | null;
    applicationType: DiscountApplicationType;
    scope: DiscountScope;
    method: DiscountMethod;
    name: string;
    code?: string | null;
    stackMode?: DiscountStackMode;
    source: AppliedDiscountDetail['source'];
    value: number;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    quantityBasis?: number | null;
    reasonCode?: string | null;
    reasonNote?: string | null;
    appliedByEmployeeId?: string | null;
    appliedByEmployeeName?: string | null;
    approvedByEmployeeId?: string | null;
    approvedByEmployeeName?: string | null;
    approvalRequired?: boolean;
    approvalReference?: string | null;
    sourceSnapshot?: string | null;
    appliedAt: string;
  }
): AppliedDiscountDetail {
  return {
    discountApplicationId: params.id,
    discountDefinitionId: params.definitionId,
    applicationType: params.applicationType,
    scope: params.scope,
    method: params.method,
    name: params.name,
    code: params.code,
    stackMode: params.stackMode || 'STACKABLE',
    source: params.source,
    value: params.value,
    originalAmount: roundCurrency(params.originalAmount),
    discountAmount: roundCurrency(params.discountAmount),
    finalAmount: roundCurrency(params.finalAmount),
    quantityBasis: params.quantityBasis,
    reasonCode: params.reasonCode,
    reasonNote: params.reasonNote,
    appliedByEmployeeId: params.appliedByEmployeeId,
    appliedByEmployeeName: params.appliedByEmployeeName,
    approvedByEmployeeId: params.approvedByEmployeeId,
    approvedByEmployeeName: params.approvedByEmployeeName,
    approvalRequired: params.approvalRequired,
    approvalStatus: params.approvedByEmployeeId ? 'APPROVED' : params.approvalRequired ? 'REJECTED' : 'NOT_REQUIRED',
    approvalReference: params.approvalReference,
    sourceSnapshot: params.sourceSnapshot,
    appliedAt: params.appliedAt,
  };
}

export class PricingEngine {
  static preview(input: PricingCartInput): PricingPreviewResult {
    const at = nowIso(input.now);
    const warnings: string[] = [];
    const definitions = input.definitions || [];
    const promoCodes = (input.promoCodes || []).map((promo) => normalizeCode(promo.code));
    const manualDiscounts = input.manualDiscounts || [];
    const priceOverrides = input.priceOverrides || [];
    const orderLines: PricingLineResult[] = [];
    const applications: AppliedDiscountDetail[] = [];
    const orderLevelCandidates: AppliedDiscountDetail[] = [];

    const baseSubtotal = roundCurrency(
      input.lines.reduce((sum, line) => sum + line.baseUnitPrice * line.quantity, 0)
    );

    input.lines.forEach((line) => {
      const lineBaseAmount = roundCurrency(line.baseUnitPrice * line.quantity);
      const override = priceOverrides.find((candidate) => candidate.lineId === line.lineId);
      const lineApplications: AppliedDiscountDetail[] = [];
      let baseUnitPrice = line.baseUnitPrice;
      let lineSubtotalBeforeOrderDiscount = lineBaseAmount;

      if (override) {
        if (input.policy?.canOverridePrice === false) {
          warnings.push(`Price override denied for ${line.productName}.`);
        } else {
          const reasonError = ensureReasonIfRequired(
            !!input.policy?.requireReasonForOverrides,
            override.reasonCode,
            override.reasonNote
          );
          if (reasonError) {
            warnings.push(reasonError);
          } else {
            const minAllowedPrice = line.minAllowedPrice ?? 0;
            const finalPrice = Math.max(minAllowedPrice, roundCurrency(override.finalPrice));
            const approvalRequired = requiresApprovalForOverride(override, input.policy, line.baseUnitPrice);
            if (approvalRequired && !override.approval?.approverEmployeeId) {
              warnings.push(`Price override for ${line.productName} requires approval.`);
            }
            const originalAmount = roundCurrency(line.baseUnitPrice * line.quantity);
            const finalAmount = roundCurrency(finalPrice * line.quantity);
            const discountAmount = roundCurrency(Math.max(0, originalAmount - finalAmount));
            baseUnitPrice = finalPrice;
            lineSubtotalBeforeOrderDiscount = finalAmount;
            const application = buildApplication({
              id: `override-${line.lineId}`,
              definitionId: null,
              applicationType: 'PRICE_OVERRIDE',
              scope: 'LINE',
              method: 'FINAL_PRICE',
              name: override.name || 'Price override',
              source: 'override',
              value: finalPrice,
              originalAmount,
              discountAmount,
              finalAmount,
              quantityBasis: line.quantity,
              reasonCode: override.reasonCode,
              reasonNote: override.reasonNote,
              appliedByEmployeeId: input.employee.employeeId,
              appliedByEmployeeName: input.employee.employeeName,
              approvedByEmployeeId: override.approval?.approverEmployeeId,
              approvedByEmployeeName: override.approval?.approverEmployeeName,
              approvalRequired,
              approvalReference: override.approval?.approvalReference,
              sourceSnapshot: JSON.stringify({ finalPrice }),
              appliedAt: at,
            });
            lineApplications.push(application);
            applications.push(application);
          }
        }
      }

      if (!override) {
        const autoCandidates: AppliedDiscountDetail[] = [];
        definitions.forEach((definition) => {
          if (definition.type === 'PROMO_CODE' && !promoCodes.includes(normalizeCode(definition.code || ''))) {
            return;
          }

          if (definition.type !== 'AUTOMATIC' && definition.type !== 'PROMO_CODE') {
            return;
          }

          if (
            !lineEligibleForDefinition(
              definition,
              input,
              line,
              lineSubtotalBeforeOrderDiscount,
              lineSubtotalBeforeOrderDiscount,
              !!lineApplications.length || autoCandidates.length > 0,
              at
            )
          ) {
            return;
          }

          const discountAmount = calculateDiscountAmount(definition.method, definition.value, lineSubtotalBeforeOrderDiscount);
          if (discountAmount <= 0) return;
          autoCandidates.push(
            buildApplication({
              id: `${definition.id}-${line.lineId}`,
              definitionId: definition.id,
              applicationType: definition.type === 'PROMO_CODE' ? 'PROMO_CODE' : 'AUTOMATIC_DISCOUNT',
              scope: 'LINE',
              method: definition.method,
              name: definition.name,
              code: definition.code,
              stackMode: definition.stackMode,
              source: definition.type === 'PROMO_CODE' ? 'promo' : 'automatic',
              value: definition.value,
              originalAmount: lineSubtotalBeforeOrderDiscount,
              discountAmount,
              finalAmount: roundCurrency(lineSubtotalBeforeOrderDiscount - discountAmount),
              quantityBasis: line.quantity,
              appliedByEmployeeId: input.employee.employeeId,
              appliedByEmployeeName: input.employee.employeeName,
              approvalRequired: !!definition.approvalRequired,
              appliedAt: at,
            })
          );
        });

        chooseBestLineDiscount(autoCandidates).forEach((application) => {
          lineSubtotalBeforeOrderDiscount = roundCurrency(lineSubtotalBeforeOrderDiscount - application.discountAmount);
          lineApplications.push({
            ...application,
            originalAmount: roundCurrency(application.originalAmount),
            finalAmount: lineSubtotalBeforeOrderDiscount,
          });
          applications.push({
            ...application,
            originalAmount: roundCurrency(application.originalAmount),
            finalAmount: lineSubtotalBeforeOrderDiscount,
          });
        });

        const manualLine = manualDiscounts.find((request) => request.scope === 'LINE' && request.lineId === line.lineId);
        if (manualLine) {
          const reasonError = ensureReasonIfRequired(
            !!input.policy?.requireReasonForManualDiscounts,
            manualLine.reasonCode,
            manualLine.reasonNote
          );
          if (reasonError) {
            warnings.push(reasonError);
          } else {
            const approvalRequired = requiresApprovalForManualDiscount(manualLine, input.policy, lineSubtotalBeforeOrderDiscount);
            if (approvalRequired && !manualLine.approval?.approverEmployeeId) {
              warnings.push(`Manual discount for ${line.productName} requires approval.`);
            }
            const discountAmount = calculateDiscountAmount(manualLine.method, manualLine.value, lineSubtotalBeforeOrderDiscount);
            const maxProductPercent = line.maxManualDiscountPercent;
            const maxProductAmount = line.maxManualDiscountAmount;
            if (manualLine.method === 'PERCENT' && maxProductPercent != null && manualLine.value > maxProductPercent) {
              warnings.push(`Manual discount percent exceeds product limit for ${line.productName}.`);
            } else if (manualLine.method === 'AMOUNT' && maxProductAmount != null && manualLine.value > maxProductAmount) {
              warnings.push(`Manual discount amount exceeds product limit for ${line.productName}.`);
            } else {
              const application = buildApplication({
                id: `manual-line-${line.lineId}`,
                definitionId: manualLine.definitionId ?? null,
                applicationType: 'MANUAL_LINE_DISCOUNT',
                scope: 'LINE',
                method: manualLine.method,
                name: manualLine.name || 'Manual line discount',
                source: 'manual',
                value: manualLine.value,
                originalAmount: lineSubtotalBeforeOrderDiscount,
                discountAmount,
                finalAmount: roundCurrency(lineSubtotalBeforeOrderDiscount - discountAmount),
                quantityBasis: line.quantity,
                reasonCode: manualLine.reasonCode,
                reasonNote: manualLine.reasonNote,
                appliedByEmployeeId: input.employee.employeeId,
                appliedByEmployeeName: input.employee.employeeName,
                approvedByEmployeeId: manualLine.approval?.approverEmployeeId,
                approvedByEmployeeName: manualLine.approval?.approverEmployeeName,
                approvalRequired,
                approvalReference: manualLine.approval?.approvalReference,
                appliedAt: at,
              });
              lineSubtotalBeforeOrderDiscount = application.finalAmount;
              lineApplications.push(application);
              applications.push(application);
            }
          }
        }
      }

      orderLines.push({
        lineId: line.lineId,
        productId: line.productId,
        productName: line.productName,
        quantity: line.quantity,
        basePrice: roundCurrency(line.baseUnitPrice),
        overridePrice: override ? roundCurrency(baseUnitPrice) : null,
        netUnitPrice: roundCurrency(line.quantity === 0 ? baseUnitPrice : lineSubtotalBeforeOrderDiscount / line.quantity),
        lineSubtotalBeforeOrderDiscount,
        lineDiscountTotal: roundCurrency(lineBaseAmount - lineSubtotalBeforeOrderDiscount),
        allocatedOrderDiscountTotal: 0,
        lineTotalBeforeTax: lineSubtotalBeforeOrderDiscount,
        lineTotalAfterTax: lineSubtotalBeforeOrderDiscount,
        appliedDiscounts: lineApplications,
      });
    });

    const subtotalAfterLineDiscounts = roundCurrency(
      orderLines.reduce((sum, line) => sum + line.lineSubtotalBeforeOrderDiscount, 0)
    );

    definitions.forEach((definition) => {
      if (definition.scope !== 'ORDER') return;
      if (!isDefinitionContextEligible(definition, input, at)) return;
      if (definition.type === 'PROMO_CODE' && !promoCodes.includes(normalizeCode(definition.code || ''))) {
        return;
      }
      if (definition.type !== 'AUTOMATIC' && definition.type !== 'PROMO_CODE') return;
      if (definition.minSubtotal != null && subtotalAfterLineDiscounts < definition.minSubtotal) return;
      const discountAmount = calculateDiscountAmount(definition.method, definition.value, subtotalAfterLineDiscounts);
      if (discountAmount <= 0) return;
      orderLevelCandidates.push(
        buildApplication({
          id: `${definition.id}-order`,
          definitionId: definition.id,
          applicationType: definition.type === 'PROMO_CODE' ? 'PROMO_CODE' : 'AUTOMATIC_DISCOUNT',
          scope: 'ORDER',
          method: definition.method,
          name: definition.name,
          code: definition.code,
          stackMode: definition.stackMode,
          source: definition.type === 'PROMO_CODE' ? 'promo' : 'automatic',
          value: definition.value,
          originalAmount: subtotalAfterLineDiscounts,
          discountAmount,
          finalAmount: roundCurrency(subtotalAfterLineDiscounts - discountAmount),
          appliedByEmployeeId: input.employee.employeeId,
          appliedByEmployeeName: input.employee.employeeName,
          approvalRequired: !!definition.approvalRequired,
          appliedAt: at,
        })
      );
    });

    const manualOrder = manualDiscounts.find((request) => request.scope === 'ORDER');
    if (manualOrder) {
      if (input.policy?.canApplyOrderDiscount === false) {
        warnings.push('Order discounts are not allowed for this employee.');
      } else {
        const reasonError = ensureReasonIfRequired(
          !!input.policy?.requireReasonForManualDiscounts,
          manualOrder.reasonCode,
          manualOrder.reasonNote
        );
        if (reasonError) {
          warnings.push(reasonError);
        } else {
          const approvalRequired = requiresApprovalForManualDiscount(manualOrder, input.policy, subtotalAfterLineDiscounts);
          if (approvalRequired && !manualOrder.approval?.approverEmployeeId) {
            warnings.push('Manual order discount requires approval.');
          }
          const discountAmount = calculateDiscountAmount(manualOrder.method, manualOrder.value, subtotalAfterLineDiscounts);
          orderLevelCandidates.push(
            buildApplication({
              id: 'manual-order',
              definitionId: manualOrder.definitionId ?? null,
              applicationType: 'MANUAL_ORDER_DISCOUNT',
              scope: 'ORDER',
              method: manualOrder.method,
              name: manualOrder.name || 'Manual order discount',
              stackMode: 'STACKABLE',
              source: 'manual',
              value: manualOrder.value,
              originalAmount: subtotalAfterLineDiscounts,
              discountAmount,
              finalAmount: roundCurrency(subtotalAfterLineDiscounts - discountAmount),
              reasonCode: manualOrder.reasonCode,
              reasonNote: manualOrder.reasonNote,
              appliedByEmployeeId: input.employee.employeeId,
              appliedByEmployeeName: input.employee.employeeName,
              approvedByEmployeeId: manualOrder.approval?.approverEmployeeId,
              approvedByEmployeeName: manualOrder.approval?.approverEmployeeName,
              approvalRequired,
              approvalReference: manualOrder.approval?.approvalReference,
              appliedAt: at,
            })
          );
        }
      }
    }

    const chosenOrderDiscounts = chooseBestLineDiscount(orderLevelCandidates);
    chosenOrderDiscounts.forEach((application) => applications.push(application));

    const totalOrderDiscount = roundCurrency(
      chosenOrderDiscounts.reduce((sum, application) => sum + application.discountAmount, 0)
    );

    const allocations = prorateDiscount(
      totalOrderDiscount,
      orderLines.map((line) => ({ lineId: line.lineId, amount: line.lineSubtotalBeforeOrderDiscount }))
    );

    const taxRate = input.taxRate || 0;
    orderLines.forEach((line) => {
      const allocated = roundCurrency(allocations[line.lineId] || 0);
      line.allocatedOrderDiscountTotal = allocated;
      line.lineTotalBeforeTax = roundCurrency(line.lineSubtotalBeforeOrderDiscount - allocated);
      line.lineTotalAfterTax = roundCurrency(line.lineTotalBeforeTax * (1 + taxRate));
    });

    const subtotal = roundCurrency(orderLines.reduce((sum, line) => sum + line.lineTotalBeforeTax, 0));
    const tax = roundCurrency(orderLines.reduce((sum, line) => sum + (line.lineTotalAfterTax - line.lineTotalBeforeTax), 0));
    const total = roundCurrency(subtotal + tax);
    const lineDiscountTotal = roundCurrency(orderLines.reduce((sum, line) => sum + line.lineDiscountTotal, 0));
    const orderDiscountTotal = roundCurrency(orderLines.reduce((sum, line) => sum + line.allocatedOrderDiscountTotal, 0));

    const order: PricingOrderResult = {
      baseSubtotal,
      subtotal,
      lineDiscountTotal,
      orderDiscountTotal,
      discountTotal: roundCurrency(lineDiscountTotal + orderDiscountTotal),
      savingsTotal: roundCurrency(lineDiscountTotal + orderDiscountTotal),
      tax,
      total,
      promoCodes,
      pricingVersion: PRICING_VERSION,
      pricingSource: input.pricingSource || 'OFFLINE_LOCAL',
      reconciliationStatus: input.pricingSource === 'ONLINE_VALIDATED' ? 'NOT_REQUIRED' : 'PENDING',
      applications,
      lines: orderLines,
      approvalEvents: input.approvalEvents || [],
      warnings,
    };

    return {
      order,
      summary: buildAppliedDiscountSummary(order),
    };
  }
}
