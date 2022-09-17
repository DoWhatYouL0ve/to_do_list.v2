import {Dispatch} from "redux";
import {authAPI} from "../api/todolists-api";
import {setIsLoggedIn, SetIsLoggedInType} from "./login-reducer";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState: InitialStateType= {
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

export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case 'APP/SET-ERROR':
            return {...state, error: action.error}
        case "APP/SET-INITIALIZED-STATUS":
            return {...state, isInitialized: action.isInitialized}
        default:
            return state
    }
}

export type SetAppErrorType = ReturnType<typeof setAppError>
export type SetAppStatusType = ReturnType<typeof setAppStatus>
export type SetInitializedAppStatusType = ReturnType<typeof setInitializedAppStatus>

type ActionsType = SetAppErrorType | SetAppStatusType | SetInitializedAppStatusType | SetIsLoggedInType

// Action creators
export const setAppError = (error: string | null) => ({type: 'APP/SET-ERROR', error} as const)
export const setAppStatus = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const)
export const setInitializedAppStatus = (isInitialized: boolean) => ({type: 'APP/SET-INITIALIZED-STATUS', isInitialized} as const)

//Thunk creators
export const initializedAppTC = () => (dispatch: Dispatch<ActionsType>) => {
    authAPI.me().then(res=> {
        if(res.data.resultCode === 0) {
            dispatch(setIsLoggedIn(true))
        }else {

        }
        dispatch(setInitializedAppStatus(true))
    })
}