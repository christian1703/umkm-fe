export const formatIDR = (value: string | number) => {
    if (value === null || value === undefined || value === "") return "";

    const number = Number(
        value.toString().replace(/[^0-9.]/g, "")
    );

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};

export const parseIDR = (value: string) => {
    return value.replace(/\D/g, "");
};