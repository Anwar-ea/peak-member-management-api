import { Role } from "../../entities";
import { IRoleResponse } from "../../models";
import { IRepositoryBase } from "./repository-base";

export interface IRoleRepository extends IRepositoryBase<Role, IRoleResponse> {

}