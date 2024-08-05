import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";

export interface IToDoResponse extends IAccountResponseBase {
    todo: string;
    details: string;
    userId: string;
    dueDate: Date;
    user?: IUserResponse
}