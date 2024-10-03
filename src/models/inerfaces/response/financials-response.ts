import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";

export interface IFinancialsResponse extends IAccountResponseBase {
    retentionRate: number;
    annualGoal: number;
    year: number;
    userId: string;
    user?: IUserResponse
}