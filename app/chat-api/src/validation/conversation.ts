import * as Yup from 'yup';

export const createConversationSchema = Yup.object({
    userOneId: Yup.string().required(),
    userTwoId: Yup.string(),
});