import express, { Request, Response } from 'express';

import debug from 'debug';
import Mysql2Database from '../../src/database/Mysql2.database';
import mysql2 from 'mysql2/promise'
import { updateLeadDto, } from '../model/lead.model';
import { createLeadDto } from '../dto/lead.dto';
import uniquerId from '../../src/common/class/uniquerId.class';

const log: debug.IDebugger = debug('app:lead.controller');



class LeadController {


    async createLead(req: express.Request<{}, {}, createLeadDto>, res: express.Response) {
        try {


            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let userID = res.locals.jwt.userID;
            let LeadSqlQuery = `Insert INTO crm SET ?`;
            let leadValues = [{
                crmID: uniquerId.generate(),
                ...req.body,
                userID
            }];

            let [crmResult, _] = await connection.execute(mysql2.format(LeadSqlQuery, leadValues));

            return res.status(200).json({
                success: true,
                message: "lead created successfully"
            });

        } catch (error: any) {

            res.status(404).json({ success: false, error: [error.message] })

        }
    }


    async getLeads(req: express.Request<{ userId: string }, {}, {}, { search: string, page: string, day: string, month: string, year: string }>, res: express.Response) {

        const { day, month, search, page, year } = req.query
        const recordsPerPage = 10
        const offset = (parseInt(page) - 1) * recordsPerPage
        const userId = req.params.userId;

        const totalQuery = `SELECT COUNT(*) as total FROM crm WHERE status = 'lead' AND userID = ?;`

        let leadQuery = `
        Select
         crmID,
         client_name,
         client_contact,
         city,
         monthly_consumption,  
         solar_requirements,
         monthly_bill_amount,
         userID 
         FROM crm where status ="lead" 
         and userID = ? 
         ${search ? "AND client_name LIKE CONCAT('%', ?, '%') " : ""}
         ${day ? "and day(created_at) = ?" : ""} 
         ${month ? "and month(created_at) = ?" : ""} 
         ${year ? "and year(created_at) = ?" : ""} 
         order by created_at desc limit ? offset ?`;

        const leadQueryParams: string[] = [userId, search, day, month, year, recordsPerPage.toString(), offset.toString()].filter(Boolean)

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [total] = await connection.execute(totalQuery, [userId]);
            const [rows, _] = await connection?.execute(leadQuery, leadQueryParams);

            console.log({ rows })
            // ->
            const _total = (total as any)[0].total
            // ->
            return res.status(200).json({
                success: true, leads: { total: _total, data: rows }
            })

        }
        catch (e: any) {
            console.log(e)
            return res.status(401).json({ success: false, error: [e.message] })
        }
    }



    async getLeadById(req: Request<{ id: string }, {}, {}>, res: express.Response) {

        const crmId = req.params.id
        const userID = res.locals.jwt.userID;

        let stmt = `SELECT crmID,client_name,client_contact,city,monthly_consumption,  solar_requirements,monthly_bill_amount,userID FROM crm where status ="lead" and crmID = "${crmId}" and userID = "${userID}"`;

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [rows, _] = await connection?.execute(stmt);
            return res.status(200).json({ success: true, leads: rows })
        }
        catch (e: any) {
            return res.status(401).json({ success: false, error: [e.message] })
        }
    }


    async updateLead(req: express.Request<{ id: string }, {}, updateLeadDto>, res: express.Response) {

        const crmId = req.params.id
        const userId = res.locals.jwt.userID
        let stmt = `UPDATE crm SET ? where crmID = "${crmId}" and userID = "${userId}"`;
        let values = [{ ...req.body }];

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));
            if (result) {
                res.status(200).json({
                    success: true,
                    message: "lead updated successfully"
                });
            }
            else {
                res.status(404).json({ error: [`lead can not be updated`] })
            }

        }
        catch (e: any) {
            res.status(404).json({ success: false, error: [e.message] })
        }
    }






}

export default new LeadController();