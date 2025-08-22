import { IToDoRequest, IToDoResponse, ITokenUser, ResponseInput } from "../models";
import { User } from "./user";
import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Schema, Types } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../utility";

export class ToDo extends AccountEntityBase implements IToResponseBase<ToDo, IToDoResponse> {
    todo!: string;
    details?: string;
    dueDate?: Date;
    completed!: boolean;
    userId!: Types.ObjectId;
    user?: User;
    priority!: number;
    
    toResponse(entity?: ResponseInput<ToDo>): IToDoResponse {
        if(!entity) entity = this;
        return {
            ...super.toAccountResponseBase(entity),
            todo: entity.todo,
            details: entity.details ? entity.details : undefined,
            completed: entity.completed,
            dueDate: entity.dueDate ? entity.dueDate : undefined,
            userId: entity.userId.toString(),
            user: entity.user ? entity.user.toResponse(entity.user) : undefined,
            priority: entity.priority
        }
    }

    toInstance(): ToDo {
        return documentToEntityMapper<ToDo>(new ToDo, this);
    } ;

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

const todoSchema =
  new Schema<ToDo>({
    todo: { type: String, required: true },
    details: { type: String },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    priority: {type: Number, default: 1}
  });

todoSchema.add(accountEntityBaseSchema)

todoSchema.loadClass(ToDo);

// Create a virtual populate for the user
todoSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

export const todoModel = modelCreator<ToDo, IToDoResponse>("Todo", todoSchema);