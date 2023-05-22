import express from 'express';
import * as http from 'http';

import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import { CommonRoutesConfig } from './src/src/routes/common.routes.config'

import { UserRoutes } from './src/src/routes/user.routes.config';
import debug from 'debug';
import bodyparser from 'body-parser'
import fileUpload from 'express-fileupload';
import { ImageRoutes } from './src/src/routes/image.routes.config';
import dotenv from 'dotenv';
import { AuthRoutes } from './src/src/routes/auth.routes.config';
import { CrmRoutes } from './src/src/routes/crm.routes.config';
//=====================================================================
//       user Statistics
import { StatisticsRoutes as uStatisticsRoutes } from './src/src/routes/statistics.routes.config';
// ===================================================================

//=====================================================================
//                            moderator Statistics
import { StatisticsRoutes as mStatisticsRoutes } from './src/moderator/routes/statistics.routes.config';
// ===================================================================


import BranchRoute from './src/admin/routes/branch.routes.config';
import { ModeratorRoutes } from './src/admin/routes/moderator.route.config';
import TargetRoutes from './src/src/routes/target.routes.config';
import { Server } from 'socket.io'
import { CommonSocketConfig } from './src/src/scoket/common.socket.config';
import NotificationSocket from './src/src/scoket/notification.socket.config';
import NotificationRoutes from './src/src/routes/notification.routes.config';
import Mysql2Database from './src/src/database/Mysql2.database';
import AdminTargetRoutes from './src/admin/routes/target.routes.config';
import AnnoucementRoutes from './src/src/routes/annoucement.routes.config';
import { AdminStatisticsRoutes } from './src/admin/routes/aStatistics.routes.config';
import HoldRoute from './src/Crm/routes/hold.routes.config';
import { FilesRoutes } from './src/src/routes/files.routes.config';


// database password c#ovDy|pd:7I


const cookieParser = require('cookie-parser');


// --------------------------------------------
const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 1000;
const routes: Array<CommonRoutesConfig> = [];
const socket: Array<CommonSocketConfig> = [];
const debugLog: debug.IDebugger = debug('app');

const dotenvResult = dotenv.config();



// if (dotenvResult.error) {

//     throw dotenvResult.error;
// }

const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:3000',],
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}


// console.log("Server", io)

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.use(bodyparser.urlencoded({ extended: true }));
// app.use(bodyparser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));



const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true })
    ),
}


if (!process.env.DEBUG) {
    loggerOptions.meta = false;
}


app.use(expressWinston.logger(loggerOptions));

// toutes ----->





routes.push(new UserRoutes(app));
routes.push(new ImageRoutes(app));
routes.push(new AuthRoutes(app));
routes.push(new CrmRoutes(app));
routes.push(new uStatisticsRoutes(app));
routes.push(new TargetRoutes(app));
routes.push(new AdminTargetRoutes(app));
routes.push(new NotificationRoutes(app));
routes.push(new HoldRoute(app));
routes.push(new FilesRoutes(app));


// Admin
routes.push(new BranchRoute(app));
routes.push(new ModeratorRoutes(app));

// Moderator
routes.push(new mStatisticsRoutes(app))
// Moderator
routes.push(new AdminStatisticsRoutes(app))



const runningMessage = `Server running at https://localhost:${port}`;

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage);
});

// backend v1
server.listen(port, () => {
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });



    // console.log(runningMessage);
})




const io = new Server(server, {
    cors: corsOptions
})

routes.push(new AnnoucementRoutes(app, io));
// Socket 
new NotificationSocket(io).configureSocket()
