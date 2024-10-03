import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";

export interface ICalenderEventResponse extends IAccountResponseBase {
    title: string;
    detail: string;
    eventDate: Date;
    userId: string;
    user?: IUserResponse;
}