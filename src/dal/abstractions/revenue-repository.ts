import { IRepositoryBase } from "./repository-base";
import { Revenue } from "../../entities/revenue";
import { IRevenueResponse } from "../../models/inerfaces/response/revenue-response";

export interface IRevenueRepository extends IRepositoryBase<Revenue, IRevenueResponse> {
    
}