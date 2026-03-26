import {
    InventoryCount,
    InventoryCountLine,
    InventoryReceive,
    InventoryReceiveLine,
    Order,
} from '@pos/shared/models';
import { getCurrentTenantId } from '@pos/auth/data-access';
import { DataStore, syncExpression } from '@pos/shared/amplify';
import moment from 'moment';

export const configureDataStore = () => {
    console.log('Configuring data store sync expressions');

    const tenantId = getCurrentTenantId();
    if (!tenantId) {
        console.log('Skipping DataStore sync configuration until tenant is resolved');
        return;
    }

    const isoDate = moment().subtract(90, 'days').toISOString();

    DataStore.configure({
        errorHandler: (error: unknown) => {
            if (error && typeof error === 'object') {
                const details = {
                    message: (error as { message?: unknown }).message,
                    errorType: (error as { errorType?: unknown }).errorType,
                    recoverySuggestion: (error as { recoverySuggestion?: unknown }).recoverySuggestion,
                    localModel: (error as { localModel?: unknown }).localModel,
                    operation: (error as { operation?: unknown }).operation,
                    model: (error as { model?: unknown }).model,
                };
                console.error('DataStore sync error', JSON.stringify(details, null, 2));
                return;
            }

            console.error('DataStore sync error', error);
        },
        syncExpressions: [
            syncExpression(
                InventoryCount,
                () => (x: any) => x.createdAt.gt(isoDate)
            ),
            syncExpression(
                InventoryCountLine,
                () => (x: any) => x.createdAt.gt(isoDate)
            ),
            syncExpression(
                InventoryReceive,
                () => (x: any) => x.createdAt.gt(isoDate)
            ),
            syncExpression(
                InventoryReceiveLine,
                () => (x: any) => x.createdAt.gt(isoDate)
            ),
            syncExpression(
                Order,
                () => (x: any) => x.orderDate.gt(isoDate)
            ),
        ],
    });
};
