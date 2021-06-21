import React from 'react';
import {StyleSheet, Image as DefaultImage, TouchableOpacity} from "react-native";
import {AntDesign} from '@expo/vector-icons';
import {Icon, Layout} from "@ui-kitten/components";
import Image from '../Image/Image';

interface IProps {
    onDeleteClick: Function,
    imagePath?: string,
    source?: any,
    withLoading?: boolean
}

function ImageItem({onDeleteClick, imagePath, source, withLoading = false}: IProps) {
    return (
        <Layout style={styles.container}>
            <TouchableOpacity onPress={() => onDeleteClick()} style={styles.closeButtonContainer} activeOpacity={0.8}>
                <Icon
                    style={styles.closeButton}
                    fill="#FF5280"
                    name='close-outline'
                />
            </TouchableOpacity>
            {source && <DefaultImage style={styles.image} source={source} resizeMethod="auto"/>}
            {!source && imagePath && <Image style={styles.image} imagePath={imagePath} withLoading={withLoading}/>}
        </Layout>
    );
}

export default ImageItem;

const styles = StyleSheet.create({
    container: {
        height: 84,
        width: 84,
        marginRight: 8,
    },
    image: {
        height: 84,
        width: 84,
        borderRadius: 4,
    },
    closeButtonContainer: {
        position: "absolute",
        right: 2,
        top: 2,
        zIndex: 2,
        elevation: 2,
        backgroundColor: '#ffffff',
        borderRadius: 32,
    },
    closeButton: {
        width: 24,
        height: 24,
    }
});