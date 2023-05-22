import { Request, Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'


class ZodMiddleware {
    validate(schema: AnyZodObject) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                let ans = await schema.parseAsync(req.body);

                return next();
            } catch (error: any) {
                let errors = "";
                error.issues.forEach((element: any) => {
                    errors += `"${element.path[0]} ${element.message}"`
                    errors += " "
                });

                return res.status(200).json({ error: [errors] })
            }
        }
    }



}

export default new ZodMiddleware();
