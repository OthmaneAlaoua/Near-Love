import {Application} from "express";
import authorization from "../middleware/authorization";
import messages from "./messages";
import conversations from "./conversations";

export const registerRoutesAndMiddleware = (app: Application) => {
    app.use(authorization());
    app.use('/messages', messages);
    app.use('/conversations', conversations);
}