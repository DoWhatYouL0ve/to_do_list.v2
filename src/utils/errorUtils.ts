import {setAppError, setAppStatus} from "../state/app-reducer";
import {ResponseType} from "../api/todolists-api";
import {ActionsType} from "../state/tasks-reducer";
import {Dispatch} from "redux";


export const handleServerAppError = <T>(data: ResponseType<T>, dispatch: Dispatch) => {
    if (data.messages.length) {
        dispatch(setAppError({error: data.messages[0]}));
    } else {
        dispatch(setAppError({error: 'unexpected error occurred'}));
    }
    dispatch(setAppStatus({status: 'failed'}))
}

export const handleNetworkError = (error: {message: string}, dispatch: Dispatch) => {
    dispatch(setAppError({error: error.message ? error.message : 'unexpected error occurred'}))
    dispatch(setAppStatus({status: 'failed'}))
}