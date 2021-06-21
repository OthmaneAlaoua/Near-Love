import axios, {Method} from 'axios';
import urljoin from "url-join";
import config from '../config';
import store from "../store/store";

export type IService = 'customer' | 'auth' | 'localisation' | 'chat';

export default async function request(
    path: string | string[],
    service: IService,
    method: Method = 'post',
    data: object | undefined = undefined,
    sendTokenAsAuthHeader = true,
    headers: object | undefined = undefined,
    responseType: any = undefined
) {
    const url = urljoin(config.proxyHttpUrl, service, ...(Array.isArray(path) ? path : [path]));
    if (sendTokenAsAuthHeader) {
        const token = store.getState().user.token;
        headers = {...headers, Authorization: token};
    }

    return await axios.request({
        method,
        url,
        headers,
        data,
        responseType
    });
}