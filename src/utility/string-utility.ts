export const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1);
    });
}

export const toCamelCase = (str: string): string => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) => index === 0? match.toLowerCase() : match.toUpperCase());
}