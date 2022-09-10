export const isOrderNumber = (orderNo: string) => {
    const orderNoRegExp = /(.+)-(.+)-(\d{6})-(\d{4})/;
    return orderNoRegExp.test(orderNo);
}