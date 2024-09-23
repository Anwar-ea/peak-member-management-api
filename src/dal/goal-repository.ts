import { Goal, goalModel } from "../entities";
import { IGoalResponse } from "../models";
import { IGoalRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class GoalRepository extends GenericRepository<Goal, IGoalResponse> implements IGoalRepository {

    constructor () {
        super(goalModel);
        this.populate = ['accountable']
    }
    
}