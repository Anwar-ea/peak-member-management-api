import { IMarketingStrategyResponse } from "./marketingStrategy-response";
import { IAccountResponseBase } from "./response-base";
import { IVisionResponse } from "./vision-response";

export interface IBusinessPlanResponse extends IAccountResponseBase {
    coreValues: string[];
    purpose: string;
    niche: string;
    threeYearVisionId: string;
    oneYearVisionId: string;
    marketingStrategyId: string;
    marketingStrategy?: IMarketingStrategyResponse;
    threeYearVision?: IVisionResponse;
    oneYearVision?: IVisionResponse;
}