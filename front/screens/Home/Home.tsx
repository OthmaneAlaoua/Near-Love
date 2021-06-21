import React, {useEffect, useState} from 'react';
import Container from "../../components/Container/Container";
import {useSelector} from "react-redux";
import {getPseudo} from "../../store/slices/user";
import {Button, Layout, Text} from '@ui-kitten/components';
import request from "../../services/request";
import {IMatch} from "../../types/match";
import Match from "../../components/Match/Match";
import {FlatList, StyleSheet} from "react-native";

interface IProps {
}

const Home = ({}: IProps) => {
    const pseudo = useSelector(getPseudo);
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<IMatch[]>([]);

    const [loadingAccept, setLoadingAccept] = useState(false);
    const [loadingRefuse, setLoadingRefuse] = useState(false);

    const [fetchTries, setFetchTries] = useState(0);

    useEffect(() => {
        const getMatches = async () => {
            try {
                setLoading(true);
                const response = await request('matching', 'customer', 'get');
                setMatches(response?.data?.data);
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        }
        getMatches();
    }, [fetchTries]);

    const accept = async (matchId: number) => {
        try {
            setLoadingAccept(true);
            const response = await request('set-decision', 'customer', 'post', {
                matcheId: matchId,
                decision: true
            });
            setMatches(prev => {
               const newValues = [...prev];
               newValues.splice(0, 1);
               return newValues;
            });
        } catch (e) {
            console.log(e?.response);
        } finally {
            setLoadingAccept(false);
        }
    }

    const refuse = async (matchId: number) => {
        try {
            setLoadingRefuse(true);
            const response = await request('set-decision', 'customer', 'post', {
                matcheId: matchId,
                decision: false
            });
            setMatches(prev => {
               const newValues = [...prev];
               newValues.splice(0, 1);
               return newValues;
            });
        } catch (e) {
            console.log(e?.response);
        } finally {
            setLoadingRefuse(false);
        }
    }

    return (
        <Container loading={loading} style={styles.container} noPadding={true} scroll={true}>
            {matches?.length != null && matches?.length > 0 && <Match match={matches[0]} accept={accept} refuse={refuse} loadingAccept={loadingAccept} loadingRefuse={loadingRefuse}/>}
            {matches?.length === 0 && <Layout style={styles.noMatchesLayout}>
                <Text category="h6" style={styles.centeredText}>No Matches for the moment</Text>
                <Text appearance="hint" style={styles.centeredText}>New matches will appear here</Text>
                <Button style={styles.reloadButton} onPress={() => setFetchTries(prev => prev + 1)}>Reload</Button>
            </Layout>}
            {/*<FlatList*/}
            {/*    ListHeaderComponent={<Layout style={styles.headerContainer}>*/}
            {/*        /!*<Text category="h4" appearance="hint">Welcome back {pseudo ?? ''}</Text>*!/*/}
            {/*    </Layout>}*/}
            {/*    contentContainerStyle={styles.listContainer}*/}
            {/*    data={matches}*/}
            {/*    renderItem={({item}) => <Match match={item}/>}*/}
            {/*    keyExtractor={item => item.id + ''}*/}
            {/*/>*/}
        </Container>
    );
};

export default Home;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        // paddingTop: 16,
    },
    listContainer: {
        flexGrow: 1,
        // backgroundColor: 'red',
    },
    headerContainer: {
        alignItems: "center",
        marginTop: 8,
        marginBottom: 16,
    },
    noMatchesLayout: {
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    reloadButton: {
        marginTop: 8,
        width: 128,
    },
    centeredText: {
        textAlign: "center",
    }
});
