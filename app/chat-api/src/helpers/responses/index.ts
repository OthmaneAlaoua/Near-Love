export const badRequest = (res: any, message?: string) => {
    return res.status(400).json({
        message: message ?? 'bad request'
    });
}