import { Application } from 'express'
import { CommonRoutesConfig } from "./common.routes.config";
import jwtMiddleware from '../../auth/middleware/jwt.middleware';
import statisticsController from '../../Crm/controller/statistics.controller';


export class StatisticsRoutes extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, "Statisctics Routes")
    }

    configRoutes(): Application {

        this.app.route("/statistics/:userID")
            .get(
                jwtMiddleware.validJWTNeeded,
                statisticsController.statics
            )
        return this.app;
    }


}