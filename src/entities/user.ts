import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, RelationId } from "typeorm";
import { AccountEntityBase } from "./base-entities/account-entity-base";
import { IUserRequest, IUserResponse, UserStatus } from "../models";
import { Role } from "./role";
import { ITokenUser } from "../models/inerfaces/tokenUser";

@Entity('User')
export class User extends AccountEntityBase {

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

    @Column({ name: 'Age', type: 'int' })
    age!: number;

    @Column({ name: 'DateOfBirth', type: 'datetime' })
    dateOfBirth!: Date;

    @Column({ name: 'PhoneNo', type: 'nvarchar' })
    phoneNo!: string;

    @Column({ name: 'Address', type: 'nvarchar' })
    address!: string;

    @Column({ name: 'TemporaryAddress', type: 'nvarchar', nullable: true })
    temporaryAddress?: string;

    @Column({ name: 'Country', type: 'nvarchar' })
    country!: string;

    @Column({ name: 'State', type: 'nvarchar' })
    state!: string;

    @Column({ name: 'City', type: 'nvarchar' })
    city!: string;

    @Column({ name: 'ZipCode', type: 'int', nullable: true })
    zipCode?: number;

    @Column({ name: 'Street', type: 'nvarchar' })
    street!: string;

    @Column({ name: 'Longitude', type: 'decimal', nullable: true })
    longitude?: number;

    @Column({ name: 'Latitude', type: 'decimal', nullable: true })
    latitude?: number;

    @Column({ name: 'Status', type: 'int', default: UserStatus.Offline })
    status!: UserStatus;

    @Column({ name: 'LastLogin', type: 'datetime' })
    lastLogin!: Date;

    @Column({ name: 'LastOnline', type: 'datetime' })
    lastOnline!: Date;

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
            age: entity.age,
            dateOfBirth: entity.dateOfBirth,
            phoneNo: entity.phoneNo,
            address: entity.address,
            temporaryAddress: entity.temporaryAddress,
            country: entity.country,
            state: entity.state,
            city: entity.city,
            zipCode: entity.zipCode,
            street: entity.street,
            longitude: entity.longitude,
            latitude: entity.latitude,
            status: entity.status,
            lastLogin: entity.lastLogin,
            lastOnline: entity.lastOnline,
            roleId: entity.roleId
        }    
    }

    
    toEntity = (requestEntity: IUserRequest, contextUser?: ITokenUser): User => {
        this.userName = requestEntity.userName;
        this.email = requestEntity.email;
        this.firstName = requestEntity.firstName;
        this.middleName = requestEntity.middleName;
        this.lastName = requestEntity.lastName;
        this.age = requestEntity.age;
        this.dateOfBirth = requestEntity.dateOfBirth;
        this.phoneNo = requestEntity.phoneNo;
        this.address = requestEntity.address;
        this.temporaryAddress = requestEntity.temporaryAddress;
        this.country = requestEntity.country;
        this.state = requestEntity.state;
        this.city = requestEntity.city;
        this.zipCode = requestEntity.zipCode;
        this.street = requestEntity.street;
        this.roleId = requestEntity.roleId;

        if(contextUser){
            this.accountId = contextUser.accountId;
            this.createdBy = contextUser.name;
            this.createdAt = new Date();
            this.createdById = contextUser.id;
            this.active = true;
            this.deleted = false;
            this.lastLogin = new Date();
            this.lastOnline = new Date();
        }

        return this;
    }

}