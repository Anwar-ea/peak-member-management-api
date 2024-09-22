import { IGoalResponse } from "./goal-response";
import { IMeasurableResponse } from "./measurable-response";

export interface IVisionResponse {
    futureDate: Date;
    revenue: number;
    profit: number;
    goalIds: Array<string>;
    metricIds: Array<string>;
    goals?: IGoalResponse[];
    metrics?: IMeasurableResponse[];
}