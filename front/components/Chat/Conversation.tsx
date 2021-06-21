import React, {useEffect} from 'react';
import {Divider, Layout, Text} from "@ui-kitten/components";
import {IConversation} from "../../types/conversation";
import {StyleSheet, TouchableHighlight, TouchableNativeFeedback, TouchableOpacity} from "react-native";
import {NavigationProp} from "@react-navigation/native";
import {createUrl} from "../../config";
import {useSelector} from "react-redux";
import {getToken} from "../../store/slices/user";
import moment from "moment";
import Image from "../Image/Image";
import {capitalize} from "../../services/helpers";

interface IProps {
    navigation: NavigationProp<any>,
    conversation: IConversation
}

const Conversation = ({navigation, conversation}: IProps) => {
    const {id, userOneId, userTwoId, user, createdAt, updatedAt} = conversation;
    const token = useSelector(getToken);

    const image = (user?.images != null && user?.images.length > 0) ? (user?.images.find(e => e.principal === 1) ?? user?.images[0]) : undefined;
    const date = new Date(updatedAt);

    return (
        <>
            <TouchableNativeFeedback
                onPress={() => navigation.navigate('Messages', {conversation})}
            >
                <Layout
                    style={styles.container}
                >
                    <Image
                        style={styles.image}
                        imagePath={image?.id}
                    />
                    <Layout
                        style={styles.textContainer}
                    >
                        <Text category="h6">{capitalize(user?.data.pseudo ?? '')}</Text>
                        <Text category="label" appearance="hint">{moment(date).fromNow()}</Text>
                    </Layout>
                </Layout>
            </TouchableNativeFeedback>
            <Divider style={styles.divider}/>
        </>
    );
};

export default Conversation;

const styles = StyleSheet.create({
    container: {
        height: 64,
        // alignSelf: 'flex-start',
        // marginRight: 64,
        // backgroundColor: '#ececec',
        borderRadius: 8,
        padding: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    textContainer: {
        flexDirection: "column",
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0)', // transparent
    },
    divider: {
        marginVertical: 4,
    },
    image: {
        height: 64,
        width: 64,
        borderRadius: 8,
        marginRight: 16,
    },
});