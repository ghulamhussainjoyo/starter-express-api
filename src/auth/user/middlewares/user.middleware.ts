import express from 'express';
import mysql from 'mysql';
import { dbConfig } from '../../../src/common/config';
import debug from 'debug';
import Mysql2Database from '../../../src/database/Mysql2.database';
import mysql2 from 'mysql2/promise'
const log: debug.IDebugger = debug('app:user.middleware')



class UserMiddleware {



    validateRequiredUserBodyFields(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction) {

        if (req.body && req.body.email && req.body.password) {
            next();
        } else {
            res.status(400).send({
                error: `Missing required fields email and password`,
            });
        }

    }

    async validateSameEmailDoesntExist(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {

        let selectQuery = `Select email from users where email="${req.body.email}"`
        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result, _] = await connection.execute(selectQuery)
            if ((result as any).length !== 0) {
                log((result as any)[0].email);
                res.status(400).send({ error: ['User email already exists'] });
            }
            else {
                next();
            }

        } catch (error: any) {
            res.status(400).send({ error: [error.message] });
        }




    }


    async validateUserExists(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        let selectEmailQuery = `Select email from users where userID="${req.params.id}"`


        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [result, _] = await connection.execute(selectEmailQuery)
            log((result as any)[0].userID);
            if ((result as any).length !== 0) {
                return res.status(400).send({ errors: [`User ${req.params.id} not found`] });
            }
            else {
                next();
            }

        } catch (error: any) {
            return res.status(400).send({ errors: [error.message] });
        }

    }

    async validateEmailFormat(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {

        const emailRegex = /^[a-zA-Z0-9._%+-]+@rouelite\.com$/;
        const isMatch = emailRegex.test(req.body.email)
        if (!isMatch) {
            return res.status(400).send({ errors: [`email is not valid`] });
        }
        else {
            next()
        }

    }
}


export default new UserMiddleware();