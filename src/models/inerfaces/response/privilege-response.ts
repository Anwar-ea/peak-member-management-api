import { IModuleResponse } from "./module-response";
import { IResponseBase } from "./response-base";
import { IRoleResponse } from "./role-response";

export interface IPrivilegeResponse extends IResponseBase {
    name: string;
    code: string;
}