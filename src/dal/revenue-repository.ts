import { Revenue, revenueModel } from "../entities/revenue";
import { IRevenueResponse } from "../models/inerfaces/response/revenue-response";
import { IRevenueRepository } from "./abstractions/revenue-repository";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class RevenueRepository extends GenericRepository<Revenue, IRevenueResponse> implements IRevenueRepository {
    constructor () {
        super(revenueModel);
        this.populate = ['user']
    }
}