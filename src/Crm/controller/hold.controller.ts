import { Request, Response } from 'express'
import Mysql2Database from '../../src/database/Mysql2.database'
import mysql2 from 'mysql2/promise'
import { holdDto } from '../dto/hold.dto'
const CLASS_NAME = "HOLD_CONTROLLER"

class HoldController {

    async hold(req: Request<{ crmId: string }, {}, holdDto>, res: Response) {

        const crmId = req.params.crmId
        const userId = req.body.userID

        let stmt = `UPDATE crm SET ? where crmID = "${crmId}" and userID = "${userId}"`;
        let values = [{ prev_status: req.body.prev_status, status: req.body.status }];

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [result] = await connection.execute(mysql2.format(stmt, values));



            console.log(CLASS_NAME, { result })

            if (result) {
                return res.status(200).json({
                    success: true,
                    message: `lead turned into ${req.body.status}`
                });
            }
            else {
                return res.status(404).json({ error: [`lead can not be updated`] })
            }

        }
        catch (e: any) {
            return res.status(404).json({ success: false, error: [e.message] })
        }
    }


    async holds(req: Request<{}, {}, {}, { search: string, mdoeratorId?: string, userId?: string, page: string }>, res: Response) {

        const page = parseInt(req.query.page)
        const recordsPerPage = 10
        const offset = (page - 1) * recordsPerPage


        if (req.query.userId) {
            console.log(CLASS_NAME, { query: req.query })
            // moderatorId
            const userId = req.query.userId
            const searchQuery = req.query.search !== undefined ? req.query.search : ""



            const stmt = `SELECT 
            (SELECT COUNT(*) FROM crm where status ="hold" and userID = "${userId}") as total,
            crm.* from crm where status ="hold" and userID = "${userId}" and client_name like "%${searchQuery}%" order by created_at desc limit ${recordsPerPage} offset ${offset}`;

            try {
                let connection: mysql2.Connection = await Mysql2Database.createConnection();
                const [rows, _] = await connection?.execute(stmt);

                return res.status(200).json({ success: true, hold: rows })
            }
            catch (e: any) {
                return res.status(401).json({ success: false, error: [e.message] })
            }
        }
        else if (req.query.mdoeratorId) {

            const mdoeratorId = req.query.mdoeratorId
            const searchQuery = req.query.search !== undefined ? req.query.search : ""
            let connection: mysql2.Connection = await Mysql2Database.createConnection();


            const stmt =
                `select c.userID, c.crmID, c.client_name,c.client_contact,c.city,c.monthly_consumption,c.solar_requirements,c.monthly_bill_amount,c.surveyor_name,c.total_amperes,c.meter_type,c.gps_coordinates,c.roof_type,c.system_type,c.other_survey,c.structure_type,c.prev_status,c.status, c.system_type,c.structure_type,c.solar_requirements,c.total_price,c.advance_price,c.other_quote, c.poc_name, c.panel_names, c.poc_contact, c.venue_address from crm c inner join users u on c.userID = u.userID where u.moderatorID = "${mdoeratorId}" and c.status = "hold_requested" and c.client_name like "%${searchQuery}%"`;

            try {
                const [rows, _] = await connection?.execute(stmt);

                return res.status(200).json({ success: true, hold: rows })
            }
            catch (e: any) {
                return res.status(401).json({ success: false, error: [e.message] })
            }
        }
        else {
            return res.status(404).json({ success: false, error: ["not found"] })
        }
    }
}


export default new HoldController();