import { FindManyOptions } from "typeorm";
import { Module } from "../../entities";
import { IDataSourceResponse, IFetchRequest, IFilter, IModuleResponse } from "../../models";
import { IRepositoryBase } from "./repository-base";

export interface IModuleRepository {
    get(options: IFetchRequest<Module>, accountId?: string): Promise<IDataSourceResponse<IModuleResponse>>;
    where(options: FindManyOptions<Module>): Promise<Array<Module>>;
    getOne(filtersRequest: Array<IFilter<Module, keyof Module>>): Promise<IModuleResponse | null>;
    getById(id: string): Promise<IModuleResponse | null>;
}