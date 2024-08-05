import { IDefaultUserRequest } from "./user-request";

export interface IAccountRequest {
    name: string;
    code: string;
    phoneNo: string;
    email: string;
    address: string;
    temporaryAddress: string;
    zipCode: number;
    country: string;
    state: string;
    city: string;
    street: string;
    longitude: number;
    latitude: number;
    defaultUser?: IDefaultUserRequest;
}