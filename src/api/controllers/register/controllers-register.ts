import { DependencyContainer } from 'tsyringe'
import { AccountController } from '../account-controller'
import { UserController } from '../user-controller';
import { ModuleController } from '../module-controller';
import { PrivilegeController } from '../privilege-controller';
import { RoleController } from '../role-controller';
import { ToDoController } from '../todo-controller';
import { GoalController } from '../goal-controller';
import { BusinessPlanController } from '../businessPlan-controller';
import { MeasurableController } from '../measurable-controller';

export const registerControllers = (container: DependencyContainer) => {
    container.register<AccountController>('AccountController', AccountController);
    container.register<UserController>('UserController', UserController);
    container.register<ModuleController>('ModuleController', ModuleController);
    container.register<PrivilegeController>('PrivilegeController', PrivilegeController);
    container.register<ToDoController>('ToDoController', ToDoController);
    container.register<GoalController>('GoalController', GoalController);
    container.register<RoleController>('RoleController', RoleController, );
    container.register<BusinessPlanController>('BusinessPlanController', BusinessPlanController, );
    container.register<MeasurableController>('MeasurableController', MeasurableController, );
    return {
        accountController: container.resolve(AccountController),
        userController: container.resolve(UserController),
        moduleController: container.resolve(ModuleController),
        privilegeController: container.resolve(PrivilegeController),
        roleController: container.resolve(RoleController),
        toDoController: container.resolve(ToDoController),
        goalController: container.resolve(GoalController),
        businessPlanController: container.resolve(BusinessPlanController),
        measurableController: container.resolve(MeasurableController),
    }
    // Add more controllers here

}