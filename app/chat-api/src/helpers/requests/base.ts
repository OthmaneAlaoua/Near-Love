import axios, {Method} from 'axios';
import urljoin from "url-join";

export type IService = 'customer' | 'auth' | 'localisation';
const urlByService = {
    customer: process.env.NODE_ENV_CUSTOMER_API_URL ?? '',
    auth: process.env.NODE_ENV_AUTH_API_URL ?? '',
    localisation: process.env.NODE_ENV_LOCALISATION_API_URL ?? '',
}

export default async function request(url: string | string[], service: IService, method: Method, body: object = {}, headers: object = {}) {
    url = urljoin(urlByService[service], ...(Array.isArray(url) ? url : [url]));

    return await axios.request({
        url,
        method,
        headers: {
            ...headers,
            apiKeyInter: process.env.NODE_ENV_API_KEY_INTER
        },
        data: body
    });
}
