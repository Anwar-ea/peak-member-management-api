import { injectable } from "tsyringe";
import { EntityManager } from "typeorm";
import { Module } from "../entities";
import { IModuleRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { IDataSourceResponse, IFetchRequest, IFilter, IModuleResponse } from "../models";
import { dataSource } from "./db/db-source";

@injectable()
export class ModuleRepository extends GenericRepository<Module, IModuleResponse> implements IModuleRepository {
    constructor(){
        super(dataSource.getMongoRepository(Module));
    }
    getOne = async (filtersRequest: Array<IFilter<Module, keyof Module>>): Promise<IModuleResponse | null> => await super.getOneByQueryWithResponse(filtersRequest);

    get = async (fetchRequest: IFetchRequest<Module> ): Promise<IDataSourceResponse<IModuleResponse>> => await super.getPagedData(fetchRequest ?? {});

    getById = async (id: string): Promise<IModuleResponse | null> => await super.findOneByIdWithResponse(id);
}