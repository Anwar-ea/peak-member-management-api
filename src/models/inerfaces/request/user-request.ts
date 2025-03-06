export interface IDefaultUserRequest {
    userName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    firm: string;
    dateOfBirth?: Date;
    pictureUrl?: string;
}

export interface IUserRequest {
    userName: string;
    email: string;
    password: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth?: Date;
    roleId: string;
    pictureUrl?: string;
    firm: string;
    position?: string;
}