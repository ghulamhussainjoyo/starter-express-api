import { Application } from 'express';
import jwtMiddleware from '../../auth/middleware/jwt.middleware';
import { PermissionFlag } from '../../auth/middleware/permissionFlad.enum';
import permissionController from '../../auth/controller/permission.controller';
import permissionMiddleware from '../../auth/middleware/permission.middleware';
import { CommonRoutesConfig } from '../../src/routes/common.routes.config';
import targetController from '../controller/target.controller';

class AdminTargetRoutes extends CommonRoutesConfig {



    constructor(app: Application) {
        super(app, "Taget Routes")
    }

    configRoutes(): Application {


        this.app
            .route("/admin/target")
            .post(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN, PermissionFlag.MODERATOR]),
                targetController.create
            )
            .get(
                jwtMiddleware.validJWTNeeded,
                targetController.targets
            )
        return this.app;
    }

}

export default AdminTargetRoutes;