export const getPageCount = (totalCount, limit) => {
    return Math.ceil(totalCount / limit)
}

export const getPagesArray = (totalCount, limit) => {
    const totalPages = getPageCount(totalCount, limit);
    let result = [];
    for (let i = 0; i < totalPages; i++) {
        result.push(i + 1)
    }
    return result;
}
