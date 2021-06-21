import React, {useEffect, useState} from 'react';
import {Image as ImageDefault, ImageProps, StyleSheet} from "react-native";
import request from "../../services/request";

global.Buffer = global.Buffer || require('buffer').Buffer;
import {decode, encode} from 'base-64';
import {Layout, Spinner} from "@ui-kitten/components";

if (!global.btoa) {
    global.btoa = encode
}

if (!global.atob) {
    global.atob = decode
}

interface IProps {
    imagePath: string,
    source?: any,
    style: object,
    withLoading?: boolean,

    [key: string]: any,
}

const Image = ({imagePath, style, source, withLoading, ...other}: IProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [_source, setSource] = useState<string | undefined>(undefined);

    useEffect(() => {
        const imageRequest = async () => {
            setLoading(true);
            setError(false);
            const response = await request(['images', imagePath + ''], 'customer', 'get', undefined, undefined, undefined, 'arraybuffer');
            let image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
            setSource(`data:${response.headers['content-type'].toLowerCase()};base64,${image}`);
        }
        imageRequest().catch(err => {
            setError(true);
            console.log(err)
        }).finally(() => setLoading(false));
    }, [imagePath]);

    return (
        <>
            {loading || error ? <Layout style={[styles.loadingContainer, style]}>
                {loading && withLoading && <Spinner/>}
            </Layout> : <ImageDefault style={style} source={{uri: _source}} {...other}/>}
        </>
    );
};

export default Image;


const styles = StyleSheet.create({
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
});
