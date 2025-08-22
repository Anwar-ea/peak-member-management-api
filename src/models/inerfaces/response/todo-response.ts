import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";

export interface IToDoResponse extends IAccountResponseBase {
    todo: string;
    details?: string;
    userId: string;
    completed: boolean;
    dueDate?: Date;
    user?: IUserResponse;
    priority: number;
}