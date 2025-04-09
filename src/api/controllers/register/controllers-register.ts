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
import { NotificationController } from '../notification-controller';
import { RevenueController } from '../revenue-controller';
import { ReportingController } from '../reporting-controller';
import { CalenderEventController } from '../calender-event-controller';
import { UploadController } from '../upload-controller';
import { CallNoteController } from '../callNote-controller';
import { RetentionController } from '../retention-controller';
import { LawFirmController } from '../law-firm-controller';
import { CustomMeasureableValueController } from '../custom-measureable-value-controller';

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
    container.register<NotificationController>('NotificationController', NotificationController, );
    container.register<RevenueController>('RevenueController', RevenueController, );
    container.register<ReportingController>('ReportingController', ReportingController, );
    container.register<CalenderEventController>('CalenderEventController', CalenderEventController, );
    container.register<UploadController>('UploadController', UploadController, );
    container.register<CallNoteController>('CallNoteController', CallNoteController, );
    container.register<RetentionController>('RetentionController', RetentionController, );
    container.register<CustomMeasureableValueController>('CustomMeasureableValueController', CustomMeasureableValueController, );
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
        notificationController: container.resolve(NotificationController),
        revenueController: container.resolve(RevenueController),
        reportingController: container.resolve(ReportingController),
        calenderEventController: container.resolve(CalenderEventController),
        uploadController: container.resolve(UploadController),
        callNoteController: container.resolve(CallNoteController),
        retentionController: container.resolve(RetentionController),
        lawFirmController: container.resolve(LawFirmController),
        customMeasureableValueController: container.resolve(CustomMeasureableValueController),
    }
    // Add more controllers here

}