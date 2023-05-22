import express from 'express';

import argon2 from 'argon2'
import userController from '../user/controller/user.controller';
import permissionflagController from '../controller/permission.controller';




class AuthMiddleware {
    // 
    async verifyUserPassword(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {


        const user: any = await userController.getUserByEmailWithPassword(req.body.email)


        if (user) {
            const passwordHash = user.password
            const permissionFlag = permissionflagController.getPermissionFlag(user.role)

            if (await argon2.verify(passwordHash, req.body.password)) {
                req.body = {
                    ...user,
                    permissionFlag: permissionFlag,
                };

                return next();
            }
        }
        res.status(400).send({ success: false, error: ['Invalid email and/or password'] });
    }


}

export default new AuthMiddleware();