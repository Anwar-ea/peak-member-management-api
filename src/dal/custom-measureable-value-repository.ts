import { CustomMeasureableValue, customMeasureableValueModel } from "../entities";
import { ICustomMeasureableValueResponse } from "../models";
import { ICustomMeasureableValueRepository } from "./abstractions/custom-measureable-value-repository";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class CustomMeasureableValueRepository extends GenericRepository<CustomMeasureableValue, ICustomMeasureableValueResponse> implements ICustomMeasureableValueRepository {
    constructor () {
        super(customMeasureableValueModel);
        this.populate = []
    }
}