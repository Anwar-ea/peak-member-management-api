import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";

export interface IRevenueResponse extends IAccountResponseBase {
    startOfWeek: Date;
    endOfWeek: Date;
    week: number;
    year: number;
    revenue: number
    userId: string;
    user?: IUserResponse;
}