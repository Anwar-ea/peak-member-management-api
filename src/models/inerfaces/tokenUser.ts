export interface ITokenUser {
    id: string;
    name: string;
    accountId: string;
    lawFirmId?: string; 
    privileges: Array<string>
}