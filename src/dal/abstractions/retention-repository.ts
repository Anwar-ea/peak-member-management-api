import { IRepositoryBase } from "./repository-base";
import { Retention } from "../../entities";
import { IRetentionResponse } from "../../models";

export interface IRetentionRepository extends IRepositoryBase<Retention, IRetentionResponse> {
    
}