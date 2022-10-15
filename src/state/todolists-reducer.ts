import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {RequestStatusType, setAppStatus} from "./app-reducer";
import {handleNetworkError} from "../utils/errorUtils";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState: Array<TodolistDomainType> = [
    /*{id: todolistId1, title: 'What to learn', filter: 'all', addedDate: '', order: 0},
    {id: todolistId2, title: 'What to buy', filter: 'all', addedDate: '', order: 0}*/
]

const slice = createSlice({
    initialState: initialState,
    name: 'todolists',
    reducers: {
        removeTodolistAC(state, action: PayloadAction<{id: string}>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if(index > -1) {
                state.splice(index, 1)
            }
        },
        addTodolistAC(state, action: PayloadAction<{todolist: TodolistType}>) {
            state.push({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },
        changeTodolistTitleAC(state, action: PayloadAction<{id: string, title: string}>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].title = action.payload.title
        },
        changeTodolistFilterAC(state, action: PayloadAction<{id: string, filter: FilterValuesType}>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].filter = action.payload.filter
        },
        changeToDoListEntityStatusAC(state, action: PayloadAction<{id: string, status: RequestStatusType}>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].entityStatus = action.payload.status
        },
        setTodolistsAC(state, action: PayloadAction<{todoLists: Array<TodolistType>}>) {
            return action.payload.todoLists.map(t => ({...t, filter: 'all', entityStatus: 'idle'}))
        },
    }
})

export const todolistsReducer = slice.reducer;
export const {removeTodolistAC, addTodolistAC, changeTodolistTitleAC, changeTodolistFilterAC, changeToDoListEntityStatusAC, setTodolistsAC} = slice.actions;

// Thunk
export const fetchTodolists = () => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    todolistsAPI.getTodolists()
        .then(res => {
            dispatch(setTodolistsAC({todoLists: res.data}))
            dispatch(setAppStatus({status: 'succeeded'}))
        })
        .catch((error)=>{
            handleNetworkError(error, dispatch)
        })
}
export const deleteToDoListTC = (id: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    dispatch(changeToDoListEntityStatusAC({id: id,  status: 'loading'}))
    todolistsAPI.deleteTodolist(id).then(res => {
        dispatch(removeTodolistAC({id: id}))
        dispatch(setAppStatus({status: 'succeeded'}))
    })
}
export const addToDoListTC = (title: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    todolistsAPI.createTodolist(title).then(res => {
        dispatch(addTodolistAC({todolist: res.data.data.item}))
        dispatch(setAppStatus({status: 'succeeded'}))
    })
}
export const changeTodolistTitleTC = (id: string, title: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    todolistsAPI.updateTodolist(id, title)
        .then(res => {
            dispatch(changeTodolistTitleAC({id: id, title: title}))
            dispatch(setAppStatus({status: 'succeeded'}))
        })
}

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}