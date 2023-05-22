import { Application } from "express";
import { CommonRoutesConfig } from "../../src/routes/common.routes.config";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import permissionMiddleware from "../../auth/middleware/permission.middleware";
import { PermissionFlag } from "../../auth/middleware/permissionFlad.enum";
import aStatiscticsController from "../controller/aStatisctics.controller";


export class AdminStatisticsRoutes extends CommonRoutesConfig {


    constructor(app: Application) {
        super(app, "statistics routes Admin")
    }

    configRoutes(): Application {


        this.app
            .route("/admin/statistics/moderator/:moderatorId")
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN, PermissionFlag.MODERATOR]),
                aStatiscticsController.statOfModerator
            );

        this.app
            .route("/admin/statistics/branch")
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN, PermissionFlag.MODERATOR]),
                aStatiscticsController.StatOfBranchById
            )

        return this.app
    }
}

