import React, {useCallback, useEffect, useState} from 'react';
import Container from "../../components/Container/Container";
import request from "../../services/request";
import Conversation from "../../components/Chat/Conversation";
import {IConversation} from "../../types/conversation";
import {NavigationProp, useIsFocused} from "@react-navigation/native";
import {FlatList, StyleSheet} from "react-native";
import {Layout, Text} from "@ui-kitten/components";

interface IProps {
    navigation: NavigationProp<any>,
}

const Chat = ({navigation}: IProps) => {
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<IConversation[]>([]);

    const isFocused = useIsFocused();

    useEffect(() => {
        const getConversations = async () => {
            try {
                setLoading(true);
                const response = await request('conversations', 'chat', 'get');
                setConversations(response.data);
            } catch (e) {
            } finally {
                setLoading(false);
            }
        }
        getConversations();
    }, []);

    return (
        <Container loading={loading} style={styles.container}>
            <FlatList
                ListHeaderComponent={<Layout style={styles.headerContainer}>
                    <Text category="h1">Chat</Text>
                </Layout>}
                ListEmptyComponent={<Layout style={styles.emptyListContainer}>
                    <Text category="h6" style={styles.centeredText}>No chats for the moment!</Text>
                    <Text appearance="hint" style={styles.centeredText}>You will see chats here once you match with somebody</Text>
                </Layout>}
                contentContainerStyle={styles.listContainer}
                data={conversations}
                renderItem={({item}) => <Conversation conversation={item} navigation={navigation} key={item.id}/>}
                keyExtractor={item => item.id + ''}
            />
        </Container>
    );
};

export default Chat;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        flexGrow: 1,
        // backgroundColor: 'red',
    },
    headerContainer: {
        marginBottom: 16,
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    centeredText: {
        textAlign: "center",
    }
});
