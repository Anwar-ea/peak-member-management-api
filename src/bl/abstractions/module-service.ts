import { Module } from "../../entities";
import { IDataSourceResponse, IFetchRequest, IFilter, IModuleResponse } from "../../models";
import { ITokenUser } from "../../models/inerfaces/tokenUser";
import { IServiceBase } from "./service-base";

export interface IModuleService {
    get(contextUser?: ITokenUser, fetchRequest?: IFetchRequest<Module>): Promise<IDataSourceResponse<IModuleResponse>>;
    getOne(contextUser?: ITokenUser, filtersRequest?: Array<IFilter<Module, keyof Module>>): Promise<IModuleResponse | null>;
    getById(id: string, contextUser?: ITokenUser): Promise<IModuleResponse | null>;
}