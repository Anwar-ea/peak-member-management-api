import { injectable } from "tsyringe";
import { Role, roleModel } from "../entities";
import { IRoleRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import {  IRoleResponse } from "../models";

@injectable()
export class RoleRepository extends GenericRepository<Role, IRoleResponse> implements IRoleRepository {
    constructor(){
        super(roleModel);
        this.populate = ['account', 'privileges']
    }


}