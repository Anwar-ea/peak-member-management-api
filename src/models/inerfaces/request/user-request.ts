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
    age: number;
    dateOfBirth: Date;
    phoneNo: string;
    address: string;
    temporaryAddress?: string;
    country: string;
    state: string;
    city: string;
    zipCode?: number;
    street: string;
    longitude?: number;
    latitude?: number;
    roleId: string;
}