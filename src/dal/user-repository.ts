import { injectable } from "tsyringe";
import { EntityManager, FindManyOptions, FindOneOptions } from "typeorm";
import { User } from "../entities";
import { IUserRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { Actions, IDataSourceResponse, IFetchRequest, IFilter, IUserResponse } from "../models";
import { dataSource } from "./db/db-source";

@injectable()
export class UserRepository extends GenericRepository<User,IUserResponse> implements IUserRepository {
    constructor(){
        super(dataSource.getMongoRepository(User));
    }
    getOne = async (filtersRequest: Array<IFilter<User, keyof User>>): Promise<IUserResponse | null> => await super.getOneByQueryWithResponse(filtersRequest)

    addRecord = async (entity: User): Promise<IUserResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Add);

    addMany = async (entites: Array<User>): Promise<Array<IUserResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Add);

    get = async (fetchRequest: IFetchRequest<User>, accountId?: string): Promise<IDataSourceResponse<IUserResponse>> => await super.getPagedData(fetchRequest ?? {}, true, true, accountId);

    getById = async (id: string): Promise<IUserResponse | null> => await super.findOneByIdWithResponse(id);

    updateRecord = async (entity: User): Promise<IUserResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Update);

    updateMany = async (entites: Array<User>): Promise<Array<IUserResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Update);

    deleteEntity = async (entity: User): Promise<void> => { await super.invokeDbOperationsWithResponse(entity, Actions.Delete); }

    deleteMany = async (entites: Array<User>): Promise<void> => { await super.invokeDbOperationsRangeWithResponse(entites, Actions.Delete); }

    findeOne = async (options: FindOneOptions<User>): Promise<IUserResponse | null> => await super.firstOrDefaultWithResponse(options);
}