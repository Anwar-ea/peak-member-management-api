import { UserStatus } from "../../enums";
import { ILawFirmResponse } from "./law-firm";
import { IAccountResponseBase } from "./response-base";
import { IRoleResponse } from "./role-response";

export interface IUserResponse extends IAccountResponseBase {
    userName: string;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth?: Date;
    status: UserStatus;
    lastLogin?: Date;
    lastOnline?: Date;
    roleId: string;
    role?: IRoleResponse;
    pictureUrl?: string;
    firm?: string;
    position?: string;
    lawFirmId?: string;
    lawFirm?: ILawFirmResponse;
    wordpressLoginUrls: string | undefined;
}