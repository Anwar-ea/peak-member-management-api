import { FindOneOptions } from "typeorm";
import { Goal, Milestone } from "../entities";
import { Actions, IDataSourceResponse, IFetchRequest, IFilter, IGoalResponse } from "../models";
import { IGoalRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { dataSource } from "./db/db-source";
import { injectable } from "tsyringe";

@injectable()
export class GoalRepository extends GenericRepository<Goal, IGoalResponse> implements IGoalRepository {

    constructor () {
        super(dataSource.getMongoRepository(Goal));
    }

    getOne = async (filtersRequest: Array<IFilter<Goal, keyof Goal>>): Promise<IGoalResponse | null> => await super.getOneByQueryWithResponse(filtersRequest)

    addRecord = async (entity: Goal): Promise<IGoalResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Add);

    addMany = async (entites: Array<Goal>): Promise<Array<IGoalResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Add);

    get = async (fetchRequest: IFetchRequest<Goal>, accountId?: string): Promise<IDataSourceResponse<IGoalResponse>> => await super.getPagedData(fetchRequest ?? {}, true, true, accountId);

    getById = async (id: string): Promise<IGoalResponse | null> => await super.findOneByIdWithResponse(id);

    updateRecord = async (entity: Goal): Promise<IGoalResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Update);

    updateMany = async (entites: Array<Goal>): Promise<Array<IGoalResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Update);

    deleteEntity = async (entity: Goal): Promise<void> => {
        await super.invokeDbOperationsWithResponse(entity, Actions.Delete); 
    }

    deleteMany = async (entites: Array<Goal>): Promise<void> => { await super.invokeDbOperationsRangeWithResponse(entites, Actions.Delete); }

    findeOne = async (options: FindOneOptions<Goal>): Promise<IGoalResponse | null> => await super.firstOrDefaultWithResponse(options);
    
}