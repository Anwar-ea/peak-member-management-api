import { Account, accountModel, Module, moduleModel, Privilege, PrivilegeModel, Role, roleModel, User, userModel } from "../entities";
import { EmptyGuid } from "../constants";
import { encrypt } from "./bcrypt-utility";
import { Modules } from "../constants/modules";
import { toCamelCase } from "./string-utility";
import { Privileges } from "../constants/privileges";
import { Types } from "mongoose";

export const AddDefaultData = async () => {

    let accountRepo = accountModel;
    let userRepo = userModel;
    let roleRepo = roleModel;
    let moduleRepo = moduleModel;
    let privilageRepo = PrivilegeModel;
    
    let accountCount = await accountRepo.countDocuments();
    let roleCount = await roleRepo.countDocuments();
    let moduleCount = await moduleRepo.countDocuments();

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
    }, undefined,{name: "Admin", id: '', accountId:'', privileges: []});
    account._id = new Types.ObjectId();
    let role: Role = new Role().toEntity(
      { name: "Account Admin", code: "accountAdmin", privilegeIds:[] }, undefined,
      { name: "Admin", id: '', accountId: "", privileges: [] }
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
      { name: "Admin", id: '', accountId: account._id.toString(), privileges: [] }
    );

    user.passwordHash = await encrypt("asdf@123");

    if(!roleCount) await (new roleRepo(role)).save();

    if(!accountCount){
        await (new accountRepo(account)).save();
        await (new userRepo({...user,account: account})).save();
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
        moduleEntity.privilageIds = modulePrivilages.map(p => p._id)
        await (new moduleRepo(moduleEntity)).save();
        await privilageRepo.insertMany(modulePrivilages);
      }
    }


}

