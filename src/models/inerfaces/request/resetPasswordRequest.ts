export interface IResetPassword {
    password: string;
    userId: string;
}

export interface IResetPasswordWithEmail{
    password: string;
    token: string;
}