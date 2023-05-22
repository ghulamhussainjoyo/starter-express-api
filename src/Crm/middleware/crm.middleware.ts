import { Request, Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'
import mysql2 from 'mysql2/promise'
import Mysql2Database from '../../src/database/Mysql2.database';

class crmMiddleware {



    checkStatus(status: string) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const crmId = req.params.id;
            const userId = res.locals.jwt.userID;
            const stmt = `Select status from crm where crmID = "${crmId}" and userID = "${userId}"`
            try {
                let connection: mysql2.Connection = await Mysql2Database.createConnection();
                const [rows, _] = await connection?.execute(stmt);

                if ((rows as Array<{ status: string }>)[0].status === status) {
                    next();
                }
                else {
                    return res.status(401).json({ success: false, error: [`status of ${status} does not match`] })
                }
            }
            catch (e: any) {
                return res.status(401).json({ success: false, error: [e.message] })
            }
        }
    }


}

export default new crmMiddleware();
