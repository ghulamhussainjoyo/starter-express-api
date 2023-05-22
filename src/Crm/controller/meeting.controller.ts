import express, { Request, Response } from 'express';
import { v4 as uuid4 } from 'uuid';
import debug from 'debug';
import Mysql2Database from '../../src/database/Mysql2.database';
import mysql2 from 'mysql2/promise'

import { quoteDto } from '../dto/quote.dto';

const log: debug.IDebugger = debug('app:lead.controller');

class MeetingController {


    async createMeeting(req: express.Request<{ leadID: string }, {}, quoteDto>, res: express.Response) {


        const crmId = req.body.crmID;
        const userId = res.locals.jwt.userID

        let meetingValue = {
            ...req.body,
            prev_status: "quote",
            status: "meeting",
            userID: res.locals.jwt.userID
        };

        let quoteStmt = `UPDATE statistics SET total_meeting = (CASE WHEN total_meeting IS NOT NULL THEN total_meeting + 1 ELSE 1 END) WHERE statID = "${userId}";`

        let stmt = `UPDATE crm SET ? where crmID = "${crmId}" and userID = "${userId}"`;
        let values = [meetingValue];


        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));
            const [meetingResult] = await connection.execute(quoteStmt);

            if (result && meetingResult) {
                return res.status(200).json({
                    success: true,
                    message: "quote turned into meeting"
                });
            }
            else {
                return res.status(404).json({ error: [`can not turn quote into meeting`] })
            }
        }
        catch (e: any) {
            res.status(404).json({ error: e.message })
        }
    }


    async getMeetingById(req: Request<{ id: string }, {}, {}>, res: express.Response) {

        const crmId = req.params.id
        const userId = res.locals.jwt.userID;

        const stmt = `SELECT crmID,client_name,client_contact,city,monthly_consumption,solar_requirements,monthly_bill_amount,surveyor_name,total_amperes,meter_type,gps_coordinates, roof_type, system_type, other_survey, structure_type, prev_status,status, system_type, structure_type, solar_requirements, total_price,advance_price,other_quote, poc_name, panel_names, poc_contact, venue_address from crm where status = "meeting" and userID = "${userId}" and crmID = "${crmId}"`;

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [rows, _] = await connection?.execute(stmt);

            return res.status(200).json({ success: true, meeting: rows })
        }
        catch (e: any) {
            return res.status(401).json({ success: false, error: [e.message] })
        }
    }



    async getMeetings(req: Request<{ userId: string }, {}, {}, {
        search: string, page: string, day: string,
        month: string,
        year: string
    }>, res: express.Response) {

        const { day, month, page, search, year } = req.query

        const recordsPerPage = 10
        const offset = (parseInt(page) - 1) * recordsPerPage
        const userId = req.params.userId





        const totalQuery = `SELECT COUNT(*) as total FROM crm WHERE status = 'closing' AND userID = ?;`

        const meetingQuery =
            `SELECT 
            crmID,client_name,client_contact,city,monthly_consumption,solar_requirements,monthly_bill_amount,surveyor_name,total_amperes,meter_type,gps_coordinates,roof_type,system_type,other_survey,structure_type,prev_status,status, system_type,structure_type,solar_requirements,total_price,advance_price,other_quote, poc_name, panel_names, poc_contact, venue_address from crm 
            where status ="meeting" 
            and userID = ? 
            ${search ? "AND client_name LIKE CONCAT('%', ?, '%') " : ""}
                ${day ? "and day(created_at) = ?" : ""} 
                ${month ? "and month(created_at) = ?" : ""} 
                ${year ? "and year(created_at) = ?" : ""} 
            order by created_at desc 
            limit ? 
            offset ?`;

        const meetingQueryParams: string[] = [userId, search, day, month, year, recordsPerPage.toString(), offset.toString()].filter(Boolean)

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [total] = await connection.execute(totalQuery, [userId]);
            const [rows, _] = await connection?.execute(meetingQuery, meetingQueryParams);

            const _total = (total as any)[0].total
            return res.status(200).json({ success: true, meetings: { data: rows, total: _total } })
        }
        catch (e: any) {
            return res.status(401).json({ success: false, error: [e.message] })
        }
    }


    async updateMeeting(req: express.Request<{ id: string }, {}, quoteDto>, res: express.Response) {


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
                    message: "meeting updated successfully"
                });
            }
            else {
                res.status(404).json({ error: [`meeting can not be updated`] })
            }

        }
        catch (e: any) {
            res.status(404).json({ success: false, error: [e.message] })
        }
    }


}

export default new MeetingController();