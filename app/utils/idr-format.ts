export const formatIDR = (value: string | number) => {
    if (!value) return "";
    const number = Number(value.toString().replace(/\D/g, ""));
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
};

export const parseIDR = (value: string) => {
    return value.replace(/\D/g, "");
};