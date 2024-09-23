import { Measurable, measurableModel } from "../entities";
import { IMeasurableResponse } from "../models";
import { IMeasurableRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class MeasurableRepository extends GenericRepository<Measurable, IMeasurableResponse> implements IMeasurableRepository {

    constructor () {
        super(measurableModel);
        this.populate = ['accountable']
    }
    
}