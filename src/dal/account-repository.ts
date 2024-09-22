import { injectable } from "tsyringe";
import { IAccountRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { Account } from "../entities";
import { FindOneOptions } from "typeorm";
import { Actions, IAccountResponse, IDataSourceResponse, IFetchRequest, IFilter } from "../models";
import { dataSource } from "./db/db-source";

@injectable()
export class AccountRepository extends GenericRepository<Account, IAccountResponse> implements IAccountRepository {
    constructor(){
        super(dataSource.getMongoRepository(Account));
    }
    getOne = async (filtersRequest: Array<IFilter<Account, keyof Account>>): Promise<IAccountResponse | null> => await super.getOneByQueryWithResponse(filtersRequest)

    addRecord = async (entity: Account): Promise<IAccountResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Add);

    addMany = async (entites: Array<Account>): Promise<Array<IAccountResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Add);

    get = async (fetchRequest: IFetchRequest<Account>, accountId?: string): Promise<IDataSourceResponse<IAccountResponse>> => await super.getPagedData(fetchRequest ?? {}, true, true, accountId);

    getById = async (id: string): Promise<IAccountResponse | null> => await super.findOneByIdWithResponse(id);

    updateRecord = async (entity: Account): Promise<IAccountResponse> => await super.invokeDbOperationsWithResponse(entity, Actions.Update);

    updateMany = async (entites: Array<Account>): Promise<Array<IAccountResponse>> => await super.invokeDbOperationsRangeWithResponse(entites, Actions.Update);

    deleteEntity = async (entity: Account): Promise<void> => { await super.invokeDbOperationsWithResponse(entity, Actions.Delete); }

    deleteMany = async (entites: Array<Account>): Promise<void> => { await super.invokeDbOperationsRangeWithResponse(entites, Actions.Delete); }

    findeOne = async (options: FindOneOptions<Account>): Promise<IAccountResponse | null> => await super.firstOrDefaultWithResponse(options);

}