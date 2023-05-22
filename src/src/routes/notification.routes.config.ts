import Mysql2Database from "../database/Mysql2.database";
import { CommonRoutesConfig } from "./common.routes.config";
import { Application } from "express";
class NotificationRoutes extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, "notification route")
    }

    configRoutes(): Application {
        this.app
            .route('/notification/stream')
            .get((req, res) => {

                res.statusCode = 200;
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Cache-Control", "no-cache");
                res.setHeader("connection", "keep-alive");
                res.setHeader("Content-Type", "text/event-stream");

                setInterval(() => {
                    res.write('event: ping\n');  // added these
                    res.write(`data: ${JSON.stringify({ date: Date.now() })}`);
                    res.write("\n\n")

                }, 1000);


                // SSE listener for disconnects
                req.on('close', () => {
                    // console.log('Client disconnected');
                });

            })

        this.app
            .route('/notification')
            .get(async (req, res) => {
                try {
                    let connection = await Mysql2Database.createConnection();
                    const [row,] = await connection.execute('Select * from users')

                    res.status(200).json({
                        success: true,
                        notification: [{
                            title: "Ghulam Hussain",
                            body: "hello"
                        }]
                    })
                } catch (error) {

                }
            })


        return this.app
    }
}


export default NotificationRoutes