import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";

export interface ICallNoteResponse extends IAccountResponseBase {
    note: string;
    userId: string;
    user?: IUserResponse
}