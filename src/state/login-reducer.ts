import {SetAppErrorType, setAppStatus, SetAppStatusType} from "./app-reducer";
import {Dispatch} from "redux";
import {authAPI, LoginParamsType} from "../api/todolists-api";
import {handleNetworkError, handleServerAppError} from "../utils/errorUtils";
import {ActionsType} from "./tasks-reducer";

const InitialState: InitialStateType = {
    isLoggedIn: false
}

export const authReducer = (state:  InitialStateType = InitialState, action: LoginActionType): InitialStateType => {
   switch (action.type) {
       case "login/SET-IS-LOGGED-IN":
           return {...state, isLoggedIn: action.value}
       default:
           return state
   }
}

// Action creators

export const setIsLoggedIn = (value:boolean) => ({
    type: 'login/SET-IS-LOGGED-IN', value
} as const)

// Thunks creators
export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch<ActionsType | LoginActionType>) => {
    dispatch(setAppStatus('loading'))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                debugger
                dispatch(setIsLoggedIn(true))
                dispatch(setAppStatus('succeeded'))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleNetworkError(error, dispatch)
        })
}

export const logOutTC = () => (dispatch: Dispatch<ActionsType | LoginActionType>) => {
    dispatch(setAppStatus('loading'))
    authAPI.logOut()
        .then(res => {
            if (res.data.resultCode === 0) {
                debugger
                dispatch(setIsLoggedIn(false))
                dispatch(setAppStatus('succeeded'))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleNetworkError(error, dispatch)
        })
}
// Types

type InitialStateType = {
    isLoggedIn: boolean
}

export type SetIsLoggedInType = ReturnType<typeof setIsLoggedIn>

type LoginActionType =
    | SetIsLoggedInType
    | SetAppErrorType
    | SetAppStatusType
