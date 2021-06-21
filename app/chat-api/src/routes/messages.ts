import express from "express";
import db from "../database/models";
import {Op} from "sequelize";
import {badRequest} from "../helpers/responses";

const router = express.Router();

router.get('/:conversationId', async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const userId = req.body.jwtData.id;
        const conversation = await db.Conversation.findOne({
            where: {
                [Op.or]: [
                    {userOneId: userId},
                    {userTwoId: userId},
                ],
                id: conversationId
            }
        });
        if (!conversation) return badRequest(res);
        const messages = await conversation.getMessages({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(messages.map((e: any) => e.get()));
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'server error',
            err
        });
    }
});

export default router;