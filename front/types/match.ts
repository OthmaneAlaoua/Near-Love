import {IUser} from "./user";

export interface IMatch {
    id: number,
    customer_1: number,
    customer_2: number,
    user?: IUser,
    createdAt: string,
    updatedAt: string,
}