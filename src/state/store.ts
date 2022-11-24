import { tasksReducer } from './tasks-reducer';
import { todolistsReducer } from './todolists-reducer';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import {appReducer} from "./app-reducer";
import {authReducer} from "./login-reducer";
import {configureStore} from "@reduxjs/toolkit";
import {useDispatch} from "react-redux";

const rootReducer = combineReducers({
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer
})

// create store with redux toolkit
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .prepend( thunk,)
})

export type AppRootStateType = ReturnType<typeof rootReducer>
type AppDispatchType = typeof  store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatchType>()

