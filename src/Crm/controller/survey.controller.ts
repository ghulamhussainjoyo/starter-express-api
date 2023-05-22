import express, { Request, Response } from 'express';
import debug from 'debug';
import Mysql2Database from '../../src/database/Mysql2.database';
import mysql2 from 'mysql2/promise'

import { createSurveySchemaType } from '../model/survey.model';

const log: debug.IDebugger = debug('app:lead.controller');

class LeadController {


    async createSurvey(req: express.Request<{ leadID: string }, {}, createSurveySchemaType>, res: express.Response) {

        const crmId = req.body.crmID;
        const userId = res.locals.jwt.userID
        let stmt = `UPDATE crm SET ? where crmID = "${crmId}" and userID = "${userId}"`;
        let values = [{
            ...req.body,
            prev_status: "lead",
            status: "survey",
            userID: res.locals.jwt.userID
        }];


        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));


            if ((result as any).affectedRows !== 0) {
                return res.status(200).json({
                    success: true,
                    message: "lead turned into survey"
                });
            }
            else {
                return res.status(404).json({ error: [`can not turn lead into survey`] })
            }
        }
        catch (e: any) {
            res.status(404).json({ error: e.message })
        }
    }



    async getSurveyById(req: Request<{ id: string }, {}, {}>, res: express.Response) {


        const crmId = req.params.id
        const userId = res.locals.jwt.userID;

        let stmt = `SELECT crmID,client_name,client_contact,city,monthly_consumption,solar_requirements,monthly_bill_amount,surveyor_name,total_amperes,meter_type,gps_coordinates,roof_type,system_type,other_survey,structure_type,prev_status,status from crm where status ="survey" and userID = "${userId}" and crmID = "${crmId}"`;

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [rows, _] = await connection?.execute(stmt);

            return res.status(200).json({ success: true, survey: rows })
        }
        catch (e: any) {
            return res.status(401).json({ success: false, error: [e.message] })
        }
    }


    async getSurvies(req: Request<{ userId: string }, {}, {}, {
        search: string, page: string, day: string,
        month: string,
        year: string
    }>, res: express.Response) {

        const { day, month, page, search, year } = req.query
        const recordsPerPage = 10
        const offset = (parseInt(page) - 1) * recordsPerPage
        const userId = req.params.userId

        const totalQuery = `SELECT COUNT(*) as total FROM crm WHERE status = 'survey' AND userID = ?;`


        const surveyQuery =
            `SELECT 
            crmID,
            client_name,
            client_contact,
            city,
            monthly_consumption,
            solar_requirements,
            monthly_bill_amount,
            surveyor_name,
            total_amperes,
            meter_type,
            gps_coordinates,
            roof_type,
            system_type,
            other_survey,
            structure_type,
            prev_status,
            status from crm where status ="survey" and userID = ? 
            ${search ? "AND client_name LIKE CONCAT('%', ?, '%') " : ""}
            ${day ? "and day(created_at) = ?" : ""} 
            ${month ? "and month(created_at) = ?" : ""} 
            ${year ? "and year(created_at) = ?" : ""} 
            order by created_at desc 
            limit ? 
            offset ?`;

        const surveyQueryParams: string[] = [userId, search, day, month, year, recordsPerPage.toString(), offset.toString()].filter(Boolean)



        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [total] = await connection.execute(totalQuery, [userId]);
            const [rows, _] = await connection?.execute(surveyQuery, surveyQueryParams);

            const _total = (total as any)[0].total
            return res.status(200).json({ success: true, survey: { total: _total, data: rows } })
        }
        catch (e: any) {
            return res.status(401).json({ success: false, error: [e.message] })
        }
    }


    async updateSurvey(req: express.Request<{ id: string }, {}, {}>, res: express.Response) {


        const crmId = req.params.id
        const userId = res.locals.jwt.userID
        let updateLead = {
            ...req.body
        };
        let stmt = `UPDATE crm SET ? where crmID = "${crmId}" and userID = "${userId}"`;
        let values = [updateLead];
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
                res.status(404).json({ success: false, error: [`quote can not be updated`] })
            }

        }
        catch (e: any) {
            res.status(404).json({ success: false, error: [e.message] })
        }
    }


}

export default new LeadController();