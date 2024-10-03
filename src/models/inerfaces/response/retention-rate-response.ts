import { IAccountResponseBase } from "./response-base";

export interface IRetentionRateResponse extends IAccountResponseBase {
    retentionRate: number;
}