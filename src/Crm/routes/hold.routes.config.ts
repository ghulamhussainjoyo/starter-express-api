import { Application } from 'express'
import { CommonRoutesConfig } from '../../src/routes/common.routes.config';
import jwtMiddleware from '../../auth/middleware/jwt.middleware';
import holdController from '../controller/hold.controller';
import permissionMiddleware from '../../auth/middleware/permission.middleware';
import { PermissionFlag } from '../../auth/middleware/permissionFlad.enum';


class HoldRoute extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, "Hold Routes")
    }

    configRoutes(): Application {

        this.app
            .route('/hold/:crmId')
            .patch(
                jwtMiddleware.validJWTNeeded,
                // permissionMiddleware.permissionFlagRequired([PermissionFlag.USER, PermissionFlag.MODERATOR]),
                holdController.hold
            )
        this.app
            .route('/hold')
            .get(
                jwtMiddleware.validJWTNeeded,
                // permissionMiddleware.permissionFlagRequired([PermissionFlag.USER, PermissionFlag.MODERATOR]),
                holdController.holds
            )

        return this.app
    }
}
export default HoldRoute