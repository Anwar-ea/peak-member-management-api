import {hash, genSalt, compare} from 'bcrypt';

export const encrypt = async (data: string): Promise<string> => {
    const salt = await genSalt(10, 'a');
    return await hash(data, salt);
}

export const compareHash = async (data: string, hash: string): Promise<boolean> => {
    return await compare(data, hash);
}