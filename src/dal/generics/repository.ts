import { Repository, SelectQueryBuilder, FindOptionsWhere, QueryRunner, FindOneOptions, FindManyOptions, Equal, MongoRepository } from 'typeorm';
import { EntityBase } from '../../entities/base-entities/entity-base';
import { Actions, IDataSourceResponse, IFetchRequest, IFilter, PagedRequest } from '../../models';
import { injectable } from 'tsyringe';
import { AccountEntityBase } from '../../entities/base-entities/account-entity-base';
import { buildQuery, queryOptionsMapper, setSaurceDataResponse } from '../../utility';
import { IToResponseBase } from '../../entities/abstractions/to-response-base';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

@injectable()
export class GenericRepository<TEntity extends (AccountEntityBase | EntityBase) & IToResponseBase<TEntity, TResponse>, TResponse>  {
    
    constructor(private readonly repository: MongoRepository<TEntity>){

    }

    async entityCount(options?: FindOptionsWhere<TEntity> | Array<FindOptionsWhere<TEntity>>): Promise<number> {
        return this.repository.count({ where: options });
    }

    async beginTransaction(): Promise<QueryRunner> {
        await this.repository.queryRunner!.startTransaction();
        return this.repository.queryRunner!;
    }

    async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.rollbackTransaction();
    }

    async commitTransaction(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.commitTransaction();
    }

    async firstOrDefault(options: FindOneOptions<TEntity>): Promise<TEntity | null> {
        return await this.repository.findOne(options);
    }

    async firstOrDefaultWithResponse(options: FindOneOptions<TEntity>): Promise<TResponse | null> {
        let entity = await this.repository.findOne(options);
        return entity ? entity.toResponse(entity) : null;
    }

    async getOneByQuery(options: Array<IFilter<TEntity, keyof TEntity>>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): Promise<TEntity | null> {
        return await this.repository.findOne({where: queryOptionsMapper(options, getOnlyActive, dontGetDeleted, accountId)});
    }

    async getOneByQueryWithResponse(options: Array<IFilter<TEntity, keyof TEntity>>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): Promise<TResponse | null> {
        let entity = await this.repository.findOne({where: queryOptionsMapper(options, getOnlyActive, dontGetDeleted, accountId)});
        return entity ? entity.toResponse(entity) : null;
    }

    async where(options?: FindManyOptions<TEntity>): Promise<Array<TEntity>> {
        return await this.repository.find(options);
    }

    async whereWithResponse(options?: FindManyOptions<TEntity>): Promise<Array<TResponse>> {
        return (await this.repository.find(options)).map(x => x.toResponse(x));
    }

    async getAccountRecords(accountId: string, options?: FindManyOptions<TEntity>): Promise<Array<TEntity>> {
        const whereClause: FindOptionsWhere<AccountEntityBase> = { accountId };
        if (options) {
            options = { ...options, where: { ...(options.where as FindOptionsWhere<TEntity>), ...whereClause } }
        }
        else {
            options = { where: whereClause as FindOptionsWhere<TEntity> };
        }
        return await this.repository.find(options);
    }

    async singleOrDefault(options?: FindOptionsWhere<TEntity>): Promise<TEntity | null> {
        const entities = await this.repository.find({ where: options });
        if (entities.length === 1) return entities[0];
        else if (entities.length > 1) throw new Error('Entity exists more than once.');
        else return null;
    }

    async singleOrDefaultWithResponse(options?: FindOptionsWhere<TEntity>): Promise<TResponse | null> {
        const entity = await this.singleOrDefault(options);
        return entity ? entity.toResponse(entity) : null;
    }

    async findOneById(id: string): Promise<TEntity | null> {
        return await this.repository.findOneBy({ _id: id as any });
    }

    async findOneByIdWithResponse(id: string): Promise<TResponse | null> {
        let entity = await this.repository.findOneBy({ _id: id as any });
        return entity ? entity.toResponse(entity) : null;
    }

    async max(): Promise<TEntity | null> {
        const entities = await this.repository.find();
        return entities.reduce((max, entity) => (max.createdAt > entity.createdAt ? max : entity), entities[0]);
    }

    async getPagedData(fetchRequest: IFetchRequest<TEntity>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): Promise<IDataSourceResponse<TResponse>> {
        
        if (!fetchRequest.pagedListRequest) fetchRequest.pagedListRequest = new PagedRequest();
        
        const query = buildQuery(fetchRequest, getOnlyActive, dontGetDeleted, accountId);
        const entities = await this.repository.find(query);
        const totalRecords = await this.entityCount(query.where);
        return setSaurceDataResponse<TEntity, TResponse>(entities, totalRecords, fetchRequest?.pagedListRequest?.pageSize, fetchRequest?.pagedListRequest?.pageNo);
    }

    async partialUpdate(id: string, partialEntity: QueryDeepPartialEntity<TEntity>): Promise<TResponse> {
        try {
            const result = await this.repository.update(id, partialEntity);
            let updatedRecord = await this.findOneById(id); 
            if(result.affected !== 1 || !updatedRecord) throw new Error(`An error occurred while updating`);
            return updatedRecord.toResponse(updatedRecord);
        } catch (error) {
            throw new Error(`An error occurred while updating`);
        }
    }

    async invokeDbOperations(entity: TEntity, action: Actions): Promise<TEntity> {
        switch (action) {
            case Actions.Add:
                return await this.add(entity);
            case Actions.Delete:
                return await this.deleteRecord(entity);
            case Actions.Update:
                return await this.updateEntity(entity);
            default:
                return entity;
        }
    }
    
    async invokeDbOperationsWithResponse(entity: TEntity, action: Actions): Promise<TResponse> {
        return entity.toResponse((await this.invokeDbOperations(entity, action)) )
    }

    async invokeDbOperationsRange(entities: TEntity[], action: Actions): Promise<TEntity[]> {
        switch (action) {
            case Actions.Add:
                return this.addRange(entities);
            case Actions.Delete:
                return this.deleteRange(entities);
            case Actions.Update:
                return this.updateRange(entities);
            default:
                return entities;
        }
    }

    async invokeDbOperationsRangeWithResponse(entities: TEntity[], action: Actions): Promise<TResponse[]> {
        return (await this.invokeDbOperationsRange(entities, action)).map(x=> x.toResponse(x))
    }

    private async add(entity: TEntity): Promise<TEntity> {
        return await this.repository.save(entity);
    }

    private async addRange(entities: TEntity[]): Promise<TEntity[]> {
        return await this.repository.save(entities);
    }

    private async updateEntity(entity: TEntity): Promise<TEntity> {
        await this.repository.save(entity);
        return entity;
    }

    private async updateRange(entities: TEntity[]): Promise<TEntity[]> {
        return this.repository.save(entities);
    }

    private async deleteRecord(entity: TEntity): Promise<TEntity> {
        await this.repository.remove(entity);
        return entity;
    }

    private async deleteRange(entities: TEntity[]): Promise<TEntity[]> {
        await this.repository.remove(entities);
        return entities;
    }

    queryBuilder(alias: string): SelectQueryBuilder<TEntity> {
        return this.repository.createQueryBuilder(alias);
    }
}
