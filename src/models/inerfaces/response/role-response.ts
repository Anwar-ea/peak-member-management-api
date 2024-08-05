import { IPrivilegeResponse } from "./privilege-response";
import { IAccountResponseBase, IResponseBase } from "./response-base";

export interface IRoleResponse extends IResponseBase {
    name: string;
    code: string;
    accountId?: string;
    privilages?: Array<IPrivilegeResponse>;
}