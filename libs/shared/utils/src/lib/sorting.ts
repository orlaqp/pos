export const sortListBy = <T>(items: T[], key: keyof T) => {
    items.sort((a, b) => {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;

        return 0;
    });
}

export const sortDescListBy = <T>(items: T[], key: keyof T) => {
    items.sort((a, b) => {
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;

        return 0;
    });
}


export const sortByCreatedAt = (items: { createdAt?: string | null | undefined }[]) => {
    items.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 1;

        if (!a.createdAt) return -1;
        if (!b.createdAt) return 1;

        if (a.createdAt > b.createdAt) return 1;
        if (a.createdAt < b.createdAt) return -1;

        return 0;
    });
}