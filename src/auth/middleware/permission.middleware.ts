import express from 'express';
import { PermissionFlag } from '../middleware/permissionFlad.enum'
import debug from 'debug';

const log: debug.IDebugger = debug("permission.flag.enum | ")

class PermissionMiddleware {

    permissionFlagRequired(requiredPermissionFlag: Array<PermissionFlag>) {
        return (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {

            try {
                const userPermissionFlags = parseInt(
                    res.locals.jwt.permissionFlag
                );


                if (requiredPermissionFlag.includes(userPermissionFlags)) {
                    next();
                } else {
                    res.status(403).json({ error: ["Sorry! You don't have access"] });
                }
            } catch (e: any) {
                log(e);
                return res.status(403).json({ error: [e.message] });

            }
        };
    }
}

export default new PermissionMiddleware();