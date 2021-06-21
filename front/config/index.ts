import {IService} from "../services/request";
import urljoin from "url-join";

const config = {
    proxyUrl: "192.168.1.16",
    proxyHttpUrl: "http://192.168.1.16",
    proxyWsUrl: "ws://192.168.1.16"
}

export default config;

export const createUrl = (path: string | string[], service: IService) => {
    return urljoin(config.proxyHttpUrl, service, ...(Array.isArray(path) ? path : [path]));
}