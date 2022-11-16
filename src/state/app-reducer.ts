import {authAPI} from "../api/todolists-api";
import {setIsLoggedIn} from "./login-reducer";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

// Types
const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    // true when application has been initialized (auth, user has been checked and confirmed)
    isInitialized: false
}

export type InitialStateType = {
    status: RequestStatusType
    error: string | null
    isInitialized: boolean
}

export const initializedApp = createAsyncThunk('app/initializedApp', async (params, thunkAPI) => {

       const res = await authAPI.me()
       if (res.data.resultCode === 0) {
           thunkAPI.dispatch(setIsLoggedIn({value: true}))
           return
       } else {

       }

})

const slice = createSlice({
    initialState: initialState,
    name: 'app',
    reducers: {
        setAppStatus(state, action: PayloadAction<{status: RequestStatusType}>) {
            state.status = action.payload.status},
        setAppError(state, action: PayloadAction<{error: string | null}>) {
            state.error = action.payload.error},
    },
    extraReducers: builder => {
        builder.addCase(initializedApp.fulfilled, (state) => {
            state.isInitialized = true
        })
    }
})

export const appReducer = slice.reducer;
export const {setAppError, setAppStatus} = slice.actions;
