import { injectable } from "tsyringe";
import { IPrivilegeRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import {  Privilege } from "../entities";
import { IDataSourceResponse, IFetchRequest, IFilter, IPrivilegeResponse } from "../models";
import { dataSource } from "./db/db-source";

@injectable()
export class PrivilegeRepository extends GenericRepository<Privilege, IPrivilegeResponse> implements IPrivilegeRepository {

    constructor(){
        super(dataSource.getMongoRepository(Privilege));
    }
    getOne = async (filtersRequest: Array<IFilter<Privilege, keyof Privilege>>): Promise<IPrivilegeResponse | null> => await super.getOneByQueryWithResponse(filtersRequest);

    get = async (fetchRequest: IFetchRequest<Privilege> ): Promise<IDataSourceResponse<IPrivilegeResponse>> => await super.getPagedData(fetchRequest ?? {});

    getById = async (id: string): Promise<IPrivilegeResponse | null> => await super.findOneByIdWithResponse(id);
}