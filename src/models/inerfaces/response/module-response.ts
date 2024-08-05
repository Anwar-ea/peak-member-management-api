import { IPrivilegeResponse } from "./privilege-response";
import { IResponseBase } from "./response-base";

export interface IModuleResponse extends IResponseBase {
    name: string;
    code: string;
    privilages?: Array<IPrivilegeResponse>;
}