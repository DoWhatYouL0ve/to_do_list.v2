import {setAppStatus} from "./app-reducer";
import {Dispatch} from "redux";
import {authAPI, LoginParamsType} from "../api/todolists-api";
import {handleNetworkError, handleServerAppError} from "../utils/errorUtils";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const InitialState = {
    isLoggedIn: false
}

const slice = createSlice({
    initialState: InitialState,
    name: 'auth',
    reducers: {
        setIsLoggedIn(state, action: PayloadAction<{value: boolean}>) {
            state.isLoggedIn = action.payload.value
        }
    }
})

export const authReducer = slice.reducer;
export const {setIsLoggedIn} = slice.actions;

// Thunks creators
export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedIn({value: true}))
                dispatch(setAppStatus({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleNetworkError(error, dispatch)
        })
}

export const logOutTC = () => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    authAPI.logOut()
        .then(res => {
            if (res.data.resultCode === 0) {
                debugger
                dispatch(setIsLoggedIn({value: false}))
                dispatch(setAppStatus({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleNetworkError(error, dispatch)
        })
}
// Types

