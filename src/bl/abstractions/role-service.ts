import { Role } from "../../entities";
import { IRoleRequest, IRoleResponse } from "../../models";
import { IDropdownResponse } from "../../models/inerfaces/response/dropdown-response";
import { IServiceBase } from "./service-base";

export interface IRoleService extends IServiceBase<IRoleRequest, IRoleResponse, Role> {
    dropdown(accountId: string): Promise<IDropdownResponse[]>;
}