import { IMeasurableResponse, IUserResponse } from "../response";

export interface IMeasurableReport {
    user: IUserResponse;
    measurable: IMeasurableResponse;
    averageRevenue?: number;
    cumulativeRevenue?: number;
}