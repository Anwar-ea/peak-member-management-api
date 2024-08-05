import path from 'path';
import { readFile, readFileSync } from 'fs';


export const templateReader = (templateName: string): string =>{
    let filePath = path.join(__dirname, '../templates', templateName);    
    let file =  readFileSync(filePath, 'utf-8'); 
    return file;
}