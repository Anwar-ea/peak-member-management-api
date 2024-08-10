import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { IToDoRequest, IToDoResponse, ITokenUser } from "../models";
import { User } from "./user";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { Account } from "./account";
import { randomUUID } from "crypto";
import { IToResponseBase } from "./abstractions/to-response-base";

@Entity('ToDo')
export class ToDo extends AccountEntityBase implements IToResponseBase<ToDo, IToDoResponse> {
    
    @Column({name: 'Todo', type: 'nvarchar'})
    todo!: string;

    @Column({name: 'Details', type: 'nvarchar'})
    details!: string;

    @Column({name: 'DueDate', type: 'datetime'})
    dueDate!: Date;

    @Column({name: 'Completed', type: 'bit'})
    completed!: boolean;

    @RelationId((toDo: ToDo) => toDo.user)
    userId!: string;

    @ManyToOne(() => User, (user) => user, {nullable: false, eager: true})
    @JoinColumn({ name: 'UserId', referencedColumnName: 'id' })
    user!: User
    
    toResponse(entity: ToDo): IToDoResponse {
        return {
            ...super.toAccountResponseBase(entity),
            todo: entity.todo,
            details: entity.details,
            completed: entity.completed,
            dueDate: entity.dueDate,
            userId: entity.userId,
            user: entity.user.toResponse(entity.user)
        }
    }

    toEntity = (entityRequest: IToDoRequest, id?: string, contextUser?: ITokenUser): ToDo => {
        this.todo = entityRequest.todo;
        this.details = entityRequest.details;
        this.dueDate = entityRequest.dueDate;
        this.userId = entityRequest.userId;
        let user = new User();
        user.id = entityRequest.userId;
        this.user = user;
        if(contextUser && !id){
            this.createdBy = contextUser.name;
            this.createdAt = new Date();
            this.createdById = contextUser.id;
            this.active = true;
            this.completed = false;
            this.accountId = contextUser.accountId;
            let account = new Account();
            account.id = contextUser.accountId;
            this.account = account;
            this.deleted = false;
            this.id = randomUUID();
        }

        if(id && contextUser){
            this.accountId = contextUser.accountId;
            let account = new Account();
            account.id = contextUser.accountId;
            this.account = account;
            this.id = id;
            this.modifiedBy = contextUser.name;
            this.modifiedAt = new Date();
            this.modifiedById = contextUser.id;
            this.active = true;
            this.deleted = false;
        }
        return this;
    }
}