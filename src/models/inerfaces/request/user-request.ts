export interface IDefaultUserRequest {
    userName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
}

export interface IUserRequest {
    userName: string;
    email: string;
    password: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: Date;
    roleId: string;
}