import { DependencyContainer } from "tsyringe";
import { AccountService } from "../account-service";
import { ModuleService } from "../module-service";
import { PrivilegeService } from "../privilege-service";
import { RoleService } from "../role-service";
import { UserService } from "../user-service";
import { GoalService } from "../goal-service";
import { ToDoService } from "../todo-service";
import { BusinessPlanService } from "../businessPlan-service";
import { MeasurableService } from "../measurable-service";
import { NotificationService } from "../notification-service";
import { RevenueService } from "../revenue-service";

export const registerServices = (container: DependencyContainer) => {
    container.register<AccountService>('AccountService', AccountService);
    container.register<UserService>('UserService', UserService);
    container.register<ModuleService>('ModuleService', ModuleService);
    container.register<PrivilegeService>('PrivilegeService', PrivilegeService);
    container.register<RoleService>('RoleService', RoleService);
    container.register<GoalService>('GoalService', GoalService);
    container.register<ToDoService>('ToDoService', ToDoService);
    container.register<BusinessPlanService>('BusinessPlanService', BusinessPlanService);
    container.register<MeasurableService>('MeasurableService', MeasurableService);
    container.register<NotificationService>('NotificationService', NotificationService);
    container.register<RevenueService>('RevenueService', RevenueService);
}