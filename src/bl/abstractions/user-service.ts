import { User } from "../../entities";
import { ILoginRequest, ITokenUser, IUserRequest, IUserResponse } from "../../models";
import { IResetPassword } from "../../models/inerfaces/request/resetPasswordRequest";
import { IDropdownResponse } from "../../models/inerfaces/response/dropdown-response";
import { IServiceBase } from "./service-base";

export interface IUserService extends IServiceBase<IUserRequest, IUserResponse, User> {
    dropdown(accountId: string): Promise<IDropdownResponse[]>;
    login(loginRequest: ILoginRequest): Promise<IUserResponse>;
    loginAsMember(memberId: string): Promise<IUserResponse>;
    resetPassword(passwordResetRequest: IResetPassword, contextUser: ITokenUser): Promise<IUserResponse>;
}

