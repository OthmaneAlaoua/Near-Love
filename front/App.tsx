import 'react-native-gesture-handler';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import * as eva from '@eva-design/eva';
import {ApplicationProvider, IconRegistry, Layout, Text} from '@ui-kitten/components';
import {Provider} from 'react-redux';
import {EvaIconsPack} from '@ui-kitten/eva-icons';

import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import {Dimensions, StyleSheet, StatusBar as _StatusBar} from "react-native";
import store from "./store/store";
import Toast from 'react-native-toast-message';

console.disableYellowBox = true;

export default function App() {
    // const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();

    // if (!isLoadingComplete) {
    //     return null;
    // } else {
    return (
        <Provider store={store}>
            <IconRegistry icons={EvaIconsPack}/>
            <ApplicationProvider {...eva} theme={colorScheme === 'dark' ? eva.dark : eva.light}>
                <SafeAreaProvider>
                    <StatusBar/>
                    <Navigation colorScheme={colorScheme}/>
                    <Toast
                        ref={(ref) => Toast.setRef(ref)}
                        visibilityTime={2500}
                        topOffset={(_StatusBar.currentHeight ?? 0) + 8}
                    />
                </SafeAreaProvider>
            </ApplicationProvider>
        </Provider>
    );
    // }
}
