import { IDataSourceResponse, IFetchRequest, IFilter } from "../../models";
import { ITokenUser } from "../../models/inerfaces/tokenUser";

export interface IServiceBase<TRequest, TResponse, TQuery = TRequest> {
    add(entityRequest: TRequest, contextUser: ITokenUser): Promise<TResponse>;
    addMany(entitesRequest: Array<TRequest>, contextUser: ITokenUser): Promise<Array<TResponse>>;
    get(contextUser?: ITokenUser, fetchRequest?: IFetchRequest<TQuery>): Promise<IDataSourceResponse<TResponse>>;
    getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<TQuery, keyof TQuery>>): Promise<TResponse | null>;
    getById(id: string, contextUser?: ITokenUser): Promise<TResponse | null>;
    update(id: string, entityRequest: TRequest , contextUser: ITokenUser): Promise<TResponse>;
    updateMany(entitesRequest: Array<TRequest & {id: string}>, contextUser: ITokenUser): Promise<Array<TResponse>>;
    delete(id: string, contextUser: ITokenUser): Promise<void>;
    deleteMany(ids: Array<string>, contextUser: ITokenUser): Promise<void>;
    partialUpdate(id: string, partialEntity: Partial<TRequest>,contextUser: ITokenUser): Promise<TResponse>;
}