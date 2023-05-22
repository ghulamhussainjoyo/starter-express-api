import { Application } from 'express';
import { CommonRoutesConfig } from '../../src/routes/common.routes.config'
import jwtMiddleware from '../../auth/middleware/jwt.middleware';
import zodValidate from '../../src/common/middleware/zod.validate.middleware';
import { createBranchSchema, updateBranchShema } from '../dto/branch.dto';
import branchController from '../controller/branch.controller';
import permissionMiddleware from '../../auth/middleware/permission.middleware';
import { PermissionFlag } from '../../auth/middleware/permissionFlad.enum';



class BranchRoute extends CommonRoutesConfig {

    constructor(app: Application) {
        super(app, "Branch Routes");
    }
    configRoutes(): Application {

        this.app
            .route("/admin/branch")
            .post(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN]),
                zodValidate.validate(createBranchSchema),
                branchController.create
            )
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN]),
                branchController.branches
            )



        this.app
            .route("/admin/branch/:id")
            .put(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN]),
                zodValidate.validate(updateBranchShema),
                branchController.update
            )
            .delete(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN]),
                branchController.deleteBranch
            )
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN]),
                branchController.branchById
            )


        this.app
            .route("/admin/brnaches&moderators&users")
            .get(branchController.branches_moderator_users)


        return this.app



    }

}

export default BranchRoute