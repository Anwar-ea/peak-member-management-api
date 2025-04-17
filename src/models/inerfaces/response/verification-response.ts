import { IAccountResponseBase } from "./response-base";

export interface IVerificationResponse extends IAccountResponseBase{
    jwt?: string;
    expireTime: Date;
    email: string;
    userId: string;
    name: string;
    OTP?: string;
    type: 'ResetPassword';
    status: 'Verified' | 'Expired' | 'Pending' | 'Delivered'
}
