import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IState {
    token: string | undefined,
    userData: IUserData | undefined,
}

interface IUserData {
    email: string,
    pseudo: string,
    userId: number,
}

const initialState: IState = {
    token: undefined,
    userData: undefined
}

interface ILoginPayload {
    email: string,
    jwt: string,
    pseudo: string,
    userId: number,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<ILoginPayload>) => {
            const {jwt, email, pseudo, userId} = action.payload;
            state.token = jwt;
            state.userData = {
                email,
                pseudo,
                userId,
            };
            AsyncStorage.setItem('auth', JSON.stringify(action.payload));
        },
        logout: state => {
            state.token = undefined;
            state.userData = undefined;
            AsyncStorage.removeItem('auth');
        }
    }
});

export const {login, logout} = userSlice.actions;

export const isLoggedIn = (state: RootState) => state.user.token != null;
export const getToken = (state: RootState) => state.user.token;
export const getUserData = (state: RootState) => state.user.userData;
export const getUserId = (state: RootState) => state.user.userData?.userId;
export const getPseudo = (state: RootState) => state.user.userData?.pseudo;
export const getEmail = (state: RootState) => state.user.userData?.email;

export default userSlice;