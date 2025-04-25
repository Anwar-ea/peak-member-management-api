import { Retention } from "../../../entities";
import { ICustomMeasurableValueResponse, IMeasurableResponse, IRetentionResponse, IRevenueResponse, IUserResponse } from "../response";

export interface IMeasurableReport extends IUserResponse {
    measurables: Array<IMeasurableResponse & { average?: number; cumulative?: number; customValues: Array<ICustomMeasurableValueResponse>}>;
    revenues: Array<IRevenueResponse>;
    retentions: Array<IRetentionResponse>;
}