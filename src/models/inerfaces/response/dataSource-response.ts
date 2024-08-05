export interface IDataSourceResponse<TResponse> 
{
    data: Array<TResponse>
    total: number;
    numberOfPages: number;
    pageStartsFrom: number;
    pageEndsAt: number;
}