import { DependencyContainer } from 'tsyringe'
import { AccountController } from '../account-controller'
import { UserController } from '../user-controller';
import { ModuleController } from '../module-controller';
import { PrivilegeController } from '../privilege-controller';
import { RoleController } from '../role-controller';
import { ToDoController } from '../todo-controller';
import { GoalController } from '../goal-controller';

export const registerControllers = (container: DependencyContainer) => {
    container.register<AccountController>('AccountController', AccountController);
    container.register<UserController>('UserController', UserController);
    container.register<ModuleController>('ModuleController', ModuleController);
    container.register<PrivilegeController>('PrivilegeController', PrivilegeController);
    container.register<ToDoController>('ToDoController', ToDoController);
    container.register<GoalController>('GoalController', GoalController);
    container.register<RoleController>('RoleController', RoleController, );
    return {
        accountController: container.resolve(AccountController),
        userController: container.resolve(UserController),
        moduleController: container.resolve(ModuleController),
        privilegeController: container.resolve(PrivilegeController),
        roleController: container.resolve(RoleController),
        toDoController: container.resolve(ToDoController),
        goalController: container.resolve(GoalController),
    }
    // Add more controllers here

}