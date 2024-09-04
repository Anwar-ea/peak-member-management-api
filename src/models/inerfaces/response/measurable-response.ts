import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";
import { IVisionResponse } from "./vision-response";

export interface IMeasurableResponse extends IAccountResponseBase {
    name: string;
    unit: string;
    goal: number;
    goalMetric: number;
    showAverage: boolean;
    showCumulative: boolean;
    applyFormula: boolean;
    averageStartDate?: Date;
    cumulativeStartDate?: Date;
    formula?: string;
    accountableId: string;
    visionId?: string;
    vision?: IVisionResponse;
    accountable?: IUserResponse
}