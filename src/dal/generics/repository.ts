import { EntityBase } from '../../entities/base-entities/entity-base';
import { IDataSourceResponse, IExtendedMongoModel, IFetchRequest, IFilter, PagedRequest } from '../../models';
import { injectable } from 'tsyringe';
import { AccountEntityBase } from '../../entities/base-entities/account-entity-base';
import { buildMongoQuery, mongoQueryOptionsMapper, setSaurceDataResponse } from '../../utility';
import { IToResponseBase } from '../../entities/abstractions/to-response-base';
import { AggregateOptions, HydratedDocument, PipelineStage, ProjectionType, RootFilterQuery, Types, UpdateWriteOpResult } from 'mongoose';
import { IDropdownResponse } from '../../models/inerfaces/response/dropdown-response';

@injectable()
export class GenericRepository<TEntity extends (AccountEntityBase | EntityBase) & IToResponseBase<TEntity, TResponse>, TResponse>  {
    
    populate: Array<string> = [];

    constructor(private readonly model: IExtendedMongoModel<TEntity, TResponse>){

    }

    async count(filter?: RootFilterQuery<TEntity>): Promise<number> {
        return this.model.countDocuments(filter);
    }

    // async beginTransaction(): Promise<QueryRunner> {
    //     await this.model.r!.startTransaction();
    //     return this.model.queryRunner!;
    // }

    // async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
    //     await queryRunner.rollbackTransaction();
    // }

    // async commitTransaction(queryRunner: QueryRunner): Promise<void> {
    //     await queryRunner.commitTransaction();
    // }

    async findOne(options: RootFilterQuery<TEntity>, projection?: ProjectionType<TEntity> | null): Promise<TEntity | null> {
        return await this.model.findOne(options, projection).populate(this.populate);
    }

    async firstOrDefaultWithResponse(options: RootFilterQuery<TEntity>): Promise<TResponse | null> {
        let entity = await this.model.findOne(options).populate(this.populate);
        return entity ? entity.toResponse(entity) : null;
    }

    async getOneByQuery(options: Array<IFilter<TEntity, keyof TEntity>>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): Promise<HydratedDocument<TEntity> | null> {
        return await this.model.findOne(mongoQueryOptionsMapper(options, false, false)).populate(this.populate);
    }

    async getOneByQueryWithResponse(options: Array<IFilter<TEntity, keyof TEntity>>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): Promise<TResponse | null> {
        let entity = await this.getOneByQuery(options, getOnlyActive, dontGetDeleted ,accountId);
        return entity ? entity.toResponse(entity) : null;
    }

    async find(options?: RootFilterQuery<TEntity>, projection?: ProjectionType<TEntity>): Promise<Array<HydratedDocument<TEntity>>> {
        return await this.model.find(options ?? {}, projection).populate(this.populate);
    }

    async findWithResponse(options?: RootFilterQuery<TEntity>): Promise<Array<TResponse>> {
        return (await this.find(options)).map(x => x.toResponse(x));
    }

    async getAccountRecords(accountId: string, options?: RootFilterQuery<TEntity>): Promise<Array<TEntity>> {
        if (options) {
            options = {...options, accountId: accountId};
        }
        else {
            options = {accontId: accountId};
        }
        return await this.model.find(options).populate(this.populate);
    }

    async singleOrDefault(options?: RootFilterQuery<TEntity>): Promise<TEntity | null> {
        const entities = await this.find(options ?? {});
        if (entities.length === 1) return entities[0];
        else if (entities.length > 1) throw new Error('Entity exists more than once.');
        else return null;
    }

    async singleOrDefaultWithResponse(options?: RootFilterQuery<TEntity>): Promise<TResponse | null> {
        const entity = await this.singleOrDefault(options);
        return entity ? entity.toResponse(entity) : null;
    }

    async findOneById(id: string): Promise<TEntity | null> {
        return await this.model.findById(new Types.ObjectId(id)).populate(this.populate);
    }

    async findOneByIdWithResponse(id: string): Promise<TResponse | null> {
        let entity = await this.findOneById(id);
        return entity ? entity.toResponse(entity) : null;
    }

    async max(): Promise<TEntity | null> {
        const entities = await this.model.find({});
        return entities.reduce((max, entity) => (max.createdAt > entity.createdAt ? max : entity), entities[0]);
    }

    async getPagedData(fetchRequest: IFetchRequest<TEntity>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, accountId?: string): Promise<IDataSourceResponse<TResponse>> {
        
        if (!fetchRequest.pagedListRequest) fetchRequest.pagedListRequest = new PagedRequest();
        
        const {query, skip, sort, limit, populate} = buildMongoQuery(fetchRequest, getOnlyActive, dontGetDeleted, accountId);
        const entities = await this.model.find(query).populate(this.populate).populate(populate).skip(skip).limit(limit).sort(sort);
        const totalRecords = await this.count(query);
        return setSaurceDataResponse<TEntity, TResponse>(entities, totalRecords, fetchRequest?.pagedListRequest?.pageSize, fetchRequest?.pagedListRequest?.pageNo);
    }

    async update(id: string, partialEntity: Partial<TEntity>): Promise<TResponse> {
        try {
            const result = await this.model.findByIdAndUpdate(id, partialEntity, {new: true}).populate(this.populate);
            if(result) return result.toResponse(result);
            else throw new Error(`No entity found with id: ${id}`);
        } catch (error) {
            throw new Error(`An error occurred while updating`);
        }
    }

    async add(entity: TEntity): Promise<TEntity> {
        return (await (new this.model(entity)).save()).toInstance();
    }

    async addRange(entities: TEntity[]): Promise<Array<HydratedDocument<TEntity>>> {
        return await this.model.insertMany(entities);
    }

    async updateRange(entities: Partial<TEntity>[], filter: RootFilterQuery<TEntity>): Promise<UpdateWriteOpResult> {
        return await this.model.updateMany(entities, filter).populate(this.populate);
    }

    async delete(id: string): Promise<TEntity | undefined> {
        let result = await this.model.findByIdAndDelete(new Types.ObjectId(id)).populate(this.populate);
        return result?.toObject();
    }

    async deleteRange(entities: RootFilterQuery<TEntity>): Promise<TEntity[]> {
        await this.model.deleteMany(entities);
        return entities;
    }

    async dropdown(accountId: string, fieldName: string) : Promise<IDropdownResponse[]> {
        const filter = { accountId: accountId } as RootFilterQuery<TEntity>;
        const entities = await this.model.find(filter).select(fieldName);
        const dropdownResponse = entities.map(entity => ({
            id: entity._id.toString(),
            name: entity.get(fieldName)
        })) as IDropdownResponse[];

        return dropdownResponse;
    }

    async aggregate<T>(pipeline: PipelineStage[], aggregateOptions?: AggregateOptions) : Promise<Array<T>> {
        return await this.model.aggregate<T>(pipeline, aggregateOptions);
    }
}
