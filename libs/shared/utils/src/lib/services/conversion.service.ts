export function blobToBase64(
    blob?: Blob | ReadableStream<any> | unknown
): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, _) => {
        if (!blob) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob as Blob);
    });
}
