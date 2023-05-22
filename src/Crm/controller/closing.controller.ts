import express, { Request, Response } from 'express';
import debug from 'debug';
import Mysql2Database from '../../src/database/Mysql2.database';
import mysql2 from 'mysql2/promise'
import { quoteDto } from '../dto/quote.dto';
import { createClosingDto } from '../dto/closing.dto';

const log: debug.IDebugger = debug('app:lead.controller');

class MeetingController {


    async createClosing(req: express.Request<{ leadID: string }, {}, createClosingDto>, res: express.Response) {


        const crmId = req.body.crmID;
        const userId = res.locals.jwt.userID

        let meetingValue = {
            advance_price: req.body.advance_price,
            cheque_number: req.body.cheque_number,
            lead_person: req.body.lead_person,
            quote_serial: req.body.quote_serial,
            sales_person: req.body.sales_person,
            system_details: req.body.system_details,
            total_amount: req.body.total_amount,
            prev_status: "meeting",
            status: "closing",
            userID: res.locals.jwt.userID
        };

        let stmt = `UPDATE crm SET ? where crmID = "${crmId}" and userID = "${userId}"`;
        let values = [meetingValue];


        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));

            if ((result as any).affectedRows > 0) {

                return res.status(200).json({
                    success: true,
                    message: "meeting turned into closing"
                });
            }

            else {

                return res.status(404).json({ error: [`can not turn meeting into closing`] })
            }
        }
        catch (e: any) {
            console.log({ e })
            res.status(404).json({ error: e.message })
        }
    }


    async getClosingById(req: Request<{ id: string }, {}, {}>, res: express.Response) {

        const crmId = req.params.id
        const userId = res.locals.jwt.userID;

        const stmt = `SELECT * from crm where status ="closing" and userID = "${userId}" and crmID = "${crmId}"`;

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [rows, _] = await connection?.execute(stmt);

            return res.status(200).json({ success: true, closings: rows })
        }
        catch (e: any) {
            return res.status(401).json({ success: false, error: [e.message] })
        }
    }



    async getClosings(req: Request<
        { userId: string },
        {},
        {},
        {
            search: string, page: string,
            day: string,
            month: string,
            year: string
        }>,
        res: express.Response) {


        const { day, month, page, search, year } = req.query

        const recordsPerPage = 10
        const offset = (parseInt(page) - 1) * recordsPerPage
        const userId = req.params.userId


        const totalQuery = `SELECT COUNT(*) as total FROM crm WHERE status = 'closing' AND userID = ?;`

        const query =
            `SELECT * 
            FROM crm WHERE status = ? 
            AND userID = ? 
            ${search ? "AND client_name LIKE CONCAT('%', ?, '%') " : ""}
            ${day ? "and day(created_at) = ?" : ""} 
            ${month ? "and month(created_at) = ?" : ""} 
            ${year ? "and year(created_at) = ?" : ""} 
            ORDER BY created_at DESC LIMIT ? OFFSET ?;`

        let queryParams: string[] =
            ['closing', userId, search, day, month, year, recordsPerPage.toString(), offset.toString()].filter(Boolean);


        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [total] = await connection.execute(totalQuery, [userId]);
            const [rows, _] = await connection.execute(query, queryParams);


            const _total = (total as any)[0].total

            return res.status(200).json({
                success: true,
                closings: {
                    total: _total,
                    data: rows
                }
            })
        }
        catch (e: any) {

            return res.status(401).json({ success: false, error: [e.message] })
        }
    }


    async updateClosing(req: express.Request<{ id: string }, {}, quoteDto>, res: express.Response) {


        const crmId = req.params.id
        const userId = res.locals.jwt.userID

        let updateQuote = {
            ...req.body
        };

        let stmt = `UPDATE crm SET ? where crmID = "${crmId}" and userID = "${userId}"`;
        let values = [updateQuote];


        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));

            if (result) {
                res.status(200).json({
                    success: true,
                    message: "survey updated successfully"
                });
            }
            else {
                res.status(404).json({ error: [`survey can not be updated`] })
            }

        }
        catch (e: any) {
            res.status(404).json({ success: false, error: [e.message] })
        }
    }


}

export default new MeetingController();