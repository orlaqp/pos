import { ReconciliationInput, ReconciliationResult } from './types';

export class DiscountReconciler {
  static reconcile(input: ReconciliationInput): ReconciliationResult {
    const exceptions = [] as ReconciliationResult['exceptions'];

    if (input.local.order.total !== input.backend.order.total) {
      exceptions.push({
        exceptionType: 'CATALOG_RULE_CHANGED',
        severity: 'HIGH',
        message: `Local total ${input.local.order.total.toFixed(2)} does not match backend total ${input.backend.order.total.toFixed(2)}.`,
        backendSnapshot: JSON.stringify(input.backend.summary),
      });
    }

    const missingApprovals = input.local.order.applications.filter(
      (application) => application.approvalRequired && !application.approvedByEmployeeId
    );

    missingApprovals.forEach((application) => {
      exceptions.push({
        exceptionType: 'MISSING_APPROVAL',
        severity: 'HIGH',
        message: `${application.name} requires approval but no approver was recorded.`,
        discountApplicationId: application.discountApplicationId,
        backendSnapshot: JSON.stringify(application),
      });
    });

    return {
      status: exceptions.length ? 'RECONCILED_WITH_EXCEPTION' : 'RECONCILED',
      exceptions,
    };
  }
}
