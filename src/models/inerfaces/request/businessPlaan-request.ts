import { IMarketingStrategyRequest } from "./marketingStrategy-request";
import { IVisionRequest } from "./vision-request";

export interface IBusinessPlanRequest {
    coreValues: string[];
    purpose: string;
    yourWhy: string;
    threeYearVision: IVisionRequest;
    oneYearVision: IVisionRequest;
    userId: string;
}