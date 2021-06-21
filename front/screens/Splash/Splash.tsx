import React, {useEffect} from 'react';
import Container from "../../components/Container/Container";
import {StyleSheet, Image} from "react-native";
import {Spinner, Text} from "@ui-kitten/components";
import {NavigationProp} from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from "../../store/store";
import {login} from "../../store/slices/user";
import * as Location from "expo-location";
import {useIsFocused} from '@react-navigation/native';
import {logo} from "../../services/images";

interface IProps {
    navigation: NavigationProp<any>
}

const Splash = ({navigation}: IProps) => {
    const isFocused = useIsFocused();
    
    useEffect(() => {
        Location.getBackgroundPermissionsAsync().then(res => {
            if (res.status !== 'granted') {
                navigation.navigate('NotAuthorized');
            } else {
                AsyncStorage.getItem('auth').then(res => {
                    if (res == null) {
                        navigation.navigate('Authentication');
                        throw new Error('not found');
                    }
                    store.dispatch(login(JSON.parse(res)));
                    navigation.navigate('Root');
                }).catch(err => {
                    navigation.navigate('Authentication');
                });
            }
        });
    }, [isFocused]);

    return (
        <Container style={styles.container}>
            {/*<Text category="h1" style={styles.title}>168H</Text>*/}
            <Image source={{uri: logo}} style={styles.logo}/>
            <Spinner size="giant"/>
        </Container>
    );
};

export default Splash;

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: 'center',
    },
    title: {
        marginBottom: 16
    },
    logo: {
        marginBottom: 32,
        width: 200,
        height: 64,
    }
});