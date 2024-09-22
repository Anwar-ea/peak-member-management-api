import { FindOneOptions } from "typeorm";
import { ToDo } from "../entities";
import { Actions, IDataSourceResponse, IFetchRequest, IFilter, IToDoResponse } from "../models";
import { IToDoRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { dataSource } from "./db/db-source";
import { injectable } from "tsyringe";

@injectable()
export class ToDoRepository extends GenericRepository<ToDo, IToDoResponse> implements IToDoRepository {

    constructor () {
        super(dataSource.getMongoRepository(ToDo));
    }

    getOne = async (filtersRequest: Array<IFilter<ToDo, keyof ToDo>>): Promise<IToDoResponse | null> => await super.getOneByQueryWithResponse(filtersRequest)

    addRecord = async (entity: ToDo): Promise<IToDoResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Add);

    addMany = async (entites: Array<ToDo>): Promise<Array<IToDoResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Add);

    get = async (fetchRequest: IFetchRequest<ToDo>, accountId?: string): Promise<IDataSourceResponse<IToDoResponse>> => await super.getPagedData(fetchRequest ?? {}, true, true, accountId);

    getById = async (id: string): Promise<IToDoResponse | null> => await super.findOneByIdWithResponse(id);

    updateRecord = async (entity: ToDo): Promise<IToDoResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Update);

    updateMany = async (entites: Array<ToDo>): Promise<Array<IToDoResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Update);

    deleteEntity = async (entity: ToDo): Promise<void> => { await super.invokeDbOperationsWithResponse(entity, Actions.Delete); }

    deleteMany = async (entites: Array<ToDo>): Promise<void> => { await super.invokeDbOperationsRangeWithResponse(entites, Actions.Delete); }

    findeOne = async (options: FindOneOptions<ToDo>): Promise<IToDoResponse | null> => await super.firstOrDefaultWithResponse(options);
    
}