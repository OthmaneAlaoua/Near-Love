import express from 'express';
import request from "../helpers/requests/base";

const excludedFromMiddleware = [
    {path: '/conversations', method: 'post'}
];

const testIfExcluded = (req: express.Request) => {
    for (const excluded of excludedFromMiddleware) {
        if (excluded.path !== req.path) continue;
        if (excluded.method.toLowerCase() !== req.method.toLowerCase()) continue;
        return true;
    }
    return false;
}

const authorization = () => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            if (testIfExcluded(req)) {
                console.log('excluded');
                return next();
            }
            let token = req.header('Authorization');
            if (!token) throw new Error('missing Authorization header');
            const response = await request('check-jwt', 'auth', 'post', {jwt: token});
            req.body.jwtData = response?.data?.data;
            next();
        } catch (e) {
            console.log(e);
            res.status(401).json({message: 'unauthorized'});
        }
    }
}

export default authorization;