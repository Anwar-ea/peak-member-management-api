import { Module } from "../../entities";
import { IDataSourceResponse, IFetchRequest, IFilter, IModuleResponse } from "../../models";
import { HydratedDocument, ProjectionType, RootFilterQuery } from "mongoose";

export interface IModuleRepository {
    findOneByIdWithResponse(id: string): Promise<IModuleResponse | null>;
    getOneByQueryWithResponse(options: Array<IFilter<Module, keyof Module>>, getOnlyActive: boolean, dontGetDeleted: boolean, accountId?: string): Promise<IModuleResponse | null>;
    find(options?: RootFilterQuery<Module>, projection?: ProjectionType<Module>): Promise<Array<HydratedDocument<Module>>>;
    getPagedData(fetchRequest: IFetchRequest<Module>, getOnlyActive: boolean, dontGetDeleted: boolean, accountId?: string): Promise<IDataSourceResponse<IModuleResponse>>;
}