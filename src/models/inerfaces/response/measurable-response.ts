import { CustomGoalType, Goals, GoalUnits } from "../../enums/goals.enum";
import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";
import { IVisionResponse } from "./vision-response";

export interface IMeasurableResponse extends IAccountResponseBase {
    name: string;
    unit: GoalUnits;
    goal: Goals;
    customGoalType?: CustomGoalType
    goalMetric?: number;
    goalMetricRange?: { start: number, end: number }
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