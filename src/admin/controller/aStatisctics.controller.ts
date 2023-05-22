import { Response, Request } from 'express'
import Mysql2Database from '../../src/database/Mysql2.database';
import mysql2 from 'mysql2/promise'
interface IStatistics {

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

type IData = {
    pipeline: {
        lead: {
            total: number;
            progress: number;
        };
        survey: {
            total: number;
            progress: number;
        };
        meeting: {
            total: number;
            progress: number;
        };
        quote: {
            total: number;
            progress: number;
        };
        closing: {
            total: number;
            progress: number;
        };
    };
    progress: number;
    total: {
        lead: number;
        survey: number;
        quote: number;
        meeting: number;
        closing: number;
    };
    remaining: {
        survey: number;
        quote: number;
        meeting: number;
        closing: number;
    };
}


function getSumOfUsers(row: IStatistics[]) {

    if ((row as IStatistics[]).length <= 0) {
        return []
    }

    let __result = (row as IStatistics[]).map((stat) => {
        const target = stat.target;
        const leadProgress = (stat.lead_pipeline / target);
        const surveyProgress = (stat.survey_pipeline / target);
        const meetingProgress = (stat.meeting_pipeline / target);
        const quoteProgress = (stat.quote_pipeline / target);
        const closingProgress = (stat.closing_pipeline / target);

        // const progress = leadProgress + surveyProgress + meetingProgress + quoteProgress + closingProgress
        const progress = closingProgress

        const data = {
            pipeline: {
                lead: {
                    total: parseInt(stat.lead_pipeline + ""),
                    progress: (stat.lead_pipeline / target) * 100
                },
                survey: {
                    total: parseInt(stat.survey_pipeline + ""),
                    progress: (stat.survey_pipeline / target) * 100
                },
                meeting: {
                    total: parseInt(stat.meeting_pipeline + ""),
                    progress: (stat.meeting_pipeline / target) * 100
                },
                quote: {
                    total: parseInt(stat.quote_pipeline + ""),
                    progress: (stat.quote_pipeline / target) * 100
                },
                closing: {
                    total: parseInt(stat.closing_pipeline + ""),
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
    });

    return __result;

}

function getSumOfModerator(__result: IData[]) {

    if (__result.length <= 0) {
        return []
    }
    const ___result = __result.reduce((x, y) => {
        const data =
        {
            pipeline: {
                lead: {
                    total: (x.pipeline.lead.total) + (y.pipeline.lead.total),
                    progress: x.pipeline.lead.progress + y.pipeline.lead.progress
                },
                survey: {
                    total: x.pipeline.survey.total + y.pipeline.survey.total,
                    progress: x.pipeline.survey.progress + y.pipeline.survey.progress
                },
                meeting: {
                    total: x.pipeline.meeting.total + y.pipeline.meeting.total,
                    progress: x.pipeline.meeting.progress + y.pipeline.meeting.progress
                },
                quote: {
                    total: x.pipeline.quote.total + y.pipeline.quote.total,
                    progress: x.pipeline.quote.progress + y.pipeline.quote.progress
                },
                closing: {
                    total: x.pipeline.lead.total + y.pipeline.lead.total,
                    progress: x.pipeline.lead.progress + y.pipeline.lead.progress
                },
            },
            progress: x.progress + y.progress,

            total: {
                lead: x.total.lead + y.total.lead,
                survey: x.total.survey + y.total.survey,
                quote: x.total.quote + y.total.quote,
                meeting: x.total.meeting + y.total.meeting,
                closing: x.total.closing + y.total.closing
            },

            remaining: {
                survey: x.remaining.survey + y.remaining.survey,
                quote: x.remaining.quote + y.remaining.quote,
                meeting: x.remaining.meeting + y.remaining.meeting,
                closing: x.remaining.closing + y.remaining.closing,
            }
        }
        return data;
    });
    ___result.progress = ___result.progress / __result.length
    return ___result;
}


async function getModeratorStat(mdoeratotID: string) {

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
                INNER JOIN crm c ON u.userID = c.userID inner join target t on t.userID = u.userID
                WHERE u.moderatorID = "${mdoeratotID}" group by u.userID;
        `

    let connection: mysql2.Connection = await Mysql2Database.createConnection();
    const [row, _] = await connection.execute(query)

    if ((row as IStatistics[]).length <= 0) {
        return []
    }

    const __result = getSumOfUsers((row as IStatistics[]));
    console.log({ __result })
    if ((__result).length <= 0) {
        return []
    }

    let ___result = getSumOfModerator(__result)
    return ___result


}

class AdminStatisticsController {

    async statOfModerator(req: Request<{ moderatorId: string }>, res: Response) {
        const mdoeratotID = req.params.moderatorId

        // console.log({ mdoeratotID })
        try {
            const resullt = await getModeratorStat(mdoeratotID)

            return res.status(200).json({
                success: true,
                statistics: !Array.isArray(resullt) ? ([resullt] as any) : resullt
            });

        } catch (error: any) {
            // console.log(error)
            return res.status(404).json({
                success: false,
                error: [error.message]
            })
        }
    }


    async StatOfBranchById(req: Request<{ branchId: string }, {}, {}, { moderators: string }>, res: Response) {


        try {

            const moderatotsArray = req.query.moderators.split(",")
            if (!Array.isArray(moderatotsArray)) {
                return res.status(200).json({
                    success: true,
                    statistics: []
                })
            }

            const modArray: IData[] = [];
            for (let i = 0; i < moderatotsArray.length; i++) {
                let __moderator = await getModeratorStat(moderatotsArray[i]) as IData
                if (!Array.isArray(__moderator)) {

                    modArray.push(__moderator)
                }
            }

            return res.status(200).json({
                success: true,
                statistics: modArray
            });

        } catch (error: any) {

            return res.status(404).json({
                success: false,
                error: [error.message]
            })
        }

    }

}

export default new AdminStatisticsController();