import { Request, Response } from 'express'
import mysql2 from 'mysql2/promise';
import Mysql2Database from '../../src/database/Mysql2.database';


interface TStatistics {
    target: number,
    leads: number,
    survey: number,
    quote: number,
    meeting: number,
    closing: number,
    hold: number,
    lead_pipeline: number
    survey_pipeline: number
    quote_pipeline: number
    meeting_pipeline: number
    closing_pipeline: number
    hold_pipeline: number
}

function log(result: any) {
    console.log("user-statistics-controller", result)
}
// 
class StatisticsController {


    async statics(req: Request<{ userID: string }, {}, {}, {
        day: string,
        month: string,
        year: string
    }>, res: Response) {

        const { day, month, year } = req.query
        const userID = req.params.userID;


        const statisticsQuery = `
                        SELECT
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
                        COUNT(CASE WHEN c.status = 'hold' THEN 1 END) AS hold,
                        SUM(CASE WHEN c.status = 'lead' THEN c.solar_requirements ELSE 0 END) AS lead_pipeline,
                        SUM(CASE WHEN c.status = 'survey' THEN c.solar_requirements ELSE 0 END) AS survey_pipeline,
                        SUM(CASE WHEN c.status = 'quote' THEN c.solar_requirements ELSE 0 END) AS quote_pipeline,
                        SUM(CASE WHEN c.status = 'meeting' THEN c.solar_requirements ELSE 0 END) AS meeting_pipeline,
                        SUM(CASE WHEN c.status = 'closing' THEN c.solar_requirements ELSE 0 END) AS closing_pipeline,
                        SUM(CASE WHEN c.status = 'hold' THEN c.solar_requirements ELSE 0 END) AS hold_pipeline
                    FROM users u
                    INNER JOIN crm c ON u.userID = c.userID left join target t on u.userID = t.userID
                    WHERE u.userID = ? 
                    ${day ? "and day(c.created_at) = ? " : ""}
                    ${month ? "and month(c.created_at) = ? " : ""}
                    ${year ? "and year(c.created_at) = ? " : ""}
                    GROUP BY c.userID`

        const statisticsQueryParams = [userID, day, month, year].filter(Boolean)

        // console.log({ statSqlQuery })
        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            let [statistics, _] = await connection.execute(statisticsQuery, statisticsQueryParams);
            let stat: TStatistics = (statistics as TStatistics[])[0]
            if ((statistics as TStatistics[]).length <= 0) {
                return res.status(200).json({
                    success: true,
                    statistics: []
                });
            }

            const target = stat.target;
            const leadProgress = (stat.lead_pipeline / target);
            const surveyProgress = (stat.survey_pipeline / target);
            const meetingProgress = (stat.meeting_pipeline / target);
            const quoteProgress = (stat.quote_pipeline / target);
            const closingProgress = (stat.closing_pipeline / target);

            // const progress = leadProgress + surveyProgress + meetingProgress + quoteProgress + closingProgress;

            const progress = closingProgress

            const data = {
                target: stat.target,
                progress,

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
                    hold: {
                        total: stat.hold_pipeline,
                        progress: (stat.hold_pipeline / target) * 100
                    },
                },

                total: {
                    lead: stat.leads + stat.survey + stat.quote + stat.meeting + stat.closing,
                    survey: stat.survey + stat.quote + stat.meeting + stat.closing,
                    quote: stat.quote + stat.meeting + stat.closing,
                    meeting: stat.meeting + stat.closing,
                    closing: stat.closing,
                    hold: stat.hold
                },
                remaining: {
                    survey: stat.leads,
                    quote: stat.survey,
                    meeting: stat.quote,
                    closing: stat.meeting,
                },
                count: {
                    lead: stat.leads,
                    survey: stat.survey,
                    quote: stat.quote,
                    meeting: stat.meeting,
                    closing: stat.closing,
                }
            }


            return res.status(200).json({
                success: true,
                statistics: [data]
            });

        } catch (error: any) {
            return res.status(404).json({
                success: false,
                error: [error.message]
            })
        }

    }
}
export default new StatisticsController();