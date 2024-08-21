import { IMarketingStrategyRequest } from "./marketingStrategy-request";
import { IVisionRequest } from "./vision-request";

export interface IBusinessPlanRequest {
    coreValues: string[];
    purpose: string;
    niche: string;
    marketingStrategy: IMarketingStrategyRequest;
    threeYearVision: IVisionRequest;
    oneYearVision: IVisionRequest;
}