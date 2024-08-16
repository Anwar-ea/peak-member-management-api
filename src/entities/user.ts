import { Column, Entity, JoinColumn, OneToOne, RelationId } from "typeorm";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { IUserRequest, IUserResponse, UserStatus } from "../models";
import { Role } from "./role";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { randomUUID } from "crypto";
import { Account } from "./account";
import { IToResponseBase } from "./abstractions/to-response-base";

@Entity('User')
export class User extends AccountEntityBase implements IToResponseBase<User, IUserResponse> {

    @Column({ name: 'UserName', unique: true, type: 'nvarchar' })
    userName!: string;

    @Column({ name: 'Email', type: 'nvarchar', unique: true })
    email!: string;

    @Column({ name: 'PasswordHash', type: 'nvarchar'})
    passwordHash!: string;

    @Column({ name: 'FirstName', type: 'nvarchar' })
    firstName!: string;

    @Column({ name: 'MiddleName', type: 'nvarchar', nullable: true })
    middleName?: string;

    @Column({ name: 'LastName', type: 'nvarchar' })
    lastName!: string;

    @Column({ name: 'PictureUrl', type: 'nvarchar', nullable: true })
    pictureUrl?: string;

    @Column({ name: 'DateOfBirth', type: 'datetime' })
    dateOfBirth!: Date;

    @Column({ name: 'Firm', type: 'nvarchar', nullable: true })
    firm?: string;

    @Column({ name: 'Position', type: 'nvarchar', nullable: true })
    position?: string;

    @Column({ name: 'Status', type: 'int', default: UserStatus.Offline })
    status!: UserStatus;

    @Column({ name: 'LastLogin', type: 'datetime', nullable: true})
    lastLogin?: Date;

    @Column({ name: 'LastOnline', type: 'datetime', nullable: true })
    lastOnline?: Date;

    @RelationId((user: User) => user.role)
    roleId!: string;

    @OneToOne(() => Role, (role) => role)
    @JoinColumn({ name: 'RoleId', referencedColumnName: 'id' })
    role!: Role

    toResponse(entity: User): IUserResponse {
        return {
            ...super.toAccountResponseBase(entity),
            userName: entity.userName,
            email: entity.email,
            firstName: entity.firstName,
            middleName: entity.middleName,
            lastName: entity.lastName,
            pictureUrl: entity.pictureUrl,
            dateOfBirth: entity.dateOfBirth,
            status: entity.status,
            lastLogin: entity.lastLogin,
            lastOnline: entity.lastOnline,
            roleId: entity.roleId,
            firm: entity.firm,
            position: entity.position
        }    
    }

    
    toEntity = (requestEntity: IUserRequest, id?: string, contextUser?: ITokenUser): User => {
        this.userName = requestEntity.userName;
        this.email = requestEntity.email;
        this.firstName = requestEntity.firstName;
        this.middleName = requestEntity.middleName;
        this.lastName = requestEntity.lastName;
        this.dateOfBirth = requestEntity.dateOfBirth;
        this.roleId = requestEntity.roleId;
        this.pictureUrl = requestEntity.pictureUrl;
        this.firm = requestEntity.firm;
        this.position = requestEntity.position;

        if(contextUser && !id){
            this.accountId = contextUser.accountId;
            this.createdBy = contextUser.name;
            this.createdAt = new Date();
            let account = new Account();
            account.id = contextUser.accountId;
            this.account = account;
            this.createdById = contextUser.id;
            this.active = true;
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