import express from 'express';
import { CommonRoutesConfig } from './common.routes.config';
import debug from 'debug';
import crmMiddleware from '../../Crm/middleware/crm.middleware';
import { createLeadSchema, updateLeadSchema } from '../../Crm/model/lead.model';
import jwtMiddleware from '../../auth/middleware/jwt.middleware';
import permissionMiddleware from '../../auth/middleware/permission.middleware';
import { PermissionFlag } from '../../auth/middleware/permissionFlad.enum';
import leadController from '../../Crm/controller/lead.controller';
import closingController from '../../Crm/controller/closing.controller';
import { createSurveySchema } from '../../Crm/model/survey.model';
import surveyController from '../../Crm/controller/survey.controller';
import quoteController from '../../Crm/controller/quote.controller';
import { createMeetingSchema } from '../../Crm/model/meeting.model';
import meetingController from '../../Crm/controller/meeting.controller';
import { createClosingSchema } from '../../Crm/model/closing.model';
import zodValidateMiddleware from '../common/middleware/zod.validate.middleware';


const log: debug.IDebugger = debug("route:lead.routes")

export class CrmRoutes extends CommonRoutesConfig {

    constructor(app: express.Application) {
        super(app, "CrmRoutes");
    }

    configRoutes(): express.Application {


        this.app.route(`/lead`)
            .post(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                zodValidateMiddleware.validate(createLeadSchema),
                leadController.createLead
            )


        this.app.route(`/leads/:userId`)
            .get(
                jwtMiddleware.validJWTNeeded,
                leadController.getLeads
            );

        this.app.route(`/lead/:id`)
            .put(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                zodValidateMiddleware.validate(updateLeadSchema),
                crmMiddleware.checkStatus("lead"),
                leadController.updateLead
            )
            .get(
                jwtMiddleware.validJWTNeeded,
                leadController.getLeadById
            )



        // survey ---------------->
        this.app.route(`/survey`)
            .post(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                zodValidateMiddleware.validate(createSurveySchema),
                surveyController.createSurvey
            )

        this.app.route(`/surveys/:userId`)
            .get(
                jwtMiddleware.validJWTNeeded,
                surveyController.getSurvies
            )

        this.app.route(`/survey/:id`)
            .put(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                zodValidateMiddleware.validate(createSurveySchema),
                crmMiddleware.checkStatus("survey"),
                surveyController.updateSurvey
            ).get(jwtMiddleware.validJWTNeeded, surveyController.getSurveyById);


        // Quote ------>
        this.app.route(`/quote`)
            .post(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                quoteController.createQuote
            )


        this.app.route(`/quotes/:userId`)
            .get(
                jwtMiddleware.validJWTNeeded,
                quoteController.getQuotes
            )

        this.app.route(`/quote/:id`)
            .put(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                crmMiddleware.checkStatus("quote"),
                quoteController.updateQuote
            )
            .get(jwtMiddleware.validJWTNeeded, quoteController.getQuoteById);


        // meeting -------------->
        this.app.route(`/meeting`)
            .post(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                zodValidateMiddleware.validate(createMeetingSchema),
                meetingController.createMeeting
            )

        this.app.route(`/meetings/:userId`)
            .get(
                jwtMiddleware.validJWTNeeded,
                meetingController.getMeetings
            )

        this.app.route(`/meeting/:id`)
            .put(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                zodValidateMiddleware.validate(createMeetingSchema),
                crmMiddleware.checkStatus("meeting"),
                meetingController.updateMeeting
            )
            .get(jwtMiddleware.validJWTNeeded, meetingController.getMeetingById);


        // CLosing ---------------->
        this.app.route(`/closing`)
            .post(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                zodValidateMiddleware.validate(createClosingSchema),
                closingController.createClosing
            )

        this.app.route(`/closings/:userId`)
            .get(
                jwtMiddleware.validJWTNeeded,
                closingController.getClosings
            )

        this.app.route(`/closing/:id`)
            .put(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([PermissionFlag.USER]),
                zodValidateMiddleware.validate(createClosingSchema),
                crmMiddleware.checkStatus("closing"),
                closingController.updateClosing
            )
            .get(jwtMiddleware.validJWTNeeded, closingController.getClosingById);




        return this.app;
    }

}