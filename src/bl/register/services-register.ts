import { DependencyContainer } from "tsyringe";
import { AccountService } from "../account-service";
import { ModuleService } from "../module-service";
import { PrivilegeService } from "../privilege-service";
import { RoleService } from "../role-service";
import { UserService } from "../user-service";

export const registerServices = (container: DependencyContainer) => {
    container.register<AccountService>('AccountService', AccountService);
    container.register<UserService>('UserService', UserService);
    container.register<ModuleService>('ModuleService', ModuleService);
    container.register<PrivilegeService>('PrivilegeService', PrivilegeService);
    container.register<RoleService>('RoleService', RoleService, );
}