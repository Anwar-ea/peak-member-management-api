import { User } from "../../entities";
import { ILoginRequest, IUserRequest, IUserResponse } from "../../models";
import { IServiceBase } from "./service-base";

export interface IUserService extends IServiceBase<IUserRequest, IUserResponse, User> {
    login(loginRequest: ILoginRequest): Promise<IUserResponse>
}