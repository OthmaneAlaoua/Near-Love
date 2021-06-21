export interface IMessage {
    id: number | string,
    conversationId: number,
    userId: number,
    content: string,
    createdAt: string,
    updatedAt: string,
}