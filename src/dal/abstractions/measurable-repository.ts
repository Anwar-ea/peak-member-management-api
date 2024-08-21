import { Measurable } from "../../entities";
import { IMeasurableResponse } from "../../models";
import { IRepositoryBase } from "./repository-base";

export interface IMeasurableRepository extends IRepositoryBase<Measurable, IMeasurableResponse> {
    
}