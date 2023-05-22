import express, { Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload';
import path from 'path';
import fs from 'fs'
class FileController {

    uploadFile(files: UploadedFile[]): string[] {
        const _file = files;
        const fileNames: string[] = []

        const __path = path.resolve(__dirname + "../../assets/files")

        // console.log(__path)

        !fs.existsSync(__path) && fs.mkdirSync(__path, { recursive: true });

        _file.forEach((file) => {
            const fileName: string = Date.now() + "_" + file.name;
            file.mv(path.resolve(__path, fileName), (err) => {
                if (err) {
                    return err
                }
            })
            fileNames.push(fileName)
        })
        return fileNames
    }




    getFile(req: Request, res: Response) {
        const name = req.params.name;
        const image = path.resolve(__dirname, `../assets/files/${name}`);
        if (image) {
            return res.sendFile(image);
        }
        else {
            return res.json(404).json({
                error: ["File Not Found"]
            })
        }

    }

}


export default new FileController();