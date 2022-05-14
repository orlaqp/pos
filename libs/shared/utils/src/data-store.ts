import { PersistentModelConstructor } from '@aws-amplify/datastore';
import { OpType } from '@aws-amplify/datastore';
import { ActionCreatorWithPayload, AnyAction, Dispatch, EntityId, Update } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';

export interface ObserverProps<
    TModel extends Readonly<{id: string;} & Record<string, any>>,
    TEntity
> {
    dispatch: Dispatch;
    modelConstructor: PersistentModelConstructor<TModel>,
    mapper: (mode: TModel) => TEntity;
    addAction: ActionCreatorWithPayload<TEntity, string>;
    updateAction: (update: Update<TEntity>) => AnyAction;
    deleteAction: (id: EntityId) => AnyAction;
}

export function observeChanges<TModel, TEntity>({ dispatch, mapper, model, addAction, updateAction, deleteAction }: ObserverProps<TModel, TEntity>) {
    DataStore.observe(model).subscribe(msg => {
        switch (msg.opType) {
            case OpType.INSERT:
                console.log('Product inserted', msg.element);
                dispatch(addAction(mapper(msg.element)));
                break;
            case OpType.UPDATE:
                console.log('Product updated', msg.element);
                dispatch(updateAction({ id: msg.element.id, changes: mapper(msg.element) }));
                break;
            case OpType.DELETE:
                console.log('Product deleted', msg.element);
                dispatch(deleteAction(msg.element.id));
                break;
            default:
                break;
        }
    })
}