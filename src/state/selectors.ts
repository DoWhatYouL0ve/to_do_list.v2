import {AppRootStateType} from "./store";
import {RequestStatusType} from "./app-reducer";
import {useSelector} from "react-redux";
import {TodolistDomainType} from "./todolists-reducer";
import {TasksStateType} from "../app/App";

export const selectStatus = (state:AppRootStateType):RequestStatusType => state.app.status
export const selectIsInitialized = (state: AppRootStateType): boolean => state.app.isInitialized
export const selectIsLoggedIn = (state: AppRootStateType): boolean => state.auth.isLoggedIn
export const selectTodoLists = (state: AppRootStateType): Array<TodolistDomainType>=> state.todolists
export const selectTasks = (state:AppRootStateType): TasksStateType=> state.tasks
export const selectError = (state:AppRootStateType): string | null =>state.app.error