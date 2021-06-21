import {NextFunction, Request, Response} from "express";
import Yup from 'yup';

const validationMiddleware = (validationSchema: Yup.AnySchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resource = req.body;
        await validationSchema.validate(resource);
        next();
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: e.errors.join(', ') });
    }
}

export default validationMiddleware;