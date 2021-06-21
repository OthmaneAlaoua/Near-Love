import * as React from 'react';
import {Ionicons} from '@expo/vector-icons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {BottomNavigation, BottomNavigationTab, Layout, Text, Icon} from '@ui-kitten/components';
import Profil from "../screens/Profil/Profil";
import Home from "../screens/Home/Home";
import Chat from "../screens/Chat/Chat";
import * as TaskManager from "expo-task-manager";
import request from "../services/request";
import {useCallback, useEffect} from "react";
import * as Location from "expo-location";
import Messages, {IMessageWithConversation} from "../screens/Messages/Messages";
import io from "socket.io-client";
import config from "../config";
import {useSelector} from "react-redux";
import {getUserId} from "../store/slices/user";
import {NavigationProp, useIsFocused} from "@react-navigation/native";
import Toast from "react-native-toast-message";

const LOCATION_TASK = 'background-location-task';

export let socket: any = null;

interface IProps {
    navigation: NavigationProp<any>,
}

const BottomTab = createBottomTabNavigator();
export default function BottomTabRootNavigator({navigation}: IProps) {
    useEffect(() => {
        const startLocationTracking = async () => {
            await Location.startLocationUpdatesAsync(LOCATION_TASK, {
                accuracy: Location.Accuracy.Highest,
                timeInterval: 5000,
                distanceInterval: 0,
            });
        }
        startLocationTracking();
    }, []);

    const messagesListener = useCallback((data: IMessageWithConversation) => {
        Toast.show({
            type: 'info',
            text1: data.message.content,
            text2: data.user.pseudo,
            visibilityTime: 3000,
            onPress: () => navigation.navigate('Chat')
        });
    }, []);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused && socket) {
            socket.on('receiveMessage', messagesListener);
        } else if (socket) {
            console.log('listener off');
            socket.off('receiveMessage', messagesListener);
        }
    }, [socket, isFocused]);

    const userId = useSelector(getUserId);

    useEffect(() => {
        socket = io(config.proxyWsUrl, {
            transports: ['websocket'],
            query: {
                userId: userId + ''
            }
        });
    }, []);

    return (
        <BottomTab.Navigator
            initialRouteName="Authentication"
            tabBar={props => <BottomTabBar {...props} />}
            screenOptions={{unmountOnBlur: true}}
        >
            <BottomTab.Screen
                name="Home"
                component={HomeNavigator}
            />
            <BottomTab.Screen
                name="Chat"
                component={ChatNavigator}
            />
            <BottomTab.Screen
                name="Profil"
                component={ProfilNavigator}
            />
        </BottomTab.Navigator>
    );
}

// @ts-ignore
const BottomTabBar = ({navigation, state}) => (
    <BottomNavigation
        selectedIndex={state.index}
        onSelect={index => navigation.navigate(state.routeNames[index])}
    >
        <BottomNavigationTab title='Match' icon={(props) => <Icon {...props} name='heart-outline'/>}/>
        <BottomNavigationTab title='Chat' icon={(props) => <Icon {...props} name='message-circle-outline'/>}/>
        <BottomNavigationTab title='Profil' icon={(props) => <Icon {...props} name='person-outline'/>}/>
    </BottomNavigation>
);

/**
 * the screens
 */
const HomeStack = createStackNavigator();

function HomeNavigator() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen
                name="Home"
                component={Home}
                options={{headerShown: false, headerTitle: 'Home'}}
            />
        </HomeStack.Navigator>
    );
}

/**
 * the screens
 */
const ProfilStack = createStackNavigator();

function ProfilNavigator() {
    return (
        <ProfilStack.Navigator>
            <ProfilStack.Screen
                name="Profil"
                component={Profil}
                options={{headerShown: false, headerTitle: 'Profil'}}
            />
        </ProfilStack.Navigator>
    );
}

/**
 * the screens
 */
const ChatStack = createStackNavigator();

function ChatNavigator() {
    return (
        <ChatStack.Navigator initialRouteName="Chat">
            <ChatStack.Screen
                name="Chat"
                component={Chat}
                options={{headerShown: false, headerTitle: 'Profil'}}
            />
            <ChatStack.Screen
                name="Messages"
                component={Messages}
                options={{headerShown: false, headerTitle: 'Profil'}}
            />
        </ChatStack.Navigator>
    );
}

TaskManager.defineTask(LOCATION_TASK, async ({data, error}) => {
    if (error) {
        console.log(error);
        return;
    }
    if (data) {
        // @ts-ignore
        const {locations} = data;
        for (const location of locations) {
            try {
                await request('localisation', 'localisation', 'post', {
                    latitude: location.coords.latitude + '',
                    longitude: location.coords.longitude + '',
                    altitude: location.coords.altitude + '',
                });
                console.log('location sent');
            } catch (e) {
                console.log(e?.response);
            }
        }
    }
});
