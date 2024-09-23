import { injectable } from "tsyringe";
import { Module, moduleModel } from "../entities";
import { IModuleRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { IModuleResponse } from "../models";

@injectable()
export class ModuleRepository extends GenericRepository<Module, IModuleResponse> implements IModuleRepository {
    constructor(){
        super(moduleModel);
    }

}