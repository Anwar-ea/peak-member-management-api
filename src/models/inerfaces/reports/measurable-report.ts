import { Retention } from "../../../entities";
import { IMeasurableResponse, IRetentionResponse, IRevenueResponse, IUserResponse } from "../response";

export interface IMeasurableReport extends IUserResponse {
    measurables: Array<IMeasurableResponse & { average?: number; cumulative?: number;}>;
    revenues: Array<IRevenueResponse>;
     retentions: Array<IRetentionResponse>;
}