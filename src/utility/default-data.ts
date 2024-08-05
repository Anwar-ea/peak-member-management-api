import { DataSource } from "typeorm";
import { Account, Role, User } from "../entities";
import { randomUUID } from "crypto";
import { EmptyGuid } from "../constants";
import { UserStatus } from "../models";
import { encrypt } from "./bcrypt-utility";

export const AddDefaultData = async (dataSource: DataSource) => {

    let accountRepo = dataSource.getRepository(Account);
    let userRepo = dataSource.getRepository(User);
    let roleRepo = dataSource.getRepository(Role)
    
    let accountCount = await accountRepo.count();
    let roleCount = await roleRepo.count();

    let account: Account = new Account().toEntity({
        name: "Default",
        code: "default",
        phoneNo: "000000000000",
        email: "default@aaepa.com",
        address: "N/A",
        temporaryAddress: "   ",
        zipCode: 0,
        country: "USA",
        state: "California",
        city: "California",
        street: "N/A",
        longitude: 0,
        latitude: 1
    }, undefined,{name: "Admin", id: EmptyGuid, accountId:'', privileges: []});
    account.id = randomUUID();
    let role: Role = new Role().toEntity(
      { name: "Account Admin", code: "accountAdmin" }, undefined,
      { name: "Admin", id: EmptyGuid, accountId: "", privileges: [] }
    );
    role.id = randomUUID();
    role.privileges = [];
    role.accountId = undefined;
    role.account = undefined;
    let user: User = new User().toEntity(
      {
        userName: "defaultAdmin",
        email: "default@aaepa.com",
        firstName: "Admin",
        middleName: undefined,
        lastName: "User",
        dateOfBirth: new Date(),
        password: "asdf@123",
        roleId: role.id,
      }, undefined,
      { name: "Admin", id: EmptyGuid, accountId: EmptyGuid, privileges: [] }
    );

    user.passwordHash = await encrypt("asdf@123");

    if(!roleCount) await roleRepo.save(role);
    if(!accountCount){
        await accountRepo.save(account);
        await userRepo.save({...user,account: account});
    }


}