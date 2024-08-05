import { injectable } from "tsyringe";
import { EntityManager, FindManyOptions, FindOneOptions } from "typeorm";
import { Role } from "../entities";
import { IRoleRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { Actions, IDataSourceResponse, IFetchRequest, IFilter, IRoleResponse } from "../models";
import { dataSource } from "./db/db-source";

@injectable()
export class RoleRepository extends GenericRepository<Role, IRoleResponse> implements IRoleRepository {
    constructor(){
        super(dataSource.getRepository(Role));
    }
    getOne = async (filtersRequest: Array<IFilter<Role, keyof Role>>): Promise<IRoleResponse | null> => await super.getOneByQueryWithResponse(filtersRequest)

    addRecord = async (entity: Role): Promise<IRoleResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Add);

    addMany = async (entites: Array<Role>): Promise<Array<IRoleResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Add);

    get = async (fetchRequest: IFetchRequest<Role>, accountId?: string): Promise<IDataSourceResponse<IRoleResponse>> => await super.getPagedData(fetchRequest ?? {}, true, true, accountId);

    getById = async (id: string): Promise<IRoleResponse | null> => await this.findOneByIdWithResponse(id);

    updateRecord = async (entity: Role): Promise<IRoleResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Update);

    updateMany = async (entites: Array<Role>): Promise<Array<IRoleResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Update);

    deleteEntity = async (entity: Role): Promise<void> => { await super.invokeDbOperationsWithResponse(entity, Actions.Delete); }

    deleteMany = async (entites: Array<Role>): Promise<void> => { await super.invokeDbOperationsRangeWithResponse(entites, Actions.Delete); }

    findeOne = async (options: FindOneOptions<Role>): Promise<IRoleResponse | null> => await super.firstOrDefaultWithResponse(options);

}