import {setAppError, setAppStatus} from "../state/app-reducer";
import {ResponseType} from "../api/todolists-api";
import {ActionsType} from "../state/tasks-reducer";
import {Dispatch} from "redux";


export const handleServerAppError = <T>(data: ResponseType<T>, dispatch: Dispatch<ActionsType>) => {
    if (data.messages.length) {
        dispatch(setAppError(data.messages[0]));
    } else {
        dispatch(setAppError('unexpected error occurred'));
    }
    dispatch(setAppStatus('failed'))
}

export const handleNetworkError = (error: {message: string}, dispatch: Dispatch<ActionsType>) => {
    dispatch(setAppError(error.message ? error.message : 'unexpected error occurred'))
    dispatch(setAppStatus('failed'))
}