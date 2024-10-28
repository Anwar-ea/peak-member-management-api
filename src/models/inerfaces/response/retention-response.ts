import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";

export interface IRetentionResponse extends IAccountResponseBase {
    retained: number;
    appointments: number;
    userId: string;
    startOfWeek: Date;
    endOfWeek: Date;
    week: number;
    year: number;
    user?: IUserResponse
}