import { injectable } from "tsyringe";
import { IPrivilegeRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import {  Privilege, PrivilegeModel } from "../entities";
import { IPrivilegeResponse } from "../models";

@injectable()
export class PrivilegeRepository extends GenericRepository<Privilege, IPrivilegeResponse> implements IPrivilegeRepository {

    constructor(){
        super(PrivilegeModel);
    }
}