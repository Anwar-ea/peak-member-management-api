import { User } from "../../entities";
import { IRepositoryBase } from "./repository-base";
import { IUserResponse } from "../../models";

export interface IUserRepository extends IRepositoryBase<User, IUserResponse> {
    
}