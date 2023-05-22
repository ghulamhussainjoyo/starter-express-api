import express, { Request, Response } from 'express'
import { v4 as uuid4 } from 'uuid';
import { createBranchDto, updateBranchDto } from '../dto/branch.dto'
import Mysql2Database from '../../src/database/Mysql2.database'
import mysql2 from 'mysql2/promise'
import { updateTargetDto } from '../../src/dto/target.dto';
import uniquerIdClass from '../../src/common/class/uniquerId.class';

class BranchController {

    async create(req: Request<{}, {}, createBranchDto, {}>, res: Response) {
        const sqlQuery = `INSERT INTO branch set ?`
        const value = [
            {
                branchID: uniquerIdClass.generate(),
                name: req.body.name,
                address: req.body.address,
                bankAccount: req.body.bankAccount,
                branchManager: req.body.branchManager,
                telephone: req.body.telephone,
            }
        ]
        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [bResult,] = await connection.execute(mysql2.format(sqlQuery, value));

            console.log("🚀 ~ file: branch.controller.ts:26 ~ BranchController ~ create ~ bResult:", bResult)


            if ((bResult as any).affectedRows > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Branch created Successfully'
                })
            }
            else {
                return res.status(500).json({
                    success: false,
                    error: ["internal server error"]
                })
            }




        } catch (error: any) {
            res.status(404).json({ success: false, error: [error.message] })
        }
    }

    async branches(req: Request<{}, {}, {}>, res: Response) {
        const sqlQuery =
            `
        SELECT b.*, 
        COUNT(CASE WHEN u.role = 'user' THEN 1 ELSE NULL END) as numberOfUser,
        COUNT(CASE WHEN u.role = 'moderator' THEN 1 ELSE NULL END) as numberOfModerator
        FROM branch b
        LEFT JOIN users u ON b.branchID = u.branchID
        GROUP BY b.branchID;
        `

        try {


            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [rows] = await connection?.execute(sqlQuery);
            return res.status(200).json({
                success: true,
                branch: rows
            })

        } catch (error) {
            return res.status(404).json({
                success: false,
                error: [(error as any).message]
            })
        }
    }

    async branchById(req: Request<{ id: string }, {}, {}>, res: Response) {

        const id = req.params.id;
        const sqlQuery = `SELECT * FROM branch WHERE branchID = "${id}"`

        try {

            let connection: mysql2.Connection = await Mysql2Database.createConnection();;
            const [bResult,] = await connection.execute(sqlQuery);

            return res.status(200).json({
                success: true,
                branch: bResult
            })

        } catch (error) {
            return res.status(404).json({
                success: false,
                error: [(error as any).message]
            })
        }
    }

    async deleteBranch(req: Request<{ id: string }, {}, {}>, res: Response) {

        console.log("delete", req.params)
        const id = req.params.id;
        const sqlQuery
            = `delete from branch where branchID = "${id}"`

        try {

            let connection: mysql2.Connection = await Mysql2Database.createConnection();;
            const [bResult,] = await connection.execute(sqlQuery);
            // console.log(bResult)
            // console.log((bResult as any).affectedRows)

            if ((bResult as any).affectedRows > 0) {
                return res.status(200).json({
                    success: true,

                    message: "branch deleted successfully"
                })
            }
            else {
                return res.status(404).json({
                    success: true,
                    error: ["branch can not delete deleted"]
                });
            }
        } catch (error) {
            return res.status(404).json({
                success: false,
                error: [(error as any).message]
            })
        }
    }

    async update(req: Request<{ id: string }, {}, updateBranchDto, {}>, res: Response) {

        const branchId = req.params.id
        const sqlQuery = `UPDATE branch set ? WHERE branchID ="${branchId}"`
        const value = [{
            branchID: req.body.branchID,
            name: req.body.name,
            bankAccount: req.body.bankAccount,
            branchManager: req.body.branchManager,
            address: req.body.address,
            telephone: req.body.telephone,
        }]

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [bResult,] = await connection.execute(mysql2.format(sqlQuery, value));

            return res.status(200).json({
                success: true,
                message: 'branch updated Successfully'
            });

        } catch (error: any) {
            res.status(404).json({ success: false, error: [error.message] })
        }
    }

    async branches_moderator_users(req: Request<{}, {}, {}>, res: Response) {
        const sqlQuery = `
                 SELECT 
                    b.name,
                    b.branchID,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'moderatorName', m.username,
                            'moderatorID', m.userID,
                            'branch', m.branch,
                            'users', (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'username', u.username,
                                        'userID', u.userID,
                                        'branch', u.branch
                                    )
                                ) 
                                FROM users u 
                                WHERE u.moderatorID = m.userID AND u.role = 'user'
                            )
                        )
                    ) AS moderators
                    FROM branch b
                    INNER JOIN users m ON m.branch = b.name AND m.role = 'moderator'
                    GROUP BY b.name, b.branchID order by b.created_at desc;
            `

        try {

            let connection: mysql2.Connection = await Mysql2Database.createConnection();;
            const [bResult,] = await connection.execute(sqlQuery);

            const _modified = (bResult as any)
                .map((_res: any) =>
                ({
                    ..._res, moderators:
                        typeof _res.moderators === 'string' ?
                            JSON.parse(_res.moderators).map((_mod: any) => JSON.parse(_mod)) :
                            _res.moderators
                }))


            return res.status(200).json({
                success: true,
                branch: _modified
            })

        } catch (error) {
            return res.status(404).json({
                success: false,
                error: ["Internal server error"],
            })
        }
    }
}

export default new BranchController()