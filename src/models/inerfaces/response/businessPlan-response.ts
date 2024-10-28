import { IMarketingStrategyResponse } from "./marketingStrategy-response";
import { IAccountResponseBase } from "./response-base";
import { IVisionResponse } from "./vision-response";

export interface IBusinessPlanResponse extends IAccountResponseBase {
    coreValues: string[];
    purpose: string;
    yourWhy: string;
    threeYearVision?: IVisionResponse;
    oneYearVision?: IVisionResponse;
}