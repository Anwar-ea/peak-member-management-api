import { CalenderEvent, calenderEventModel } from "../entities";
import { ICalenderEventResponse } from "../models";
import { ICalenderEventRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class CalenderEventRepository extends GenericRepository<CalenderEvent, ICalenderEventResponse> implements ICalenderEventRepository {
    constructor () {
        super(calenderEventModel);
        this.populate = ['user']
    }
}