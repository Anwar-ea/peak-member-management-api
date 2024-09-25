import { IDataSourceResponse, IFetchRequest, IFilter } from "../../models";
import { HydratedDocument, ProjectionType, RootFilterQuery, UpdateWriteOpResult } from "mongoose";
import { IDropdownResponse } from "../../models/inerfaces/response/dropdown-response";

export interface IRepositoryBase<TEntity, TResponse> {
    count(filter?: RootFilterQuery<TEntity>): Promise<number>;
    findOne(options: RootFilterQuery<TEntity>, projection?: ProjectionType<TEntity> | null): Promise<TEntity | null>;
    firstOrDefaultWithResponse(options: RootFilterQuery<TEntity>): Promise<TResponse | null>;
    getOneByQuery(options: Array<IFilter<TEntity, keyof TEntity>>, getOnlyActive: boolean, dontGetDeleted: boolean, accountId?: string): Promise<HydratedDocument<TEntity> | null>;
    getOneByQueryWithResponse(options: Array<IFilter<TEntity, keyof TEntity>>, getOnlyActive: boolean, dontGetDeleted: boolean, accountId?: string): Promise<TResponse | null>;
    find(options?: RootFilterQuery<TEntity>, projection?: ProjectionType<TEntity>): Promise<Array<HydratedDocument<TEntity>>>;
    findWithResponse(options?: RootFilterQuery<TEntity>): Promise<Array<TResponse>>;
    getAccountRecords(accountId: string, options?: RootFilterQuery<TEntity>): Promise<Array<TEntity>>;
    singleOrDefault(options?: RootFilterQuery<TEntity>): Promise<TEntity | null>;
    singleOrDefaultWithResponse(options?: RootFilterQuery<TEntity>): Promise<TResponse | null>;
    findOneById(id: string): Promise<TEntity | null>;
    findOneByIdWithResponse(id: string): Promise<TResponse | null>;
    max(): Promise<TEntity | null>;
    getPagedData(fetchRequest: IFetchRequest<TEntity>, getOnlyActive: boolean, dontGetDeleted: boolean, accountId?: string): Promise<IDataSourceResponse<TResponse>>;
    update(id: string, partialEntity: Partial<TEntity>): Promise<TResponse>;
    add(entity: TEntity): Promise<TEntity>;
    addRange(entities: TEntity[]): Promise<Array<HydratedDocument<TEntity>>>;
    updateRange(entities: Partial<TEntity>[], filter: RootFilterQuery<TEntity>): Promise<UpdateWriteOpResult>;
    delete(id: string): Promise<TEntity | undefined>;
    deleteRange(entities: RootFilterQuery<TEntity>): Promise<TEntity[]>;
    dropdown(accountId: string, fieldName: string) : Promise<IDropdownResponse[]>;
}