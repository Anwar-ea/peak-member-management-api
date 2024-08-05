import { Role } from "../../entities";
import { IRoleRequest, IRoleResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface IRoleService extends IServiceBase<IRoleRequest, IRoleResponse, Role> {
    
}