import {hash, genSalt, compare} from 'bcrypt';

export const encrypt = async (data: string): Promise<string> => {
    return await hash(data, 10);
}

export const compareHash = async (data: string, hash: string): Promise<boolean> => {
    return await compare(data, hash);
}