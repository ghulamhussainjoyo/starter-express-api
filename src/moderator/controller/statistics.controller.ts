import { Response, Request } from 'express'
import Mysql2Database from '../../src/database/Mysql2.database';
import mysql2 from 'mysql2/promise'

interface IStatistics {
    crmID: string,
    username: string,
    email: string,
    designation: string,
    target: number,
    leads: number,
    survey: number,
    quote: number,
    meeting: number,
    closing: number,
    lead_pipeline: number
    survey_pipeline: number
    quote_pipeline: number
    meeting_pipeline: number
    closing_pipeline: number
}


class StatisticsController {
    async ProgressOfUser(Req: Request, res: Response) {
        const mdoeratotID = res.locals.jwt.userID;

        const query = `SELECT 
                        c.crmID,
                        u.username, 
                        u.email,
                        u.designation,
                        t.target,
                        COUNT(CASE WHEN c.status = 'lead' THEN 1 END) AS leads, 
                        COUNT(CASE WHEN c.status = 'survey' THEN 1 END) AS survey,
                        COUNT(CASE WHEN c.status = 'quote' THEN 1 END) AS quote, 
                        COUNT(CASE WHEN c.status = 'meeting' THEN 1 END) AS meeting,
                        COUNT(CASE WHEN c.status = 'closing' THEN 1 END) AS closing,
                        SUM(CASE WHEN c.status = 'lead' THEN c.solar_requirements ELSE 0 END) AS lead_pipeline,
                        SUM(CASE WHEN c.status = 'survey' THEN c.solar_requirements ELSE 0 END) AS survey_pipeline,
                        SUM(CASE WHEN c.status = 'quote' THEN c.solar_requirements ELSE 0 END) AS quote_pipeline,
                        SUM(CASE WHEN c.status = 'meeting' THEN c.solar_requirements ELSE 0 END) AS meeting_pipeline,
                        SUM(CASE WHEN c.status = 'closing' THEN c.solar_requirements ELSE 0 END) AS closing_pipeline
                    FROM users u
                    INNER JOIN crm c ON u.userID = c.userID left join target t on u.userID = t.userID
                    WHERE u.moderatorID = "${mdoeratotID}"
                    GROUP BY c.userID`

        try {

            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [row, _] = await connection.execute(query)

            let __result = (row as IStatistics[]).map((stat) => {


                const target = stat.target;
                const leadProgress = (stat.lead_pipeline / target);
                const surveyProgress = (stat.survey_pipeline / target);
                const meetingProgress = (stat.meeting_pipeline / target);
                const quoteProgress = (stat.quote_pipeline / target);
                const closingProgress = (stat.closing_pipeline / target);

                const progress = leadProgress + surveyProgress + meetingProgress + quoteProgress + closingProgress

                const data = {
                    crmID: stat.crmID,
                    username: stat.username,
                    email: stat.email,
                    designation: stat.designation,
                    pipeline: {
                        lead: {
                            total: stat.lead_pipeline,
                            progress: (stat.lead_pipeline / target) * 100
                        },
                        survey: {
                            total: stat.survey_pipeline,
                            progress: (stat.survey_pipeline / target) * 100
                        },
                        meeting: {
                            total: stat.meeting_pipeline,
                            progress: (stat.meeting_pipeline / target) * 100
                        },
                        quote: {
                            total: stat.quote_pipeline,
                            progress: (stat.quote_pipeline / target) * 100
                        },
                        closing: {
                            total: stat.closing_pipeline,
                            progress: (stat.closing_pipeline / target) * 100
                        },
                    },

                    progress,
                    total: {
                        lead: stat.leads + stat.survey + stat.quote + stat.meeting + stat.closing,
                        survey: stat.survey + stat.quote + stat.meeting + stat.closing,
                        quote: stat.quote + stat.meeting + stat.closing,
                        meeting: stat.meeting + stat.closing,
                        closing: stat.closing,
                    },
                    remaining: {
                        survey: stat.leads,
                        quote: stat.survey,
                        meeting: stat.quote,
                        closing: stat.meeting,
                    }
                }

                return data;
            })

            // console.log("moderator-statistics", { row })
            return res.status(200).json({
                success: true,
                statistics: __result
            })

        } catch (error: any) {
            // console.log(error)
            return res.status(404).json({
                success: false,
                error: [error.message]
            })
        }

    }

    async StatOfModerator(req: Request<{ moderatorId: string }>, res: Response) {
        const mdoeratotID = req.params.moderatorId
        const query = `
                   SELECT 
                    t.target as target,
                    COUNT(CASE WHEN c.status = 'lead' THEN 1 END) AS leads, 
                    COUNT(CASE WHEN c.status = 'survey' THEN 1 END) AS survey,
                    COUNT(CASE WHEN c.status = 'quote' THEN 1 END) AS quote, 
                    COUNT(CASE WHEN c.status = 'meeting' THEN 1 END) AS meeting,
                    COUNT(CASE WHEN c.status = 'closing' THEN 1 END) AS closing,
                    SUM(CASE WHEN c.status = 'lead' THEN c.solar_requirements ELSE 0 END) AS lead_pipeline,
                    SUM(CASE WHEN c.status = 'survey' THEN c.solar_requirements ELSE 0 END) AS survey_pipeline,
                    SUM(CASE WHEN c.status = 'quote' THEN c.solar_requirements ELSE 0 END) AS quote_pipeline,
                    SUM(CASE WHEN c.status = 'meeting' THEN c.solar_requirements ELSE 0 END) AS meeting_pipeline,
                    SUM(CASE WHEN c.status = 'closing' THEN c.solar_requirements ELSE 0 END) AS closing_pipeline
                    FROM users u
                    INNER JOIN crm c ON u.userID = c.userID inner join target t on t.userID = "${mdoeratotID}"
                    WHERE u.moderatorID = "${mdoeratotID}";`

        try {

            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [row, _] = await connection.execute(query)

            let __result = (row as IStatistics[]).map((stat) => {


                const target = stat.target;
                // console.log(target)
                const leadProgress = (stat.lead_pipeline / target);
                const surveyProgress = (stat.survey_pipeline / target);
                const meetingProgress = (stat.meeting_pipeline / target);
                const quoteProgress = (stat.quote_pipeline / target);
                const closingProgress = (stat.closing_pipeline / target);

                const progress = leadProgress + surveyProgress + meetingProgress + quoteProgress + closingProgress
                // console.log(progress)

                const data = {
                    crmID: stat.crmID,
                    username: stat.username,
                    email: stat.email,
                    designation: stat.designation,
                    pipeline: {
                        lead: {
                            total: stat.lead_pipeline,
                            progress: (stat.lead_pipeline / target) * 100
                        },
                        survey: {
                            total: stat.survey_pipeline,
                            progress: (stat.survey_pipeline / target) * 100
                        },
                        meeting: {
                            total: stat.meeting_pipeline,
                            progress: (stat.meeting_pipeline / target) * 100
                        },
                        quote: {
                            total: stat.quote_pipeline,
                            progress: (stat.quote_pipeline / target) * 100
                        },
                        closing: {
                            total: stat.closing_pipeline,
                            progress: (stat.closing_pipeline / target) * 100
                        },
                    },

                    progress,
                    total: {
                        lead: stat.leads + stat.survey + stat.quote + stat.meeting + stat.closing,
                        survey: stat.survey + stat.quote + stat.meeting + stat.closing,
                        quote: stat.quote + stat.meeting + stat.closing,
                        meeting: stat.meeting + stat.closing,
                        closing: stat.closing,
                    },
                    remaining: {
                        survey: stat.leads,
                        quote: stat.survey,
                        meeting: stat.quote,
                        closing: stat.meeting,
                    }
                }

                return data;
            })

            // console.log("moderator-statistics", { row })
            return res.status(200).json({
                success: true,
                statistics: __result
            })

        } catch (error: any) {
            // console.log(error)
            return res.status(404).json({
                success: false,
                error: [error.message]
            })
        }

    }

}

export default new StatisticsController();