import express from 'express';
import { CommonRoutesConfig } from './common.routes.config';
import debug from 'debug';
import imageController from '../controllers/image.controller';
import fileController from '../controllers/file.controller';


const log: debug.IDebugger = debug("route:user.routes")

export class FilesRoutes extends CommonRoutesConfig {

    constructor(app: express.Application) {
        super(app, "UserRoutes");
    }

    configRoutes(): express.Application {
        // this.app.route(`/file`).post(fileController.uploadFile);
        this.app.route(`/file/:name`).get(fileController.getFile)


        return this.app;
    }

}