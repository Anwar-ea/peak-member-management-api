import { ToDo, todoModel } from "../entities";
import { IToDoResponse } from "../models";
import { IToDoRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { injectable } from "tsyringe";

@injectable()
export class ToDoRepository extends GenericRepository<ToDo, IToDoResponse> implements IToDoRepository {

    constructor () {
        super(todoModel);
        this.populate = ['user'];
    }

    
}