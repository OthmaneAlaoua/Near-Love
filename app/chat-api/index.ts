import express, {Application, Request, Response} from "express";

require('dotenv').config();
const socket = require('socket.io');
const http = require('http');

import {registerRoutesAndMiddleware} from "./src/routes";
import db, {testAuth} from "./src/database/models";
import saveMessage from "./src/services/messages/save";

const app: Application = express();
const server = http.createServer(app);
const io = socket(server);

testAuth(db.sequelize);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).send({
            message: "chat alive",
        });
    }
);

registerRoutesAndMiddleware(app);

const port = process.env.NODE_ENV_PORT || 8066;
server.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
});

const socketIdsByUserId: any = {};
const userIdsBySocketId: any = {};

interface IMessage {
    token: string,
    conversationId: number,
    message: string,
}

io.on("connection", (socket: any) => {
    console.log(socket.id);
    const userId = socket.handshake.query.userId;
    console.log(userId);
    
    if (userId) {
        if (socketIdsByUserId[userId]) {
            const oldSocketId = socketIdsByUserId[userId];
            delete userIdsBySocketId[oldSocketId];
            console.log('connected');
        } else {
            console.error('connected without user id');
        }
        socketIdsByUserId[userId] = socket.id;
        userIdsBySocketId[socket.id] = userId;
        console.log('socketIdsByUserId', socketIdsByUserId);
        console.log('userId', userId);
    }

    socket.on('sendMessage', async (data: IMessage) => {
        const {conversationId, message, token} = data;
        const response = await saveMessage(conversationId, message, token);
        if (response) {
            const {conversationId, message, userId, user, targetUserId} = response;
            if (!socketIdsByUserId[targetUserId]) return;
            socket.to(socketIdsByUserId[targetUserId]).emit('receiveMessage', {
                conversationId,
                message,
                user,
                userId,
            })
        }
    });

    socket.on("disconnect", () => {
        const userId = socketIdsByUserId[socket.id];
        delete socketIdsByUserId[socket.id];
        delete userIdsBySocketId[userId];
        console.log("disconnected");
    });
});
