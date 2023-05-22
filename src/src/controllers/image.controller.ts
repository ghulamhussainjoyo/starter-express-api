import express, { Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload';
import path from 'path';

class ImageController {

    uploadImage(req: Request, res: Response) {
        const img: UploadedFile = req.files?.image as UploadedFile;

        if (img) {
            const imageName = Date.now() + "_" + img.name;

            img.mv(path.resolve(__dirname, "../images", imageName), (err) => {
                if (!err) {
                    return res.status(200).json({
                        success: true,
                        message: "image uploaded successfully",
                        imageName: imageName
                    });
                }
                else {
                    return res.status(404).json({
                        erro: [err]
                    })
                }

            });
        }
        else {
            res.status(404).json({ err: ["File Not Found"] });
        }


    }

    getImage(req: Request, res: Response) {
        const name = req.params.name;
        const image = path.resolve(__dirname, `../images/${name}`);
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


export default new ImageController();