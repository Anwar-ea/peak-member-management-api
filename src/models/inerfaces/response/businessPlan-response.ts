import { IMarketingStrategyResponse } from "./marketingStrategy-response";
import { IAccountResponseBase } from "./response-base";
import { IUserResponse } from "./user-response";
import { IVisionResponse } from "./vision-response";

export interface IBusinessPlanResponse extends IAccountResponseBase {
    coreValues: string[];
    purpose: string;
    yourWhy: string;
    threeYearVision?: IVisionResponse;
    oneYearVision?: IVisionResponse;
    userId: string;
    user?: IUserResponse;
}