import { DataSource } from "typeorm";
import { Account, Module, Privilege, Role, User } from "../entities";
import { randomUUID } from "crypto";
import { EmptyGuid } from "../constants";
import { encrypt } from "./bcrypt-utility";
import { Modules } from "../constants/modules";
import { toCamelCase } from "./string-utility";
import { Privileges } from "../constants/privileges";
import { log } from "console";
import { Types } from "mongoose";

export const AddDefaultData = async (dataSource: DataSource) => {

    let accountRepo = dataSource.getMongoRepository(Account);
    let userRepo = dataSource.getMongoRepository(User);
    let roleRepo = dataSource.getMongoRepository(Role);
    let moduleRepo = dataSource.getMongoRepository(Module);
    let privilageRepo = dataSource.getMongoRepository(Privilege);
    
    let accountCount = await accountRepo.count();
    let roleCount = await roleRepo.count();
    let moduleCount = await moduleRepo.count();

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
    account._id = new Types.ObjectId();
    let role: Role = new Role().toEntity(
      { name: "Account Admin", code: "accountAdmin", privilegeIds:[] }, undefined,
      { name: "Admin", id: EmptyGuid, accountId: "", privileges: [] }
    );
    role._id = new Types.ObjectId();
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
        roleId: role._id.toString(),
      }, undefined,
      { name: "Admin", id: EmptyGuid, accountId: EmptyGuid, privileges: [] }
    );

    user.passwordHash = await encrypt("asdf@123");

    if(!roleCount) await roleRepo.insert(role);

    if(!accountCount){
        await accountRepo.insert(account);
        await userRepo.insert({...user,account: account});
    }

    if(!moduleCount) {
      for (const module of Modules) {
        let moduleEntity = new Module().newInstanceToAdd(module, toCamelCase(module.replaceAll(" ", "")), [])

        let modulePrivilages: Array<Privilege> = [];
        for (const privilege of Privileges) {
          let privilageName = `${privilege} ${module}`;
          let privilageCode = `${privilege}${module.replaceAll(" ", "")}`;
          modulePrivilages.push(
            new Privilege().newInstanceToAdd(
              `${privilageName}`,
              toCamelCase(privilageCode)
            )
          );
        }
        moduleEntity.privilages = modulePrivilages;
        await moduleRepo.insert(moduleEntity)
        await privilageRepo.insertMany(modulePrivilages);
      }
    }


}

