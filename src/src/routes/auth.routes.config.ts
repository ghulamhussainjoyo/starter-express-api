import { CommonRoutesConfig } from './common.routes.config';
import authController from '../../auth/controller/auth.controller';
import authMiddleware from '../../auth/middleware/auth.middleware';
import express from 'express';
import BodyValidationMiddleware from '../../src/common/middleware/body.validate.middleware';

import { body } from 'express-validator';
import jwtMiddleware from '../../auth/middleware/jwt.middleware';

export class AuthRoutes extends CommonRoutesConfig {

    constructor(app: express.Application) {
        super(app, 'AuthRoutes');
    }

    configRoutes(): express.Application {
        this.app.post(`/auth`, [
            body('email').isEmail(),
            body('password').isString(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            authMiddleware.verifyUserPassword,
            authController.createJWT,
        ]);

        this.app.post(`/auth/refreshToken`, [
            jwtMiddleware.validJWTNeeded,
            jwtMiddleware.verifyRefreshBodyField,
            jwtMiddleware.validRefreshNeeded,
            authController.createJWT,
        ]);

        this.app.route(`/auth/verify`).post(jwtMiddleware.validJWTNeeded, (req, res) => {
            return res.status(200).json({ success: true, message: "verified" })
        })

        return this.app;
    }

}