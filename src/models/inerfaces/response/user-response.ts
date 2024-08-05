import { UserStatus } from "../../enums";
import { IAccountResponseBase } from "./response-base";
import { IRoleResponse } from "./role-response";

export interface IUserResponse extends IAccountResponseBase {
    userName: string;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    age: number;
    dateOfBirth: Date;
    phoneNo: string;
    address: string;
    temporaryAddress?: string;
    country: string;
    state: string;
    city: string;
    zipCode?: number;
    street: string;
    longitude?: number;
    latitude?: number;
    status: UserStatus;
    lastLogin: Date;
    lastOnline: Date;
    roleId: string;
    role?: IRoleResponse
}