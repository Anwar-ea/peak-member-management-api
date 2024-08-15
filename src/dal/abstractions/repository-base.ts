import { FindManyOptions, FindOneOptions } from "typeorm";
import { IDataSourceResponse, IFetchRequest, IFilter } from "../../models";

export interface IRepositoryBase<TEntity, TResponse> {
    addRecord(entity: TEntity): Promise<TResponse | null>;
    addMany(entites: Array<TEntity>): Promise<Array<TResponse>>;
    get(options: IFetchRequest<TEntity>, accountId?: string): Promise<IDataSourceResponse<TResponse>>;
    where(options: FindManyOptions<TEntity>): Promise<Array<TEntity>>;
    getOne(filtersRequest: Array<IFilter<TEntity, keyof TEntity>>): Promise<TResponse | null>;
    getById(id: string): Promise<TResponse | null>;
    updateRecord(entity: TEntity): Promise<TResponse>;
    partialUpdate(id: string, partialEntity: Partial<TEntity>): Promise<TResponse>;
    updateMany(entites: Array<TEntity>): Promise<Array<TResponse>>;
    deleteEntity(id: TEntity): Promise<void>;
    deleteMany(ids: Array<TEntity>): Promise<void>;
    findeOne(options: FindOneOptions<TEntity>): Promise<TResponse | null>;
    findOneById(id: string): Promise<TEntity | null>;
    getOneByQuery(options: Array<IFilter<TEntity, keyof TEntity>>): Promise<TEntity | null>
}