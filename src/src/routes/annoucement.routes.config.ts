

import jwtMiddleware from '../../auth/middleware/jwt.middleware';
import permissionMiddleware from '../../auth/middleware/permission.middleware';
import { PermissionFlag } from '../../auth/middleware/permissionFlad.enum';
import annoucementController from '../controllers/annoucement.controller';
import { CommonRoutesConfig } from './common.routes.config'
import { Application } from 'express'
import { Server } from 'socket.io'

class AnnoucementRoutes extends CommonRoutesConfig {

    io: Server
    constructor(app: Application, _io: Server) {
        super(app, "Annoucement Routes")
        this.io = _io;
    }
    configRoutes(): Application {

        this.app
            .route("/annoucement")
            .post(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.ADMIN, PermissionFlag.MODERATOR]),
                annoucementController.createAnnoucement
            )
        return this.app;
    }
    setServer(io: Server) {
        this.io = io;
    }
}

export default AnnoucementRoutes
