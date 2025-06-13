import {hash, genSalt, compare} from 'bcrypt';
import crypto from 'crypto';

export const encrypt = async (data: string): Promise<string> => {
    return await hash(data, 10);
}

export const compareHash = async (data: string, hash: string): Promise<boolean> => {
    return await compare(data, hash);
}

export const decryptSSOToken = async (token: string): Promise<Record<string, string>> => {
    const secretKey = 'jf8gf8g^3*s';
    const secretIv = 'd&&9"dh4%:@';

    // Generate key and IV to match PHP
    const key : any = crypto.createHash('sha256').update(secretKey).digest();
    const iv : any = crypto.createHash('sha256').update(secretIv).digest().subarray(0, 16);

    try {
        // Convert URL-safe base64 to standard base64
        let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
        const padLength = (4 - (base64.length % 4)) % 4;
        base64 += '='.repeat(padLength);

        // Decode base64
        const encrypted : any = Buffer.from(base64, 'base64'); 
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        decipher.setAutoPadding(false); // Disable automatic padding
        
        let decrypted : any = decipher. update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        // Remove PKCS7 padding manually
        const padByte = decrypted[decrypted.length - 1];
        if (padByte > 0 && padByte <= 16) {
            decrypted = decrypted.subarray(0, decrypted.length - padByte);
        }
        
        // Parse the URL-encoded string
        const params = new URLSearchParams(decrypted.toString('utf8'));
        const result: Record<string, string> = {};
        params.forEach((value, key) => {
            result[key] = value;
        });
        
        return result;
    } catch (error: any) {
        console.error('Decryption failed:', error);
        throw new Error('Invalid SSO token: ' + error.message);
    }
};

