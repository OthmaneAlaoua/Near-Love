import * as React from 'react';
import {Ionicons} from '@expo/vector-icons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import { BottomNavigation, BottomNavigationTab, Layout, Text } from '@ui-kitten/components';
import Login from "../screens/Login/Login";
import Register from "../screens/Register/Register";

const BottomTab = createBottomTabNavigator();
export default function BottomTabAuthenticationNavigator() {
    return (
        <BottomTab.Navigator
            initialRouteName="Authentication"
            tabBar={props => <BottomTabBar {...props} />}
            screenOptions={{unmountOnBlur: true}}
        >
            <BottomTab.Screen
                name="Login"
                component={LoginNavigator}
            />
            <BottomTab.Screen
                name="Register"
                component={RegisterNavigator}
            />
        </BottomTab.Navigator>
    );
}

// @ts-ignore
const BottomTabBar = ({ navigation, state }) => (
    <BottomNavigation
        selectedIndex={state.index}
        onSelect={index => navigation.navigate(state.routeNames[index])}
    >
        <BottomNavigationTab title='Login'/>
        <BottomNavigationTab title='Register'/>
    </BottomNavigation>
);

/**
 * the screens
 */
const LoginStack = createStackNavigator();
function LoginNavigator() {
    return (
        <LoginStack.Navigator>
            <LoginStack.Screen
                name="Login"
                component={Login}
                options={{headerShown: false, headerTitle: 'Login'}}
            />
        </LoginStack.Navigator>
    );
}

/**
 * the screens
 */
const RegisterStack = createStackNavigator();
function RegisterNavigator() {
    return (
        <RegisterStack.Navigator>
            <RegisterStack.Screen
                name="Register"
                component={Register}
                options={{headerShown: false, headerTitle: 'Register'}}
            />
        </RegisterStack.Navigator>
    );
}
