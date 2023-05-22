import express, { Request, Response } from 'express';
import { v4 as uuid4 } from 'uuid';
import debug from 'debug';
import { createModeratorDto, updateModeratorDto } from '../dto/moderator.dto';
import argon2 from 'argon2';
import mysql2 from 'mysql2/promise'
import Mysql2Database from '../../src/database/Mysql2.database';

const log: debug.IDebugger = debug('app:users-dao');

class ModeratorController {


    async createModerator(req: express.Request<{}, {}, createModeratorDto>, res: express.Response) {

        // hashPassword --------->
        const hashPassword = await argon2.hash(req.body.password);
        let stmt = `Insert INTO users SET ?`;
        let values = [{
            ...req.body, userID: uuid4(), password: hashPassword
        }];

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));

            if (result) {
                return res.status(200).json({
                    success: true,
                    message: "moderator created successfully"
                });
            }
            else {
                return res.status(404).json({ error: [`moderator not created`] })
            }
        }
        catch (e: any) {
            return res.status(404).json({ error: e.message })
        }
    }


    async getModeratorById(req: express.Request<{ userId: string }, {}, {}>, res: express.Response) {

        const id = req.params.userId
        const stmt = `select * from users where userID = "${id}"`
        let connection: mysql2.Connection = await Mysql2Database.createConnection();
        try {
            const [rows, _] = await connection?.execute(stmt);


            return res.status(200).json({ success: true, users: rows })

        }
        catch (e: any) {
            return res.status(401).json({ success: true, error: [e.message] })
        }
    }


    async getModeratorByBranchId(req: express.Request<{ branchId: string }, {}, {}>, res: express.Response) {

        const id = req.params.branchId

        const stmt = `
            SELECT
                m.userID ,
                m.username ,
                m.email,
                m.mobile,
                t.target,
                COUNT(u.userID) AS emp_count
            FROM
                users m
                LEFT JOIN users u ON m.userID = u.moderatorID
                LEFT join target t on m.userID = t.userID
            WHERE
                m.branchID = '${id}'
                AND m.role = 'moderator'
            GROUP BY
                m.userID,
                m.username;
        `
        let connection: mysql2.Connection = await Mysql2Database.createConnection();
        try {
            const [rows, _] = await connection?.execute(stmt);

            return res.status(200).json({ success: true, users: rows })
        }
        catch (e: any) {
            return res.status(401).json({ success: true, error: [e.message] })
        }
    }


    async getModerator(req: Request, res: express.Response) {
        const sqlQuery = `
                SELECT 
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                    'userID', userID,
                    'username', username,
                    'designation', designation,
                    'mobile', mobile,
                    'role', role,
                    'email', email,
                    'moderatorID', moderatorID,
                    'employeeID', employeeID,
                    'branch', branch,
                    'created_at', created_at
                    )
                ) AS users,
                (SELECT COUNT(*) FROM users WHERE role = 'moderator') AS total_moderators,
                (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users
                FROM users
                WHERE role = 'moderator'
                ORDER BY created_at DESC;
            `;


        let connection: mysql2.Connection = await Mysql2Database.createConnection();
        try {
            const [rows] = await connection?.execute(sqlQuery);

            const users = JSON.parse((rows as any)[0].users);

            res.status(200)
                .json(
                    {
                        success: true,
                        ...(rows as any)[0],
                        users
                    }
                );

        } catch (error: any) {
            res.status(401).json({ success: false, error: [error.message] });
        } finally {
            connection.end();
        }
    }



    async updateModerator(req: express.Request<{}, {}, updateModeratorDto>, res: express.Response) {
        // haspassword --------->
        const hashPassword = await argon2.hash(req.body.password);

        let stmt = `UPDATE users SET ? where userID = "${req.body.userID}"`;
        let values = [{ ...req.body, password: hashPassword }];


        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));
            if (result) {
                return res.status(200).json({
                    success: true,
                    message: "moderator update successfully"
                });
            }
            else {
                return res.status(404).json({ error: [`moderator can not updated`] })
            }
        }
        catch (e: any) {
            return res.status(404).json({ error: e.message })
        }
    }


    async deleteModerator(req: express.Request<{ userId: string }, {}, {}>, res: express.Response) {

        const id = req.params.userId;
        const sqlQuery = `delete from users where userID = "${id}";`

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result, _] = await connection.execute(sqlQuery);

            log("delete:user", result)

            return res.status(200).json({ success: true, message: "moderator deleted successfully" })

        } catch (error: any) {
            return res.status(404).json({ error: error.message })
        }
    }




    async getUserByEmailWithPassword(email: string) {
        let connection: mysql2.Connection = await Mysql2Database.createConnection();

        const [rows, _] = await connection.execute(`SELECT * FROM users where email = "${email}"`)
        type rowsType = typeof rows;
        return rows[0 as keyof typeof rows];
    }


}

export default new ModeratorController();