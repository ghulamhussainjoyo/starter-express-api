import express from 'express'
import debug from 'debug';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const log: debug.IDebugger = debug('app:auth-controller');

import dotenv from 'dotenv'
dotenv.config();


// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;


const tokenExpirationInSeconds = 604800;


class AuthController {

    async createJWT(req: express.Request, res: express.Response) {

        try {

            const refreshId = req.body.userID + jwtSecret;
            const salt = crypto.createSecretKey(crypto.randomBytes(16));
            const hash = crypto
                .createHmac('sha512', salt)
                .update(refreshId)
                .digest('base64');
            req.body.refreshKey = salt.export();
            const token = jwt.sign({ ...req.body, password: '' }, jwtSecret, {
                expiresIn: tokenExpirationInSeconds,
            });
            return res
                .status(201)
                .send({ success: true, accessToken: token, refreshToken: hash });
        } catch (err: any) {
            log('createJWT error: %O', err);
            return res.status(500).json({ success: false, error: [err.message] });
        }
    }
}

export default new AuthController();