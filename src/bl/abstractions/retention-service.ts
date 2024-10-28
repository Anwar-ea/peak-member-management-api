import { Retention } from "../../entities";
import { IRetentionRequest, IRetentionResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface IRetentionService extends IServiceBase<IRetentionRequest, IRetentionResponse, Retention> {
    
}