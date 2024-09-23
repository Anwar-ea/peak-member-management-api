import { inject, injectable } from "tsyringe";
import { IModuleRepository } from "../dal";
import { IModuleService } from "./abstractions";
import { IDataSourceResponse, IFetchRequest, IFilter, IModuleResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { Module } from "../entities";

@injectable()
export class ModuleService implements IModuleService {

    constructor(@inject('ModuleRepository') private readonly moduleRepository: IModuleRepository){}
    getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Module, keyof Module>>): Promise<IModuleResponse | null> {
        throw new Error("Method not implemented.");
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Module>): Promise<IDataSourceResponse<IModuleResponse>> {
        return await this.moduleRepository.getPagedData(fetchRequest, true, true);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IModuleResponse | null> {
        return await this.moduleRepository.findOneByIdWithResponse(id);
    }
}