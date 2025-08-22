import { inject, injectable } from "tsyringe";
import { IToDoService } from "./abstractions";
import { IToDoRepository, IUserRepository, ToDoRepository } from "../dal";
import { FilterMatchModes, FilterOperators, IDataSourceResponse, IFetchRequest, IFilter, IToDoRequest, IToDoResponse, ITokenUser } from "../models";
import { ToDo } from "../entities";
import { assignIn } from "lodash";
import { AnyBulkWriteOperation, Types } from "mongoose";

@injectable()
export class ToDoService implements IToDoService {
    constructor(
        @inject('ToDoRepository') private readonly todoRepository: ToDoRepository,
        @inject('UserRepository') private readonly userRepository: IUserRepository
        
    ) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<ToDo, keyof ToDo>>): Promise<IToDoResponse | null> {
        return await this.todoRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IToDoRequest, contextUser?: ITokenUser): Promise<IToDoResponse> {
        let todo = new ToDo().toEntity(entityRequest, undefined, contextUser);
        let highestTodo = (await this.todoRepository.findOne({userId: new Types.ObjectId(entityRequest.userId), },null, {priority: -1}))?.toInstance();
         todo.priority = highestTodo ? (highestTodo.priority + 1) : 0;
        let response  = await this.todoRepository.add(todo);
        if (response) return response.toResponse();
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IToDoRequest[], contextUser: ITokenUser): Promise<IToDoResponse[]> {
        return (await this.todoRepository.addRange(entitesRequest.map<ToDo>(acc => {
            let todo = new ToDo().toEntity(acc, undefined, contextUser);
            return todo;
        }))).map(g => g.toResponse())
    }

    async get(contextUser: ITokenUser, fetchRequest: IFetchRequest<ToDo>): Promise<IDataSourceResponse<IToDoResponse>> {
        if(contextUser.privileges.includes('lawFirmRelativeDataDashboard')) {
            let userIds = await this.userRepository.find({lawFirmId: new Types.ObjectId(contextUser?.lawFirmId)}, {'_id':1});
            let lawFirmFilter = {field: 'userId', values: userIds.map(x => x._id), matchMode: FilterMatchModes.In, operator: FilterOperators.And};
            if(fetchRequest.queryOptionsRequest && fetchRequest.queryOptionsRequest.filtersRequest) fetchRequest.queryOptionsRequest.filtersRequest.push(lawFirmFilter);
            else fetchRequest.queryOptionsRequest = {
                ...fetchRequest.queryOptionsRequest, 
                filtersRequest: fetchRequest.queryOptionsRequest?.filtersRequest ? [...fetchRequest.queryOptionsRequest?.filtersRequest, lawFirmFilter] : [lawFirmFilter] } ;
            }
        // fetchRequest.queryOptionsRequest = fetchRequest.queryOptionsRequest ? {...fetchRequest.queryOptionsRequest, includes:['User', 'MileStone']} :{includes:['User', 'MileStone']};
        return await this.todoRepository.getPagedData(fetchRequest, true, true, contextUser.accountId);
    }

    async getById(id: string, contextUser: ITokenUser): Promise<IToDoResponse | null> {
        return await this.todoRepository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: IToDoRequest, contextUser: ITokenUser): Promise<IToDoResponse> {
        let todo = new ToDo().toEntity(entityRequest, id, contextUser);
        return await this.todoRepository.update(id, todo);
    }
        
    async partialUpdate(id: string, partialEntity: Partial<IToDoRequest>, contextUser: ITokenUser): Promise<IToDoResponse> {
        let entity: Partial<ToDo> = {
            modifiedAt: new Date(),
            modifiedBy: contextUser.name,
            modifiedById: new Types.ObjectId(contextUser.id)
        }
        return await this.todoRepository.update(id, assignIn(entity, partialEntity));
    }

    async updatePriority(id: string, newPriority: number, contextUser: ITokenUser): Promise<void>{
        // Get the todo being updated to find its userId
        const currentTodo = await this.todoRepository.findOneById(id);
        if (!currentTodo) {
            throw new Error(`Todo with id ${id} not found`);
        }

        // Get all todos for this user sorted by current priority
        const userTodos = (await this.todoRepository.find({ userId: currentTodo.userId }, undefined, { sort: {priority: -1} })).map(x => x.toInstance());
        
        // Remove the current todo from the list
        const otherTodos = userTodos.filter(todo => todo._id?.toString() !== id);
        
        // Insert the current todo at the new position (newPriority is the index)
        const reorderedTodos = [...otherTodos];
        reorderedTodos.splice(newPriority, 0, currentTodo);
        
        // Update all todos with their new priorities (0-indexed)
        const bulkOps = reorderedTodos.reverse().map<AnyBulkWriteOperation<ToDo>>((todo, index) => ({
            updateOne: {
                filter: { _id: todo._id },
                update: {
                    priority: index,
                    modifiedAt: new Date(),
                    modifiedBy: contextUser.name,
                    modifiedById: new Types.ObjectId(contextUser.id)
                }
            }
        }));

        // Execute bulk update
        await this.todoRepository.bulkWrite(bulkOps);
        

    }

    async updateMany(entitesRequest: (IToDoRequest & { id: string; })[], contextUser: ITokenUser): Promise<any> {
        return await this.todoRepository.updateRange(entitesRequest.map<ToDo>(acc => {
            let todo = new ToDo().toEntity(acc, acc.id, contextUser);
            return todo;
        }),{})
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        await this.todoRepository.delete(id);
    }

    async deleteMany(ids: string[], contextUser: ITokenUser): Promise<void> {
        let todos = await this.todoRepository.deleteRange({_id: {$in: ids.map(id => new Types.ObjectId(id))}});
        
        if(todos.length !== ids.length) throw new Error(`Some todo with provided ids not found`);

    }
}
