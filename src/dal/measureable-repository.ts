import { FindOneOptions } from "typeorm";
import { Measurable } from "../entities";
import { Actions, IDataSourceResponse, IFetchRequest, IFilter, IMeasurableResponse } from "../models";
import { IMeasurableRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { dataSource } from "./db/db-source";
import { injectable } from "tsyringe";

@injectable()
export class MeasurableRepository extends GenericRepository<Measurable, IMeasurableResponse> implements IMeasurableRepository {

    constructor () {
        super(dataSource.getMongoRepository(Measurable));
    }

    getOne = async (filtersRequest: Array<IFilter<Measurable, keyof Measurable>>): Promise<IMeasurableResponse | null> => await super.getOneByQueryWithResponse(filtersRequest)

    addRecord = async (entity: Measurable): Promise<IMeasurableResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Add);

    addMany = async (entites: Array<Measurable>): Promise<Array<IMeasurableResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Add);

    get = async (fetchRequest: IFetchRequest<Measurable>, accountId?: string): Promise<IDataSourceResponse<IMeasurableResponse>> => await super.getPagedData(fetchRequest ?? {}, true, true, accountId);

    getById = async (id: string): Promise<IMeasurableResponse | null> => await super.findOneByIdWithResponse(id);

    updateRecord = async (entity: Measurable): Promise<IMeasurableResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Update);

    updateMany = async (entites: Array<Measurable>): Promise<Array<IMeasurableResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Update);

    deleteEntity = async (entity: Measurable): Promise<void> => { await super.invokeDbOperationsWithResponse(entity, Actions.Delete); }

    deleteMany = async (entites: Array<Measurable>): Promise<void> => { await super.invokeDbOperationsRangeWithResponse(entites, Actions.Delete); }

    findeOne = async (options: FindOneOptions<Measurable>): Promise<IMeasurableResponse | null> => await super.firstOrDefaultWithResponse(options);
    
}