import React from 'react';
import {Layout, Spinner} from "@ui-kitten/components";
import {ScrollView, StatusBar, StyleSheet} from "react-native";

interface IProps {
    children: any,
    style?: any,
    scroll?: boolean,
    loading?: boolean,
    noPadding?: boolean,

    [key: string]: any
}

const Container = ({children, style, scroll, loading, noPadding = false, ...other}: IProps) => {
    const mainElement = loading ? <Layout style={styles.loadingContainer}>
        <Spinner size="giant"/>
    </Layout> : children;

    const constructedStyle = noPadding ? undefined : styles.containerPadding;

    return (
        !scroll ? <Layout style={[styles.container, constructedStyle, style]} {...other}>
            {mainElement}
        </Layout> : <ScrollView contentContainerStyle={styles.scrollContentContainer} {...other}>
            <Layout style={[styles.container, constructedStyle, style]} {...other}>
                {mainElement}
            </Layout>
        </ScrollView>
    );
};

export default Container;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerPadding: {
        paddingTop: (StatusBar.currentHeight ?? 0) + 8,
        padding: 24,
        paddingBottom: 0,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    scrollContentContainer: {
        flexGrow: 1,
    },
});