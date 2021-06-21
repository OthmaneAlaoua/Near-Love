import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as React from 'react';
import {ColorSchemeName} from 'react-native';

import NotFoundScreen from '../screens/NotFoundScreen';
import LinkingConfiguration from './LinkingConfiguration';
import BottomTabAuthenticationNavigator from './BottomTabAuthenticationNavigator';
import BottomTabRootNavigator from "./BottomTabRootNavigator";
import Splash from "../screens/Splash/Splash";
import LocalisationAuthorization from "../screens/Splash/LocalisationAuthorization";

export default function Navigation({colorScheme}: { colorScheme: ColorSchemeName }) {
    return (
        <NavigationContainer
            linking={LinkingConfiguration}
            theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
            <RootNavigator/>
        </NavigationContainer>
    );
}

const Stack = createStackNavigator();
function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Splash">
            <Stack.Screen name="Splash" component={Splash}/>
            <Stack.Screen name="NotAuthorized" component={LocalisationAuthorization}/>
            <Stack.Screen name="Authentication" component={BottomTabAuthenticationNavigator}/>
            <Stack.Screen name="Root" component={BottomTabRootNavigator}/>
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{title: 'Oops!'}}/>
        </Stack.Navigator>
    );
}
