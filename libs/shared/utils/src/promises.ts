export function cancellablePromise<T>(promise: Promise<T>) {
    const isCancelled = { value: false };
    const wrappedPromise = new Promise<T>((res, rej) => {
        promise
            .then(d => {
                return isCancelled.value ? rej(isCancelled) : res(d);
            })
            .catch(e => {
                rej(isCancelled.value ? isCancelled : e);
            });
    });

    return {
        promise: wrappedPromise,
        cancel: () => {
            isCancelled.value = true;
        }
    };
};