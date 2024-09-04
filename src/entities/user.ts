import { Column, Entity, JoinColumn, ManyToOne, OneToOne, RelationId } from "typeorm";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { IUserRequest, IUserResponse, UserStatus } from "../models";
import { Role } from "./role";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { randomUUID } from "crypto";
import { Account } from "./account";
import { IToResponseBase } from "./abstractions/to-response-base";

@Entity('User')
export class User extends AccountEntityBase implements IToResponseBase<User, IUserResponse> {

    @Column({ name: 'UserName', unique: true, type: 'text' })
    userName!: string;

    @Column({ name: 'Email', type: 'text', unique: true })
    email!: string;

    @Column({ name: 'PasswordHash', type: 'text'})
    passwordHash!: string;

    @Column({ name: 'FirstName', type: 'text' })
    firstName!: string;

    @Column({ name: 'MiddleName', type: 'text', nullable: true })
    middleName?: string;

    @Column({ name: 'LastName', type: 'text' })
    lastName!: string;

    @Column({ name: 'PictureUrl', type: 'text', nullable: true })
    pictureUrl?: string;

    @Column({ name: 'DateOfBirth', type: 'timestamp' })
    dateOfBirth!: Date;

    @Column({ name: 'Firm', type: 'text', nullable: true })
    firm?: string;

    @Column({ name: 'Position', type: 'text', nullable: true })
    position?: string;

    @Column({ name: 'Status', type: 'int', default: UserStatus.Offline })
    status!: UserStatus;

    @Column({ name: 'LastLogin', type: 'timestamp', nullable: true})
    lastLogin?: Date;

    @Column({ name: 'LastOnline', type: 'timestamp', nullable: true })
    lastOnline?: Date;

    @RelationId((user: User) => user.role)
    roleId!: string;

    @ManyToOne(() => Role, (role) => role, {cascade: true, nullable: false})
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
            this.role = new Role();
            this.role.id = this.roleId;
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
            this.role = new Role();
            this.role.id = this.roleId;
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