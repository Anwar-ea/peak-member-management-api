import { PagedRequest, IFetchRequest, IDataSourceResponse } from "../models";

const countTotalPages = (pageSize: number, totalRecords: number): number => Math.ceil(totalRecords / pageSize);

const getPageStartAndPageEnd = (pageSize: number, pageNo: number): { pageStart: number; pageEnd: number } => {
    let pageEnd = pageSize * pageNo;
    return { pageEnd, pageStart: pageEnd - pageSize + 1 };
}

export const setSaurceDataResponse = <T extends {toResponse: (entity: T) => TResponse} ,TResponse>(data: Array<T>, totalRecords: number, pageSize: number = 10, pageNo: number = 1): IDataSourceResponse<TResponse> => {
    let { pageStart, pageEnd } = getPageStartAndPageEnd(pageSize, pageNo);
    return {
        data: data.map(x => x.toResponse(x)),
        total: totalRecords,
        pageStartsFrom: pageStart,
        pageEndsAt: pageEnd,
        numberOfPages: countTotalPages(pageSize, totalRecords)
    }
}

export const setFetchRequest = <T>(fetchRequest: IFetchRequest<T>): IFetchRequest<T> => {

    if (!fetchRequest?.pagedListRequest) fetchRequest.pagedListRequest = new PagedRequest();

    return fetchRequest;
}
