import React, {useEffect, useState} from 'react';
import Container from "../../components/Container/Container";
import {Button, Text} from "@ui-kitten/components";
import * as Location from 'expo-location';
import {NavigationProp} from "@react-navigation/native";
import Toast from "react-native-toast-message";
import {StyleSheet} from "react-native";

interface IProps {
    navigation: NavigationProp<any>
}

const LocalisationAuthorization = ({navigation}: IProps) => {
    const [showButton, setShowButton] = useState(true);

    const checkAuthorization = async () => {
        let {status, canAskAgain} = await Location.getBackgroundPermissionsAsync();
        if (status !== 'granted' && !canAskAgain) {
            setShowButton(false);
        } else if (status === 'granted') {
            navigation.navigate('Splash');
        }
    }

    useEffect(() => {
        checkAuthorization();
    }, []);

    const getAuthorization = async () => {
        let {status, canAskAgain} = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            let {status, canAskAgain} = await Location.requestBackgroundPermissionsAsync();
            if (status !== 'granted' && canAskAgain) {
                Toast.show({
                    type: 'error',
                    text1: 'Background permission needed localisation',
                    text2: 'Choose "Allow all the time in the menu"',
                    visibilityTime: 8000,
                });
            } else if (status !== 'granted' && !canAskAgain) {
                setShowButton(false);
            } else {
                navigation.navigate('Splash');
            }
        } else if (canAskAgain) {
            Toast.show({
                type: 'error',
                text1: 'The application cannot work without the localisation permission',
                text2: 'Please allow the permission if you want to use the application',
                visibilityTime: 4000
            });
        } else if (!canAskAgain) {
            setShowButton(false);
        }
    }

    return (
        <Container style={styles.container}>
            <Text category="h1" style={styles.title}>Permission request</Text>
            <Text appearance='hint'>This Application needs localisation permission to work</Text>
            {showButton && <Text status='info' style={styles.centeredText}>Please click the button bellow to grant the permissions needed</Text>}
            {showButton && <Button style={styles.button} onPress={() => getAuthorization()}>Grand permissions</Button>}
            {!showButton && <Text status="primary" category="s1" style={styles.centeredText}>Please go to the settings panel and grant permissions to the app</Text>}
        </Container>
    );
};

export default LocalisationAuthorization;

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: 'center',
    },
    title: {
        marginBottom: 16
    },
    button: {
        marginVertical: 16
    },
    centeredText: {
        textAlign: "center",
    }
});
