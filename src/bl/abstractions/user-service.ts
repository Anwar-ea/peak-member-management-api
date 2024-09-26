import { User } from "../../entities";
import { ILoginRequest, IUserRequest, IUserResponse } from "../../models";
import { IDropdownResponse } from "../../models/inerfaces/response/dropdown-response";
import { IServiceBase } from "./service-base";

export interface IUserService extends IServiceBase<IUserRequest, IUserResponse, User> {
    dropdown(accountId: string): Promise<IDropdownResponse[]>;
    login(loginRequest: ILoginRequest): Promise<IUserResponse>
}