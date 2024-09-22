import { IToDoRequest, IToDoResponse, ITokenUser } from "../models";
import { User } from "./user";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { Account } from "./account";
import { randomUUID } from "crypto";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Types } from "mongoose";

export class ToDo extends AccountEntityBase implements IToResponseBase<ToDo, IToDoResponse> {
    todo!: string;
    details!: string;
    dueDate!: Date;
    completed!: boolean;
    userId!: Types.ObjectId;
    user?: User
    
    toResponse(entity: ToDo): IToDoResponse {
        return {
            ...super.toAccountResponseBase(entity),
            todo: entity.todo,
            details: entity.details,
            completed: entity.completed,
            dueDate: entity.dueDate,
            userId: entity.userId.toString(),
            user: entity.user ? entity.user.toResponse(entity.user) : undefined,
        }
    }

    toEntity = (entityRequest: IToDoRequest, id?: string, contextUser?: ITokenUser): ToDo => {
        this.todo = entityRequest.todo;
        this.details = entityRequest.details;
        this.dueDate = entityRequest.dueDate;
        this.userId = new Types.ObjectId(entityRequest.userId);
        this.completed = entityRequest.completed;

        if(contextUser && !id){
            this.toAccountEntity(contextUser)
        }

        if(id && contextUser){
            this.toAccountEntity(contextUser, id)
        }
        
        return this;
    }
}