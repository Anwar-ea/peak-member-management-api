import { ToDo } from "../../entities";
import { IRepositoryBase } from "./repository-base";
import { IToDoResponse } from "../../models";

export interface IToDoRepository extends IRepositoryBase<ToDo, IToDoResponse> {
    
}