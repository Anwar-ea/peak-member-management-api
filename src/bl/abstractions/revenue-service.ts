
import { Revenue } from "../../entities/revenue";
import { IRevenueRequest } from "../../models/inerfaces/request/revenue-request";
import { IRevenueResponse } from "../../models/inerfaces/response/revenue-response";
import { IServiceBase } from "./service-base";

export interface IRevenueService extends IServiceBase<IRevenueRequest, IRevenueResponse, Revenue> {
    
}