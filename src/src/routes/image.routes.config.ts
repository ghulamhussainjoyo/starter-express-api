import express from 'express';
import { CommonRoutesConfig } from './common.routes.config';
import debug from 'debug';
import imageController from '../controllers/image.controller';


const log: debug.IDebugger = debug("route:user.routes")

export class ImageRoutes extends CommonRoutesConfig {

    constructor(app: express.Application) {
        super(app, "UserRoutes");
    }

    configRoutes(): express.Application {
        this.app.route(`/image`).post(imageController.uploadImage);
        this.app.route(`/image/:name`).get(imageController.getImage)


        return this.app;
    }

}