import express, { Request, Response } from 'express';
import { v4 as uuid4 } from 'uuid';
import debug from 'debug';
import { createUserDto, updateUserDto } from '../dto/user.dto';
import argon2 from 'argon2';

import Mysql2Database from '../../../src/database/Mysql2.database';
import mysql2 from 'mysql2/promise'
import onlineUserClass from '../../../src/common/class/onlineUser.class';
import uniquerId from '../../../src/common/class/uniquerId.class';

const log: debug.IDebugger = debug('app:users-dao');

const CLASS_NAME = "USER.CONTROLLER.TSX";

type UserResult = {
    users: {
        target: string;
        userID: string;
        username: string;
        designation: string;
        mobile: string;
        role: string;
        email: string;
        moderatorID: string | null;
        employeeID: string;
        branch: string;
        created_at: string;
    }[];
    total_moderators: number;
    total_users: number;
}

class UserController {



    async create(req: express.Request<{}, {}, createUserDto>, res: express.Response) {

        // console.log(req.body)

        const hashPassword = await argon2.hash(req.body.password);
        let stmt = `Insert INTO users SET ?`;
        let values = [{
            userID: uniquerId.generate(),
            username: req.body.username,
            branch: req.body.branch,
            designation: req.body.designation,
            email: req.body.email,
            employeeID: req.body.employeeID,
            role: req.body.role,
            mobile: req.body.mobile,
            branchID: req.body.branchID,
            password: hashPassword,
            moderatorID: req.body.moderatorID

        }];

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));

            if (result) {
                res.status(200).json({
                    success: true,
                    message: "user created successfully"
                });
            }
            else {
                res.status(404).json({ error: [`user not created`] })
            }
        }
        catch (e: any) {
            res.status(404).json({ error: e.message })
        }
    }


    async user(req: express.Request<{ userId: string }, {}, {}, { role: string }>, res: express.Response) {

        console.log(CLASS_NAME, { params: req.params.userId })
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


    async users(req: Request<{ moderatorId: string }, {}, {}, {}>, res: Response) {
        const moderatorId = req.params.moderatorId;

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [rows] = await connection.execute(`
                SELECT 
                    t.target,
                    u.userID,
                    u.username,
                    u.designation,
                    u.mobile,
                    u.role,
                    u.email,
                    u.moderatorID,
                    u.employeeID,
                    u.branch,
                    u.created_at
                    FROM users u 
                    LEFT JOIN target t ON t.userID = u.userID 
                    WHERE u.role="user" AND u.moderatorID="${moderatorId}"
                    ORDER BY u.created_at DESC;    
            `
            );

            console.log("🚀 ~ file: user.controller.ts:133 ~ UserController ~ users ~ rows:", rows)
            res.status(200).json({ success: false, users: rows });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }




    async update(req: express.Request<{}, {}, updateUserDto>, res: express.Response) {

        // haspassword --------->
        const hashPassword = await argon2.hash(req.body.password);
        let stmt = `UPDATE users SET ? where userID = "${req.body.userID}"`;
        let values = [{
            username: req.body.username,
            branch: req.body.branch,
            designation: req.body.designation,
            email: req.body.email,
            employeeID: req.body.employeeID,
            role: req.body.role,
            mobile: req.body.mobile,
            branchID: req.body.branchID,
            password: hashPassword
        }];


        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));

            if ((result as any).affectedRows > 0) {
                res.status(200).json({
                    success: true,
                    message: "user update successfully"
                });
            }
            else {
                res.status(404).json({ error: [`user can not updated`] })
            }
        }
        catch (e: any) {
            res.status(404).json({ error: e.message })
        }


    }

    async deleteUser(req: express.Request<{ userId: string }, {}, {}>, res: express.Response) {

        // console.log(req.params)
        try {
            const id = req.params.userId;
            const sqlQuery = `delete from users where userID = "${id}";`
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result, _] = await connection.execute(sqlQuery);

            if ((result as any).affectedRows > 0) {
                onlineUserClass.deleteOnlineUser(id)
                return res.status(200).json({ success: true, message: "user deleted successfully" })
            }

        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }
    async getUserByEmailWithPassword(email: string) {
        let connection: mysql2.Connection = await Mysql2Database.createConnection();
        const [rows, _] = await connection.execute(`SELECT * FROM users where email = "${email}"`)
        type rowsType = typeof rows;
        return rows[0 as keyof typeof rows];
    }


}

export default new UserController();