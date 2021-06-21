export interface IUser {
    id: number,
    email: string,
    images: any[],
    data: {
        id: number,
        pseudo: string,
        attracted_by: number,
        customer_id: number,
        date_of_birth: string,
        gender: number,
    }
}