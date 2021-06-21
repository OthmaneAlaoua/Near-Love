import express from "express";
import db from "../database/models";
import {Op} from "sequelize";
import validationMiddleware from "../middleware/validation";
import {createConversationSchema} from "../validation/conversation";
import request from "../helpers/requests/base";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // const {communitySlug} = req.body;
        const userId = req.body.jwtData.id;
        const conversations = await db.Conversation.findAll({
            where: {
                [Op.or]: [
                    {userOneId: userId},
                    {userTwoId: userId},
                ]
            }
        });
        const conversationsData = conversations.map((e: any) => e.get());
        if (conversationsData.length === 0) return res.status(200).json(conversationsData);

        const idArray = conversationsData.reduce((acc: any, val: any) => {
            const toBeAdded = [];
            if (userId != val.userOneId) toBeAdded.push(val.userOneId);
            else if (userId != val.userTwoId) toBeAdded.push(val.userTwoId);
            return [...acc, ...toBeAdded];
        }, []);

        const response = await request('informations', 'customer', 'post', {
            idArray
        });
        const users = response?.data?.data;
        for (const conversation of conversationsData) {
            const _userId = userId === conversation.userOneId ? conversation.userTwoId : conversation.userOneId;
            conversation.user = users.find((e: any) => e.id === _userId);
        }

        res.status(200).json(conversationsData);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'server error',
            err
        });
    }
});

router.post('/', validationMiddleware(createConversationSchema), async (req, res) => {
    try {
        // const {communitySlug} = req.body;
        const {userOneId, userTwoId} = req.body;
        const conversation = await db.Conversation.create({
            userOneId,
            userTwoId
        });
        res.status(201).json({conversation});
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'server error',
            err
        });
    }
});

export default router;