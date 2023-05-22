import express from 'express';
import { CommonRoutesConfig } from './common.routes.config';
import debug from 'debug';
import UserController from '../../auth/user/controller/user.controller';
import UserMiddleware from '../../auth/user/middlewares/user.middleware';
import BodyValidationMiddleware from '../common/middleware/body.validate.middleware';
import userMiddleware from '../../auth/user/middlewares/user.middleware';
import jwtMiddleware from '../../auth/middleware/jwt.middleware';
import permissionMiddleware from '../../auth/middleware/permission.middleware';
import { PermissionFlag } from '../../auth/middleware/permissionFlad.enum';
import userController from '../../auth/user/controller/user.controller';
import zodValidateMiddleware from '../common/middleware/zod.validate.middleware';
import { createUserSchema, updateUserSchema } from '../../auth/user/dto/user.dto';
const log: debug.IDebugger = debug("route:user.routes")

export class UserRoutes extends CommonRoutesConfig {

    constructor(app: express.Application) {
        super(app, "UserRoutes");
    }

    configRoutes(): express.Application {
        this.app
            .route(`/user`)
            .post(
                jwtMiddleware.validJWTNeeded,
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                zodValidateMiddleware.validate(createUserSchema),
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN, PermissionFlag.MODERATOR]),
                userMiddleware.validateSameEmailDoesntExist,
                userController.create
            )
            .put(
                jwtMiddleware.validJWTNeeded,
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                zodValidateMiddleware.validate(updateUserSchema),
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN, PermissionFlag.MODERATOR]),
                userController.update
            )

        this.app
            .route(`/users/:moderatorId`)
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired(
                    [PermissionFlag.ADMIN, PermissionFlag.MODERATOR]
                ),
                UserController.users
            )

        this.app
            .route('/user/:userId')
            .delete(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.MODERATOR]),
                UserController.deleteUser
            )
            .get(
                jwtMiddleware.validJWTNeeded,
                UserController.user
            )

        return this.app;
    }

}