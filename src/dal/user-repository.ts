import { injectable } from "tsyringe";
import { User, userModel } from "../entities";
import { IUserRepository } from "./abstractions";
import { GenericRepository } from "./generics/repository";
import { IUserResponse } from "../models";

@injectable()
export class UserRepository extends GenericRepository<User,IUserResponse> implements IUserRepository {
    
    constructor(){
        super(userModel);
        this.populate = ['account', 'role', 'lawFirm'];
    }

}