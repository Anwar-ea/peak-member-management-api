import { inject, injectable } from "tsyringe";
import { IGoalService } from "./abstractions";
import { IGoalRepository } from "../dal";
import { IDataSourceResponse, IFetchRequest, IFilter, IGoalRequest, IGoalResponse, ITokenUser } from "../models";
import { randomUUID } from "crypto";
import { In } from "typeorm";
import { Goal } from "../entities";
import { assignIn } from "lodash";

@injectable()
export class GoalService implements IGoalService {
    constructor(@inject('GoalRepository') private readonly goalRepository: IGoalRepository) { }

    async getOne(contextGoal: ITokenUser, filtersRequest: Array<IFilter<Goal, keyof Goal>>): Promise<IGoalResponse | null> {
        return await this.goalRepository.getOne(filtersRequest)
    }

    async add(entityRequest: IGoalRequest, contextGoal?: ITokenUser): Promise<IGoalResponse> {
        let goal = new Goal().toEntity(entityRequest, undefined, contextGoal);
        let response  = await this.goalRepository.addRecord(goal);
        if (response) return response;
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IGoalRequest[], contextGoal: ITokenUser): Promise<IGoalResponse[]> {
        return this.goalRepository.addMany(entitesRequest.map<Goal>(acc => {
            let goal = new Goal().toEntity(acc, undefined, contextGoal);
            goal.id = randomUUID();
            return goal;
        }))
    }

    async get(contextGoal: ITokenUser, fetchRequest: IFetchRequest<Goal>): Promise<IDataSourceResponse<IGoalResponse>> {
        // fetchRequest.queryOptionsRequest = fetchRequest.queryOptionsRequest ? {...fetchRequest.queryOptionsRequest, includes:['User', 'MileStone']} :{includes:['User', 'MileStone']};
        return await this.goalRepository.get(fetchRequest);
    }

    async getById(id: string, contextGoal: ITokenUser): Promise<IGoalResponse | null> {
        return await this.goalRepository.getById(id);
    }

    async update(id: string, entityRequest: IGoalRequest, contextGoal: ITokenUser): Promise<IGoalResponse> {
        let goal = new Goal().toEntity(entityRequest, id, contextGoal);
        return await this.goalRepository.updateRecord(goal);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IGoalRequest>, contextUser: ITokenUser): Promise<IGoalResponse> {
        let entity: Partial<Goal> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: contextUser.id
        }
        return await this.goalRepository.partialUpdate(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IGoalRequest & { id: string; })[], contextGoal: ITokenUser): Promise<IGoalResponse[]> {
        return this.goalRepository.updateMany(entitesRequest.map<Goal>(acc => {
            let goal = new Goal().toEntity(acc, acc.id, contextGoal);
            return goal;
        }))
    }

    async delete(id: string, contextGoal: ITokenUser): Promise<void> {
        let goal = await this.goalRepository.findOneById(id);
        if(goal) await this.goalRepository.deleteEntity(goal);
        else throw new Error(`Goal with id ${id} not found`);
    }

    async deleteMany(ids: string[], contextGoal: ITokenUser): Promise<void> {
        let goals = await this.goalRepository.where({where:{id: In(ids)}});
        
        if(goals.length !== ids.length) throw new Error(`Some goal with provided ids not found`);

        await this.goalRepository.deleteMany(goals);
    }
}
