import { Request, Response } from 'express'
import Mysql2Database from '../database/Mysql2.database';
import { v4 as uuid4 } from 'uuid';
import { createTargetDto, updateTargetDto } from '../dto/target.dto';
import mysql2 from 'mysql2/promise'
import uniquerId from '../common/class/uniquerId.class';
class TagetController {



    async create(req: Request<{}, {}, createTargetDto>, res: Response) {

        const sqlQuery = `INSERT INTO target (targetID, target, userID)
                        VALUES ('${uniquerId.generate()}', ${req.body.target}, '${req.body.userID}')
                        ON DUPLICATE KEY UPDATE target = VALUES(target);`

        // const values = [{ targetID: uuid4(), target: req.body.target, userID: req.body.userID }]
        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [tResult,] = await connection.execute(sqlQuery);
            // console.log(tResult)
            // console.log((tResult as any).affectedRows)


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
                    "${role}" and moderatorID = "${user.userID}";`

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


    async target(req: Request<{}, {}, {}, { role: string }>, res: Response) {

        // const role = req.query.role;
        const user = (req.res?.locals.jwt)

        let sqlQuery = `SELECT * from target where userID= "${user.userID}"`

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