import {Dispatch} from "redux";
import {authAPI} from "../api/todolists-api";
import {setIsLoggedIn} from "./login-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    // true when application has been initialized (auth, user has been checked and confirmed)
    isInitialized: false
}

type InitialStateType = {
    status: RequestStatusType
    error: string | null
    isInitialized: boolean
}

const slice = createSlice({
    initialState: initialState,
    name: 'app',
    reducers: {
        setAppStatus(state, action: PayloadAction<{status: RequestStatusType}>) {
            state.status = action.payload.status},
        setAppError(state, action: PayloadAction<{error: string | null}>) {
            state.error = action.payload.error},
        setInitializedAppStatus(state, action: PayloadAction<{isInitialized: boolean}>) {
            state.isInitialized = action.payload.isInitialized
        }
    }
})

export const appReducer = slice.reducer;
export const {setAppError, setAppStatus, setInitializedAppStatus} = slice.actions;


//Thunk creators
export const initializedAppTC = () => (dispatch: Dispatch) => {
    authAPI.me().then(res=> {
        if(res.data.resultCode === 0) {
            dispatch(setIsLoggedIn({value: true}))
        }else {

        }
        dispatch(setInitializedAppStatus({isInitialized: true}))
    })
}