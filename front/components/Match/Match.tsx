import React, {useEffect, useRef, useState} from 'react';
import {Button, Icon, Layout, Spinner, Text} from "@ui-kitten/components";
import {IMatch} from "../../types/match";
import {FlatList, StyleSheet} from "react-native";
import Conversation from "../Chat/Conversation";
import MatchImageItem from "../MatchImageItem/MatchImageItem";
import moment from "moment";
import {capitalize} from "../../services/helpers";
import {manImage, womenImage} from "../../services/images";

interface IProps {
    match: IMatch,
    accept: Function,
    refuse: Function,
    loadingAccept: boolean,
    loadingRefuse: boolean,
}

const Match = ({match, accept, refuse, loadingAccept, loadingRefuse}: IProps) => {
    const {user} = match;
    const {email, data, images} = user ?? {};
    const {gender, pseudo, attracted_by, date_of_birth, customer_id} = data ?? {};

    const zoomIconRef = useRef(null);

    const yearOfBirth = (new Date((date_of_birth) ? (parseInt(date_of_birth) * 1000) : '')).getFullYear();
    const thisYear = (new Date()).getFullYear();

    useEffect(() => {
        if (zoomIconRef.current) {
            // @ts-ignore
            zoomIconRef.current.startAnimation();
        }
    }, []);

    return (
        <Layout>
            <Layout style={styles.titlesLayout}>
                <Text category="h3" style={styles.title}>{capitalize(pseudo ?? '')},</Text>
                <Text category="h4" appearance="hint" style={styles.title}> {thisYear - yearOfBirth}</Text>
            </Layout>
            <FlatList
                // pagingEnabled={true}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={<Layout style={styles.margin}/>}
                ListFooterComponent={<Layout style={styles.margin}/>}
                data={images?.length !== 0 ? images : [{source: user?.data.gender === 0 ? womenImage : manImage}]}
                renderItem={({item}) => <MatchImageItem imagePath={item.id} source={{uri: item?.source ?? undefined}} withLoading={true} key={item.id} onlyOne={(images?.length === 0 ? 1 : images?.length) === 1}/>}
                keyExtractor={item => item.id + ''}
                horizontal={true}
            />
            <Layout style={styles.buttonContainer}>
                <Button
                    status="basic"
                    size="giant"
                    appearance="ghost"
                    style={styles.button}
                    accessoryRight={(props) => loadingRefuse ? <Spinner size="tiny"/> : <Icon {...props} name='close-outline'/>}
                    onPress={() => refuse(match.id)}
                    disabled={loadingAccept || loadingAccept}
                />
                <Button
                    status="danger"
                    size="giant"
                    style={styles.heartButton}
                    accessoryRight={(props) => loadingAccept ? <Spinner size="tiny"/> : <Icon
                        {...props}
                        ref={zoomIconRef}
                        // @ts-ignore
                        animationConfig={{cycles: Infinity}}
                        animation='zoom'
                        name='heart-outline'
                    />}
                    onPress={() => accept(match.id)}
                    disabled={loadingAccept || loadingRefuse}
                />
            </Layout>
        </Layout>
    );
};

export default Match;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        flexGrow: 1,
        marginVertical: 24,
    },
    headerContainer: {
        marginBottom: 16,
    },
    margin: {
        width: 24,
    },
    heartButton: {
        borderRadius: 50,
        height: 64,
        width: 64,
    },
    button: {
        borderRadius: 50,
        height: 64,
        width: 64,
    },
    title: {
        marginTop: 24,
    },
    buttonContainer: {
        marginHorizontal: 64,
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    titlesLayout: {
        flexDirection: "row",
        marginHorizontal: 24,
        alignItems: "flex-end"
    },
    // icon: {
    //     height: 32,
    //     width: 32,
    // },
});
