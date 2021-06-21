import React, {useCallback, useEffect, useState} from 'react';
import Container from "../../components/Container/Container";
import request from "../../services/request";
import {IMessage} from "../../types/message";
import Message from "../../components/Chat/Message";
import {NavigationProp, RouteProp, useIsFocused} from "@react-navigation/native";
import {FlatList, StatusBar, StyleSheet} from "react-native";
import messages from "../../../app/chat-api/src/routes/messages";
import {useSelector} from "react-redux";
import {getToken, getUserId} from "../../store/slices/user";
import {Button, Layout, Spinner, Text, Icon, Input} from "@ui-kitten/components";
import {socket} from "../../navigation/BottomTabRootNavigator";
import {IConversation} from "../../types/conversation";
import uuid from 'react-native-uuid';
import Image from '../../components/Image/Image';
import {capitalize} from "../../services/helpers";

interface IProps {
    navigation: NavigationProp<any>,
    route: RouteProp<any, any>
}

export interface IMessageWithConversation {
    conversationId: number,
    message: IMessage,
    user: any,
    userId: number,
}

const Messages = ({route, navigation}: IProps) => {
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<IMessage[]>([]);

    const [messageText, setMessageText] = useState('');

    const myUserId = useSelector(getUserId);
    const token = useSelector(getToken);

    const conversation: IConversation = route.params?.conversation;
    const user = conversation?.user;
    const image = (user?.images != null && user?.images.length > 0) ? (user?.images.find(e => e.principal === 1) ?? user?.images[0]) : undefined;

    const isFocused = useIsFocused();

    const messagesListener = useCallback((data: IMessageWithConversation) => {
        if (data.conversationId === conversation.id) {
            setMessages(prev => [data.message, ...prev]);
        }
    }, []);

    useEffect(() => {
        const getMessages = async () => {
            try {
                setLoading(true);
                const response = await request(['messages', conversation.id + ''], 'chat', 'get');
                setMessages(response.data);
            } catch (e) {

            } finally {
                setLoading(false);
            }
        }
        getMessages();
    }, [conversation]);

    useEffect(() => {
        if (isFocused) {
            socket.on('receiveMessage', messagesListener);
        } else {
            console.log('listener off');
            socket.off('receiveMessage', messagesListener);
        }
    }, [isFocused]);

    const sendMessage = () => {
        socket.emit('sendMessage', {
            conversationId: conversation.id,
            message: messageText,
            token
        });
        // @ts-ignore
        const id: string = uuid.v4();
        setMessages(prev => [{
            content: messageText,
            createdAt: new Date().toString(),
            updatedAt: new Date().toString(),
            userId: myUserId ?? 0,
            conversationId: conversation.id,
            id
        }, ...prev]);
        setMessageText('');
    }

    return (
        <>
            <Layout style={styles.header}>
                <Button
                    style={styles.returnButton}
                    accessoryLeft={() => <Icon
                        style={styles.icon}
                        fill='#8F9BB3'
                        name='arrow-back-outline'
                    />}
                    appearance="ghost"
                    onPress={() => navigation.goBack()}
                />
                <Image style={styles.headerImage} imagePath={image?.id} withLoading={true}/>
                <Text appearance="hint" category="h6">{capitalize(conversation.user?.data?.pseudo ?? '')}</Text>
            </Layout>
            <Container noPadding={true} loading={loading}>
                <FlatList
                    contentContainerStyle={styles.listContainer}
                    data={messages}
                    renderItem={({item}) => <Message message={item} key={item.id} isMine={item.userId === myUserId}/>}
                    keyExtractor={item => item.id + ''}
                    inverted={true}
                />
                <Layout style={styles.footer}>
                    <Input
                        placeholder="Message"
                        value={messageText}
                        onChangeText={text => setMessageText(text)}
                        style={styles.input}
                    />
                    <Button
                        style={styles.submitButton}
                        size="tiny"
                        accessoryLeft={() => <Icon
                            style={styles.otherIcon}
                            fill="#3266FF"
                            name='arrow-right-outline'
                        />}
                        appearance="ghost"
                        onPress={() => sendMessage()}
                    />
                </Layout>
            </Container>
        </>
    );
};

export default Messages;

const styles = StyleSheet.create({
    header: {
        paddingTop: StatusBar.currentHeight,
        height: 86,
        elevation: 3,
        flexDirection: "row",
        alignItems: "center",
    },
    footer: {
        // height: 48,
        elevation: 3,
        flexDirection: "row",
    },
    container: {
        flex: 1,
    },
    listContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        // backgroundColor: 'red',
    },
    returnButton: {
        alignItems: "center",
        justifyContent: "center",
    },
    submitButton: {
        width: 64,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        height: 32,
        width: 32,
    },
    otherIcon: {
        height: 24,
        width: 24,
    },
    input: {
        flex: 1,
        // height: 48,
        // width: '100%',
    },
    headerImage: {
        marginRight: 16,
        borderRadius: 50,
        height: 48,
        width: 48,
    }
});
