import { IMeasurableResponse, IRevenueResponse, IUserResponse } from "../response";

export interface IMeasurableReport extends IUserResponse {
    measurables: Array<IMeasurableResponse & { averageRevenue?: number; cumulativeRevenue?: number;}>;
    revenues: Array<IRevenueResponse>;
}