import {setAppStatus} from "./app-reducer";
import {Dispatch} from "redux";
import {authAPI, LoginParamsType} from "../api/todolists-api";
import {handleNetworkError, handleServerAppError} from "../utils/errorUtils";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

const InitialState = {
    isLoggedIn: false
}

export const login = createAsyncThunk<{isLoggedIn: boolean}, LoginParamsType, {rejectValue: {errors: string[], fieldsErrors?: Array<{field: string, error: string}> }}>('auth/login', async (data, thunkAPI)=>{
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await authAPI.login(data)
        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
            // return payload for AC to reducer case
            return {isLoggedIn: true}
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch)
            return thunkAPI.rejectWithValue({errors: res.data.messages, fieldsErrors: res.data.fieldsErrors})
        }
    }catch(err: any) {
        const error: AxiosError = err
        handleNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined})
    }
})

const slice = createSlice({
    initialState: InitialState,
    name: 'auth',
    reducers: {
        setIsLoggedIn(state, action: PayloadAction<{value: boolean}>) {
            state.isLoggedIn = action.payload.value
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login.fulfilled, (state, {payload}) => {
                state.isLoggedIn = payload.isLoggedIn
        })
    }
})

export const authReducer = slice.reducer;
export const {setIsLoggedIn} = slice.actions;

// Thunks creators

export const logOutTC = () => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    authAPI.logOut()
        .then(res => {
            if (res.data.resultCode === 0) {
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

