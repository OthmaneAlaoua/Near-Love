import db from "../../database/models";
import {Op} from "sequelize";
import request from "../../helpers/requests/base";

const saveMessage = async (conversationId: number, message: string, token: string) => {
    try {
        if (!token) throw new Error('missing token');
        const response = await request('check-jwt', 'auth', 'post', {jwt: token});
        const userId = response?.data?.data?.id;
        if (!userId) throw new Error('token not validated');
        const conversation = await db.Conversation.findOne({
            where: {
                [Op.and]: [
                    {id: conversationId},
                    {
                        [Op.or]: [
                            {userOneId: userId},
                            {userTwoId: userId},
                        ]
                    }
                ],
            }
        });
        if (!conversation) throw new Error('conversation not found');
        const createdMessage = await db.Message.create({
            userId,
            content: message,
            conversationId: conversation.id
        });
        await conversation.changed('updatedAt', true); // update updated at of conversation

        return {
            message: createdMessage.get(),
            targetUserId: conversation.userOneId === userId ? conversation.userTwoId : conversation.userOneId,
            userId,
            user: response?.data?.data,
            conversationId
        };
    } catch (e) {
        console.log(e);
        return false;
    }
}

export default saveMessage;