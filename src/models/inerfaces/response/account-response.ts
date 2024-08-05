import { IResponseBase } from "./response-base";

export interface IAccountResponse extends IResponseBase {
    name: string;
    code: string;
    phoneNo: string;
    email: string;
    address: string;
    temporaryAddress?: string;
    zipCode: number;
    country: string;
    state: string;
    city: string;
    street: string;
    longitude: number;
    latitude: number;
}