import express from 'express';
import { CommonRoutesConfig } from '../../src/routes/common.routes.config';
import debug from 'debug';

import BodyValidationMiddleware from '../../src/common/middleware/body.validate.middleware';
import userMiddleware from '../../auth/user/middlewares/user.middleware';
import jwtMiddleware from '../../auth/middleware/jwt.middleware';
import permissionMiddleware from '../../auth/middleware/permission.middleware';
import { PermissionFlag } from '../../auth/middleware/permissionFlad.enum';
import zodValidateMiddleware from '../../src/common/middleware/zod.validate.middleware';
import ModeratorController from '../controller/moderator.controller';
import { createModeratorSchema, updateModeratorSchema } from '../dto/moderator.dto';
const log: debug.IDebugger = debug("route:user.routes")

export class ModeratorRoutes extends CommonRoutesConfig {

    constructor(app: express.Application) {
        super(app, "UserRoutes");
    }

    configRoutes(): express.Application {
        this.app
            .route(`/admin/moderator`)
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN, PermissionFlag.MODERATOR]),
                ModeratorController.getModerator
            )
            .post(
                jwtMiddleware.validJWTNeeded,
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                zodValidateMiddleware.validate(createModeratorSchema),
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN]),
                userMiddleware.validateSameEmailDoesntExist,
                ModeratorController.createModerator
            )
            .put(
                jwtMiddleware.validJWTNeeded,
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                zodValidateMiddleware.validate(updateModeratorSchema),
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN]),
                ModeratorController.updateModerator
            )

        this.app.route('/admin/moderator/:userId')
            .delete(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN]),
                ModeratorController.deleteModerator
            )
            .get(
                jwtMiddleware.validJWTNeeded,
                ModeratorController.getModeratorById
            )


        this.app.route('/admin/moderator/branch/:branchId')
            .get(ModeratorController.getModeratorByBranchId)

        return this.app;
    }

}