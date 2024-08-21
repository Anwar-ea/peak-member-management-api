import { IBusinessPlanResponse } from "./businessPlan-response";
import { IAccountResponseBase } from "./response-base";

export interface IMarketingStrategyResponse extends IAccountResponseBase {
    targetMarket: string;
    whoTheyAre: string;
    whereTheyAre: string;
    whatTheyAre: string;
    provenProcess: string;
    guarantee: string;
    businessPlanId: string;
    businessPlan?: IBusinessPlanResponse;
}