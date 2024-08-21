import { IBusinessPlanResponse } from "./businessPlan-response";
import { IGoalResponse } from "./goal-response";
import { IMeasurableResponse } from "./measurable-response";
import { IAccountResponseBase } from "./response-base";

export interface IVisionResponse extends IAccountResponseBase {
    futureDate: Date;
    revenue: number;
    profit: number;
    businessPlanId: string;
    businessPlan?: IBusinessPlanResponse;
    goals?: IGoalResponse[];
    metrics?: IMeasurableResponse[];
}