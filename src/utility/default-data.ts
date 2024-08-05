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
    let userCount = await userRepo.count();
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
    },{name: "Admin", id: EmptyGuid, accountId:'', privileges: []});
    account.id = randomUUID();
    let role: Role = new Role().toEntity(
      { name: "Account Admin", code: "accountAdmin" },
      { name: "Admin", id: EmptyGuid, accountId: "", privileges: [] }
    );
    role.id = randomUUID();
    let user: User = new User().toEntity(
      {
        userName: "defaultAdmin",
        email: "default@aaepa.com",
        firstName: "Admin",
        middleName: undefined,
        lastName: "User",
        age: 0,
        dateOfBirth: new Date(),
        phoneNo: account.phoneNo,
        password: "asdf@123",
        address: account.address,
        temporaryAddress: account.temporaryAddress,
        country: account.country,
        state: account.state,
        city: account.city,
        zipCode: account.zipCode,
        street: account.street,
        longitude: account.longitude,
        latitude: account.latitude,
        roleId: role.id,
      },
      { name: "Admin", id: EmptyGuid, accountId: "", privileges: [] }
    );
    user.status = UserStatus.Online;
    user.accountId = account.id,
    user.account = account;
    user.passwordHash  = await encrypt("asdf@123");
    user.id = randomUUID();
    
    if(!accountCount){
        await accountRepo.save(account);
        await userRepo.save({...user,account: account});
    }

    if(!roleCount) await roleRepo.save(role);

}