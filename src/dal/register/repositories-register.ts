import { DependencyContainer } from "tsyringe";
import { AccountRepository } from "../account-repository";
import { ModuleRepository } from "../module-repository";
import { PrivilegeRepository } from "../privilage-repository";
import { RoleRepository } from "../role-repository";
import { UserRepository } from "../user-repository";

export const registerRepositories = (container: DependencyContainer) => {
    container.register<AccountRepository>('AccountRepository', AccountRepository);
    container.register<UserRepository>('UserRepository', UserRepository);
    container.register<ModuleRepository>('ModuleRepository', ModuleRepository);
    container.register<PrivilegeRepository>('PrivilegeRepository', PrivilegeRepository);
    container.register<RoleRepository>('RoleRepository', RoleRepository, );
}