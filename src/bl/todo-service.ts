import { inject, injectable } from "tsyringe";
import { IToDoService } from "./abstractions";
import { IToDoRepository } from "../dal";
import { IDataSourceResponse, IFetchRequest, IFilter, IToDoRequest, IToDoResponse, ITokenUser } from "../models";
import { randomUUID } from "crypto";
import { In } from "typeorm";
import { ToDo } from "../entities";

@injectable()
export class ToDoService implements IToDoService {
    constructor(@inject('ToDoRepository') private readonly toDoRepository: IToDoRepository) { }

    async getOne(contextToDo: ITokenUser, filtersRequest: Array<IFilter<ToDo, keyof ToDo>>): Promise<IToDoResponse | null> {
        return await this.toDoRepository.getOne(filtersRequest)
    }

    async add(entityRequest: IToDoRequest, contextToDo?: ITokenUser): Promise<IToDoResponse> {
        let toDo = new ToDo().toEntity(entityRequest, undefined, contextToDo);
        let response  = await this.toDoRepository.addRecord(toDo);
        if (response) return response;
        else throw new Error(`Error adding ${entityRequest}`);
    }

    async addMany(entitesRequest: IToDoRequest[], contextToDo: ITokenUser): Promise<IToDoResponse[]> {
        return this.toDoRepository.addMany(entitesRequest.map<ToDo>(acc => {
            let toDo = new ToDo().toEntity(acc, undefined, contextToDo);
            toDo.id = randomUUID();
            return toDo;
        }))
    }

    async get(contextToDo: ITokenUser, fetchRequest: IFetchRequest<ToDo>): Promise<IDataSourceResponse<IToDoResponse>> {
        return await this.toDoRepository.get(fetchRequest);
    }

    async getById(id: string, contextToDo: ITokenUser): Promise<IToDoResponse | null> {
        return await this.toDoRepository.getById(id);
    }

    async update(id: string, entityRequest: IToDoRequest, contextToDo: ITokenUser): Promise<IToDoResponse> {
        let toDo = new ToDo().toEntity(entityRequest, id, contextToDo);
        return await this.toDoRepository.updateRecord(toDo);
    }

    async updateMany(entitesRequest: (IToDoRequest & { id: string; })[], contextToDo: ITokenUser): Promise<IToDoResponse[]> {
        return this.toDoRepository.updateMany(entitesRequest.map<ToDo>(acc => {
            let toDo = new ToDo().toEntity(acc, acc.id, contextToDo);
            return toDo;
        }))
    }

    async delete(id: string, contextToDo: ITokenUser): Promise<void> {
        let toDo = await this.toDoRepository.findOneById(id);
        if(toDo) await this.toDoRepository.deleteEntity(toDo);
        else throw new Error(`ToDo with id ${id} not found`);
    }

    async deleteMany(ids: string[], contextToDo: ITokenUser): Promise<void> {
        let toDos = await this.toDoRepository.where({where:{id: In(ids)}});
        
        if(toDos.length !== ids.length) throw new Error(`Some toDo with provided ids not found`);

        await this.toDoRepository.deleteMany(toDos);
    }
}
