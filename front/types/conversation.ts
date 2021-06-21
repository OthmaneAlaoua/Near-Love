import {IUser} from "./user";

export interface IConversation {
    id: number,
    userOneId: number,
    userTwoId: number,
    createdAt: string,
    updatedAt: string,
    user?: IUser
}