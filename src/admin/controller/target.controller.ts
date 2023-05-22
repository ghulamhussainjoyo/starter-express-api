import { Request, Response } from 'express'
import { v4 as uuid4 } from 'uuid';

import mysql2 from 'mysql2/promise'
import { createTargetDto, updateTargetDto } from '../../src/dto/target.dto';
import Mysql2Database from '../../src/database/Mysql2.database';
class TagetController {



    async create(req: Request<{}, {}, createTargetDto>, res: Response) {

        const sqlQuery = `INSERT INTO target (targetID, target, userID)
                        VALUES ('${uuid4()}', ${req.body.target}, '${req.body.userID}')
                        ON DUPLICATE KEY UPDATE target = VALUES(target);`

        // const values = [{ targetID: uuid4(), target: req.body.target, userID: req.body.userID }]
        try {

            let connection: mysql2.Connection = await Mysql2Database.createConnection();

            const [tResult,] = await connection.execute(sqlQuery);

            if ((tResult as any).affectedRows > 0) {
                return res.status(200).json({
                    success: true,
                    message: "target assigned successfully"
                })
            }
            else {
                return res.status(404).json({
                    success: true,
                    error: ["target is not assigned"]
                });
            }
        } catch (error) {
            return res.status(404).json({
                success: false,
                error: [(error as any).message]
            })
        }
    }


    async update(req: Request<{ id: string }, {}, updateTargetDto>, res: Response) {
        const targetId = req.params.id
        const sqlQuery = `UPDATE target set ? WHERE targetID ="${targetId}"`

        const value = [{ target: req.body.target }]
        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [bResult,] = await connection.execute(mysql2.format(sqlQuery, value));

            return res.status(200).json({
                success: true,
                message: 'Target updated Successfully'
            })

        } catch (error: any) {
            res.status(404).json({ success: false, error: [error.message] })
        }
    }


    async targets(req: Request<{}, {}, {}, { role: string }>, res: Response) {

        const role = req.query.role;
        const user = (req.res?.locals.jwt)

        let sqlQuery = `SELECT 'employeeID',u.employeeID,
                        'userID',u.userID,
                        'designation',u.designation,
                        'username', u.username,
                        'target', t.target
                    FROM users u
                    LEFT JOIN target t ON u.userID = t.userID where u.role = 
                    "moderator";`

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [tResult, _] = await connection.execute(sqlQuery)
                ;
            return res.status(200).json({
                success: true,
                target: (tResult)
            })
        } catch (error: any) {
            res.status(404).json({ success: false, error: [error.message] })
        }


    }

}

export default new TagetController();