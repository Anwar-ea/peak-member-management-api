import { inject, injectable } from "tsyringe";
import { IGoalService } from "./abstractions";
import { IGoalRepository, IUserRepository } from "../dal";
import { FilterMatchModes, FilterOperators, IDataSourceResponse, IFetchRequest, IFilter, IGoalRequest, IGoalResponse, ITokenUser } from "../models";
import { Goal } from "../entities";
import { assignIn } from "lodash";
import { Types, AnyBulkWriteOperation } from "mongoose";

@injectable()
export class GoalService implements IGoalService {
    constructor(
        @inject('GoalRepository') private readonly goalRepository: IGoalRepository,
        @inject('UserRepository') private readonly userRepository: IUserRepository

    ) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<Goal, keyof Goal>>): Promise<IGoalResponse | null> {
        return await this.goalRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IGoalRequest, contextUser?: ITokenUser): Promise<IGoalResponse> {
        let goal = new Goal().toEntity(entityRequest, undefined, contextUser);
        if (goal.accountableId) {
            let highestGoal = (
                await (this.goalRepository as any).findOne(
                    { accountableId: goal.accountableId },
                    null,
                    { priority: -1 }
                )
            )?.toInstance();
            goal.priority = highestGoal ? highestGoal.priority + 1 : 0;
        } else {
            goal.priority = 0;
        }
        let response  = await this.goalRepository.add(goal);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IGoalRequest[], contextUser: ITokenUser): Promise<IGoalResponse[]> {
        return (await this.goalRepository.addRange(entitesRequest.map<Goal>(acc => {
            let goal = new Goal().toEntity(acc, undefined, contextUser);
            return goal;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<Goal>): Promise<IDataSourceResponse<IGoalResponse>> {
        if(contextUser.privileges.includes('lawFirmRelativeDataDashboard')) {
            let userIds = await this.userRepository.find({lawFirmId: new Types.ObjectId(contextUser?.lawFirmId)}, {'_id':1});
            let lawFirmFilter = {field: 'accountableId', values: userIds.map(x => x._id), matchMode: FilterMatchModes.In, operator: FilterOperators.And};
            if(fetchRequest.queryOptionsRequest && fetchRequest.queryOptionsRequest.filtersRequest) fetchRequest.queryOptionsRequest.filtersRequest.push(lawFirmFilter);
            else fetchRequest.queryOptionsRequest = {
                ...fetchRequest.queryOptionsRequest, 
                filtersRequest: fetchRequest.queryOptionsRequest?.filtersRequest ? [...fetchRequest.queryOptionsRequest?.filtersRequest, lawFirmFilter] : [lawFirmFilter] } ;
        }
        // fetchRequest.queryOptionsRequest = fetchRequest.queryOptionsRequest ? {...fetchRequest.queryOptionsRequest, includes:['User', 'MileStone']} :{includes:['User', 'MileStone']};
        return await this.goalRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IGoalResponse | null> {
        return await this.goalRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IGoalRequest, contextUser: ITokenUser): Promise<IGoalResponse> {
        let goal = new Goal().toEntity(entityRequest, id, contextUser);
        // if(goal.milestones){
        //    if( goal.milestones.every(x => x.completed)) goal.active = false;
            
        // }
        return await this.goalRepository.update(id, goal);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IGoalRequest>, contextUser: ITokenUser): Promise<IGoalResponse> {
        let entity: Partial<Goal> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.goalRepository.update(id, assignIn(entity, partialEntity));
    }

    async updateMany(entitesRequest: (IGoalRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.goalRepository.updateRange(entitesRequest.map<Goal>(acc => {
            let goal = new Goal().toEntity(acc, acc.id, contextUser);
            return goal;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.goalRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let goals = await this.goalRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(goals.length !== ids.length) throw new Error(`Some goal with provided ids not found`);

    }

    async toggleArchive(
        id: string,
        payload: { active: boolean },
        contextUser: ITokenUser
    ): Promise<void> {
        await this.goalRepository.update(id, payload);
    }

    async updatePriority(
        id: string,
        newPriority: number,
        contextUser: ITokenUser
    ): Promise<void> {
        // Get the goal being updated to find its accountableId
        const currentGoal = await this.goalRepository.findOneById(id);
        if (!currentGoal) {
            throw new Error(`Goal with id ${id} not found`);
        }

        if (!currentGoal.accountableId) {
            throw new Error(`Goal with id ${id} does not have an accountableId`);
        }

        // Get all goals for this accountableId sorted by current priority
        const accountableGoals = (
            await (this.goalRepository as any).find(
                { accountableId: currentGoal.accountableId },
                undefined,
                { sort: { priority: -1 } }
            )
        ).map((x: Goal) => x.toInstance());

        // Remove the current goal from the list
        const otherGoals = accountableGoals.filter((goal: Goal) => goal._id?.toString() !== id);

        // Insert the current goal at the new position (newPriority is the index)
        const reorderedGoals = [...otherGoals];
        reorderedGoals.splice(newPriority, 0, currentGoal);

        // Update all goals with their new priorities (0-indexed)
        const bulkOps = reorderedGoals
            .reverse()
            .map<AnyBulkWriteOperation<Goal>>((goal, index) => ({
                updateOne: {
                    filter: { _id: goal._id },
                    update: {
                        priority: index,
                        modifiedAt: new Date(),
                        modifiedBy: contextUser.name,
                        modifiedById: new Types.ObjectId(contextUser.id),
                    },
                },
            }));

        // Execute bulk update
        await this.goalRepository.bulkWrite(bulkOps);
    }
}
