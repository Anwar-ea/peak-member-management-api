import { CustomMeasurableValue, customMeasurableValueModel } from "../entities";
import { ICustomMeasurableValueResponse } from "../models";
import { ICustomMeasurableValueRepository } from "./abstractions/custom-measurable-value-repository";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class CustomMeasurableValueRepository extends GenericRepository<CustomMeasurableValue, ICustomMeasurableValueResponse> implements ICustomMeasurableValueRepository {
    constructor () {
        super(customMeasurableValueModel);
    }
}