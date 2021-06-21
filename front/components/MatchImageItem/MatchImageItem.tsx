import React from 'react';
import {StyleSheet, Image as DefaultImage, TouchableOpacity, Dimensions} from "react-native";
import {AntDesign} from '@expo/vector-icons';
import {Icon, Layout} from "@ui-kitten/components";
import Image from '../Image/Image';

interface IProps {
    imagePath?: string,
    source?: any,
    withLoading?: boolean,
    onlyOne?: boolean,
}

function MatchImageItem({imagePath, source, withLoading = false, onlyOne = false}: IProps) {

    console.log(onlyOne);
    return (
        <Layout style={[styles.container, onlyOne ? undefined : styles.notOnlyOne]}>
            {source && source.uri && <DefaultImage style={styles.image} source={source} resizeMethod="auto"/>}
            {(!source || !source.uri) && imagePath && <Image style={styles.image} imagePath={imagePath} withLoading={withLoading}/>}
        </Layout>
    );
}

export default MatchImageItem;

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('window').width - (24 * 2),
        width: Dimensions.get('window').width - (24 * 2),
    },
    notOnlyOne: {
        marginRight: 8,
    },
    image: {
        height: Dimensions.get('window').width - (24 * 2),
        width: Dimensions.get('window').width - (24 * 2),
        borderRadius: 16,
    },
});