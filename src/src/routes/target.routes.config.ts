import { Application } from 'express';
import { CommonRoutesConfig } from './common.routes.config'
import jwtMiddleware from '../../auth/middleware/jwt.middleware';
import { PermissionFlag } from '../../auth/middleware/permissionFlad.enum';
import permissionController from '../../auth/controller/permission.controller';
import permissionMiddleware from '../../auth/middleware/permission.middleware';
import targetController from '../controllers/target.controller';
class TargetRoutes extends CommonRoutesConfig {



    constructor(app: Application) {
        super(app, "Taget Routes")
    }

    configRoutes(): Application {


        this.app
            .route("/target")
            .post(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN, PermissionFlag.MODERATOR]),
                targetController.create
            )
            .get(
                jwtMiddleware.validJWTNeeded,
                targetController.targets
            )

        this.app
            .route("/target/user")
            .get(
                jwtMiddleware.validJWTNeeded,
                targetController.target
            )
        return this.app;
    }

}

export default TargetRoutes;