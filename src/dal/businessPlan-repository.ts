import { FindOneOptions } from "typeorm";
import { BusinessPlan } from "../entities";
import { Actions, IDataSourceResponse, IFetchRequest, IFilter, IBusinessPlanResponse } from "../models";
import { IBusinessPlanRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { dataSource } from "./db/db-source";
import { injectable } from "tsyringe";

@injectable()
export class BusinessPlanRepository extends GenericRepository<BusinessPlan, IBusinessPlanResponse> implements IBusinessPlanRepository {

    constructor () {
        super(dataSource.getMongoRepository(BusinessPlan));
    }

    getOne = async (filtersRequest: Array<IFilter<BusinessPlan, keyof BusinessPlan>>): Promise<IBusinessPlanResponse | null> => await super.getOneByQueryWithResponse(filtersRequest)

    addRecord = async (entity: BusinessPlan): Promise<IBusinessPlanResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Add);

    addMany = async (entites: Array<BusinessPlan>): Promise<Array<IBusinessPlanResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Add);

    get = async (fetchRequest: IFetchRequest<BusinessPlan>, accountId?: string): Promise<IDataSourceResponse<IBusinessPlanResponse>> => await super.getPagedData(fetchRequest ?? {}, true, true, accountId);

    getById = async (id: string): Promise<IBusinessPlanResponse | null> => await super.findOneByIdWithResponse(id);

    updateRecord = async (entity: BusinessPlan): Promise<IBusinessPlanResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Update);

    updateMany = async (entites: Array<BusinessPlan>): Promise<Array<IBusinessPlanResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Update);

    deleteEntity = async (entity: BusinessPlan): Promise<void> => { await super.invokeDbOperationsWithResponse(entity, Actions.Delete); }

    deleteMany = async (entites: Array<BusinessPlan>): Promise<void> => { await super.invokeDbOperationsRangeWithResponse(entites, Actions.Delete); }

    findeOne = async (options: FindOneOptions<BusinessPlan>): Promise<IBusinessPlanResponse | null> => await super.firstOrDefaultWithResponse(options);
    
}