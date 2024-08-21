import { IGoalRequest } from "./goal-request";
import { IMeasurableRequest } from "./measurable-request";

export interface IVisionRequest {
    futureDate: Date;
    revenue: number;
    profit: number;
    goals: IGoalRequest[];
    metrics: IMeasurableRequest[];
}