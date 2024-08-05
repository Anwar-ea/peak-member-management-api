import { DependencyContainer } from 'tsyringe'
import { AccountController } from '../account-controller'
import { UserController } from '../user-controller';
import { ModuleController } from '../module-controller';
import { PrivilegeController } from '../privilege-controller';
import { RoleController } from '../role-controller';

export const registerControllers = (container: DependencyContainer) => {
    container.register<AccountController>('AccountController', AccountController);
    container.register<UserController>('UserController', UserController);
    // container.register<ModuleController>('ModuleController', ModuleController);
    // container.register<PrivilegeController>('PrivilegeController', PrivilegeController);
    container.register<RoleController>('RoleController', RoleController, );
    return {
        accountController: container.resolve(AccountController),
        userController: container.resolve(UserController),
        // moduleController: container.resolve(ModuleController),
        // privilegeController: container.resolve(PrivilegeController),
        roleController: container.resolve(RoleController),
    }
    // Add more controllers here

}