import { Application } from "express";
import { CommonRoutesConfig } from "../../src/routes/common.routes.config";
import jwtMiddleware from "../../auth/middleware/jwt.middleware";
import permissionMiddleware from "../../auth/middleware/permission.middleware";
import { PermissionFlag } from "../../auth/middleware/permissionFlad.enum";
import statisticsController from "../controller/statistics.controller";


export class StatisticsRoutes extends CommonRoutesConfig {


    constructor(app: Application) {
        super(app, "statistics routes moderator")
    }

    configRoutes(): Application {

        this.app
            .route("/moderator/statistics")
            .get(jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.MODERATOR]),
                statisticsController.ProgressOfUser
            )
        return this.app
    }
}

