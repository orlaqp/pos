export interface ModelSyncedEvent {
    model: {
        name: string; // the name of the model that was synced
    };
    isFullSync: boolean; // if the model was synced with a "full" query to retrieve all models
    isDeltaSync: boolean; // if the model was synced with a "delta" query to retrieve only changes since the last sync
    new: number; // the number of new model instances added to the local store
    updated: number; // the number of existing model instances updated in the local store
    deleted: number; // the number of model instances deleted from the local store
}