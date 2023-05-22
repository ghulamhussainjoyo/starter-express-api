import express from 'express';
import { validationResult } from 'express-validator'
import debug from 'debug';
const log: debug.IDebugger = debug("body.middleware")
class BodyValidationMiddleware {

    verifyBodyFieldsErrors(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const errors = validationResult(req);
        log("erros", errors)
        if (!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }
        next();
    }
}

export default new BodyValidationMiddleware();