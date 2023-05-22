import { Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload';
import fileController from './file.controller';
import { createAnnoucementDto } from '../dto/annoucement.dto';
import notificationController from './notification.controller';
import { Server } from 'socket.io'




class AnnoucementController {
    async createAnnoucement(req: Request<{}, {}, createAnnoucementDto>, res: Response) {
        const createrId = res.locals.jwt.userID;

        try {
            let fileNames: string[] = [];
            let selectedIds: string[] = [];

            if (req.files) {
                const isFileArray = Array.isArray(req.files.file);
                let files: UploadedFile[] = [];
                if (!isFileArray) {
                    files.push((req.files as any).file);
                }
                else {
                    files = (req.files as any).file;
                }
                fileNames = fileController.uploadFile(files);
            }

            // -----> selected users for creating annoucements
            const __selectedUser = JSON.parse(req.body.selectedUser as any);
            if (!Array.isArray(__selectedUser)) {
                const _selectedUser = JSON.parse(req.body.selectedUser as any);
                Object.keys(_selectedUser).forEach((ids) => {
                    const __moderators = _selectedUser[ids].moderators;
                    const __user = _selectedUser[ids].users;
                    selectedIds = Array.from(new Set([...selectedIds, ...__moderators, ...__user]));
                });
            }
            else {
                selectedIds = __selectedUser;
            }

            const __annoucementData = selectedIds.map((ids) => ({
                userId: ids,
                createrId: createrId,
                subject: req.body.subject,
                body: req.body.body,
                link: req.body.link,
                fileName: JSON.stringify(fileNames)
            }));

            const __result = await notificationController.create({ data: __annoucementData })

            if (__result) {
                return res.status(200).json({
                    success: true,
                    message: "annoucement created successfully"
                })
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: "can not create annoucement"
                })
            }
        }
        catch (error: any) {
            // console.log(error);
            return res.status(400).json({
                success: false,
                error: [error.message]
            })

        }
    }
}

export default new AnnoucementController()