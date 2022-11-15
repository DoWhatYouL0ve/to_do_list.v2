import { tasksReducer } from './tasks-reducer';
import { todolistsReducer } from './todolists-reducer';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';
import {appReducer} from "./app-reducer";
import {authReducer} from "./login-reducer";
import {configureStore} from "@reduxjs/toolkit";
import {useDispatch} from "react-redux";


// объединяя reducer-ы с помощью combineReducers,
// мы задаём структуру нашего единственного объекта-состояния
const rootReducer = combineReducers({
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer
})
// непосредственно создаём store
//export const store = createStore(rootReducer, applyMiddleware(thunk));

// create store with redux toolkit
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .prepend( thunk,)
})

// определить автоматически тип всего объекта состояния
export type AppRootStateType = ReturnType<typeof rootReducer>
type AppDispatchType = typeof  store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatchType>()

// а это, чтобы можно было в консоли браузера обращаться к store в любой момент
// @ts-ignore
window.store = store;
