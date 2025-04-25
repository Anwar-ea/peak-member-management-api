import { AccountEntityBase, accountEntityBaseSchema } from "./base-entities/account-entity-base";
import { IUserRequest, IUserResponse, ResponseInput, UserStatus } from "../models";
import { Role } from "./role";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Schema, Types } from "mongoose";
import { documentToEntityMapper, modelCreator } from "../utility";
import { LawFirm } from "./law-firm";

export class User extends AccountEntityBase implements IToResponseBase<User, IUserResponse> {
    userName!: string;
    email!: string;
    passwordHash!: string;
    firstName!: string;
    middleName?: string;
    lastName!: string;
    pictureUrl?: string;
    dateOfBirth?: Date;
    firm?: string;
    position?: string;
    status!: UserStatus;
    lastLogin?: Date;
    lastOnline?: Date;
    roleId!: Types.ObjectId;
    lawFirmId!: Types.ObjectId;
    role?: Role;
    lawFirm?: LawFirm;

    toResponse(entity?: ResponseInput<User>): IUserResponse {
        if (!entity) entity = this;
        return {
            ...super.toAccountResponseBase(entity),
            userName: entity.userName,
            email: entity.email,
            firstName: entity.firstName,
            middleName: entity.middleName,
            lastName: entity.lastName,
            pictureUrl: entity.pictureUrl,
            dateOfBirth: entity.dateOfBirth ? entity.dateOfBirth : undefined,
            status: entity.status,
            lastLogin: entity.lastLogin,
            lastOnline: entity.lastOnline,
            roleId: entity.roleId.toString(),
            lawFirmId: entity.lawFirmId  ? entity.lawFirmId.toString() : undefined,
            role: entity.role ? entity.role?.toResponse() : undefined,
            lawFirm: entity.lawFirm ? entity.lawFirm?.toResponse() : undefined,
            position: entity.position,
        }    
    }

    toInstance(): User {
        return documentToEntityMapper<User>(new User, this)
    };
    
    toEntity = (requestEntity: IUserRequest, id?: string, contextUser?: ITokenUser): User => {
        this.userName = requestEntity.userName;
        this.email = requestEntity.email;
        this.firstName = requestEntity.firstName;
        this.middleName = requestEntity.middleName;
        this.lastName = requestEntity.lastName;
        this.dateOfBirth = requestEntity.dateOfBirth ? requestEntity.dateOfBirth : undefined;
        this.roleId = new Types.ObjectId(requestEntity.roleId);
        this.pictureUrl = requestEntity.pictureUrl;
        this.position = requestEntity.position;
        this.lawFirmId = new Types.ObjectId(requestEntity.lawFirmId);

        if(contextUser && !id){
            this.toAccountEntity(contextUser)
        }

        if(id && contextUser){
            this.toAccountEntity(contextUser, id)
        }

        return this;
    }

}

export const userSchema = new Schema<User>({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    pictureUrl: { type: String },
    dateOfBirth: { type: Date},
    firm: { type: String },
    position: { type: String },
    status: { type: Number, default: 1 },
    lastLogin: { type: Date },
    lastOnline: { type: Date },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    lawFirmId: { type: Schema.Types.ObjectId, ref: 'LawFirm'  },
});
userSchema.add(accountEntityBaseSchema);
// Create a virtual populate for the role
userSchema.virtual('role', {
    ref: 'Role',
    localField: 'roleId',
    foreignField: '_id',
    justOne: true,
});

userSchema.virtual('lawFirm', {
    ref: 'LawFirm',
    localField: 'lawFirmId',
    foreignField: '_id',
    justOne: true,
});

// Load the User class into the schema
userSchema.loadClass(User);

// Create the User model using the modelCreator function
export const userModel = modelCreator<User, IUserResponse>('User', userSchema);