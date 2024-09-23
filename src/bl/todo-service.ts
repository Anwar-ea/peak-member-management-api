import { inject, injectable } from "tsyringe";
import { IToDoService } from "./abstractions";
import { IToDoRepository } from "../dal";
import { IDataSourceResponse, IFetchRequest, IFilter, IToDoRequest, IToDoResponse, ITokenUser } from "../models";
import { randomUUID } from "crypto";
import { In } from "typeorm";
import { ToDo } from "../entities";
import { assignIn } from "lodash";
import { Types } from "mongoose";

@injectable()
export class ToDoService implements IToDoService {
    constructor(@inject('ToDoRepository') private readonly todoRepository: IToDoRepository) { }

    async getOne(contextUser: ITokenUser, filtersRequest: Array<IFilter<ToDo, keyof ToDo>>): Promise<IToDoResponse | null> {
        return await this.todoRepository.getOneByQueryWithResponse(filtersRequest, true, true, contextUser.accountId)
    }

    async add(entityRequest: IToDoRequest, contextUser?: ITokenUser): Promise<IToDoResponse> {
        let todo = new ToDo().toEntity(entityRequest, undefined, contextUser);
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
