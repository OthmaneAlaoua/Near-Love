import React from 'react';
import {Layout, Text} from "@ui-kitten/components";
import {IConversation} from "../../types/conversation";
import {IMessage} from "../../types/message";
import {StyleSheet} from "react-native";
import moment from "moment";

interface IProps {
    message: IMessage,
    isMine: boolean,
}

const Message = ({message, isMine}: IProps) => {
    const {id, conversationId, userId, content, createdAt, updatedAt} = message;

    const date = new Date(createdAt);

    return (
        <Layout style={[styles.container, isMine ? styles.mine : styles.notMine]}>
            {/*<Text style={isMine ? styles.mineText : styles.notMineText}>{userId}</Text>*/}
            <Text style={isMine ? styles.mineText : styles.notMineText}>{content}</Text>
            <Text style={isMine ? styles.mineDate : styles.notMineDate} category="label">{moment(date).fromNow()}</Text>
        </Layout>
    );
};

export default Message;

const styles = StyleSheet.create({
    container: {
        // height: 64,
        marginVertical: 8,
        borderRadius: 8,
        padding: 12,
    },
    mine: {
        alignSelf: 'flex-end',
        marginLeft: 64,
        backgroundColor: '#3266FF',
        color: 'white'
    },
    notMine: {
        alignSelf: 'flex-start',
        marginRight: 64,
        backgroundColor: '#ececec',
    },
    mineText: {
        color: 'white',
    },
    notMineText: {
        color: 'black',
    },
    mineDate: {
        alignSelf: "flex-end",
        color: '#cbcbcb',
    },
    notMineDate: {
        alignSelf: "flex-start",
        color: '#363636',
    },
});
