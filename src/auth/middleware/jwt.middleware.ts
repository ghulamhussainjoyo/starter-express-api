import express from 'express';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Jwt } from '../../src/common/types';
import userController from '../../auth/user/controller/user.controller';
import authMiddleware from './auth.middleware';
import permissionController from '../controller/permission.controller';
import dotenv from 'dotenv'

dotenv.config();


// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;

class JwtMiddleware {

    verifyRefreshBodyField(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (req.body && req.body.refreshToken) {
            return next();
        } else {
            return res
                .status(400)
                .send({ errors: ['Missing required field: refreshToken'] });
        }
    }


    validJWTNeeded(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {

        if (req.headers['authorization']) {
            try {
                const authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).json({ error: ["Please login"] });
                } else {
                    res.locals.jwt = jwt.verify(
                        authorization[1],
                        jwtSecret
                    ) as Jwt;

                    next();
                }
            } catch (err: any) {
                return res.status(403).json({ error: [err.message] });
            }
        } else {


            return res.status(401).json({ error: ["Please login"] });
        }
    }



    async validRefreshNeeded(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const user: any = await userController.getUserByEmailWithPassword(
            res.locals.jwt.email
        );
        const salt = crypto.createSecretKey(
            Buffer.from(res.locals.jwt.refreshKey.data)
        );
        const hash = crypto
            .createHmac('sha512', salt)
            .update(res.locals.jwt.userId + jwtSecret)
            .digest('base64');
        if (hash === req.body.refreshToken) {
            const permissionFlags = permissionController.getPermissionFlag(user.role)
            req.body = {
                userId: user.userID,
                email: user.email,
                permissionFlag: permissionFlags,
            };
            return next();
        } else {
            return res.status(400).send({ errors: ['Invalid refresh token'] });
        }
    }

}



export default new JwtMiddleware()




