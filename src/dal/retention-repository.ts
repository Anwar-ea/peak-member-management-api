import { Retention, retentionModel } from "../entities";
import { IRetentionResponse } from "../models";
import { IRetentionRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class RetentionRepository extends GenericRepository<Retention, IRetentionResponse> implements IRetentionRepository {

    constructor () {
        super(retentionModel);
        this.populate = ['user']
    }

}