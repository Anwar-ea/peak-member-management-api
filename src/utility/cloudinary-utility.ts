import { v2 as cloudinary, ConfigOptions } from 'cloudinary'
import { MultipartFile } from "@fastify/multipart";
import { writeFile, unlink, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const cloudinaryConfig: ConfigOptions = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};


export const upload = async (file: MultipartFile, userId: string): Promise<string> => {
    cloudinary.config(cloudinaryConfig);
    return new Promise(async (resolve, reject) => {
        let tempDirectory = join(__dirname, '../tempfiles')
        let tempFilePath = join(tempDirectory, `../tempfiles/${userId}`);
  
        if (!existsSync(tempDirectory)) {
          mkdirSync(tempDirectory, { recursive: true });
        }
        const fileBuffer = await file.toBuffer();
        writeFile(tempFilePath, fileBuffer, (err) => {
          if (err) reject(err);
          return;
        })
  
        // Upload file to Cloudinary
        cloudinary.uploader.upload(
          tempFilePath,
          {
            public_id: `${userId}-picture`,
            folder: `${process.env.CLOUDINARY_FOLDER}/profile-pictures/`,
            width: 200,
            height: 200,
            gravity: 'face',
            crop: 'thumb',
          }, // Optional: Specify a folder in Cloudinary
          (error, result) => {
            if (error) {
              reject(error);
            }
            if (result) {
              // Delete the temporary file
              unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) console.log(`Got error while deleting tempFile. filePath: ${tempFilePath}`);
              })
              resolve(result.secure_url);
            }
  
          }
        );
      });
}