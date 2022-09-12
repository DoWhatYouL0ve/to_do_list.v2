import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {RequestStatusType, SetErrorType, setStatus, SetStatusType} from "./app-reducer";

const initialState: Array<TodolistDomainType> = [
    /*{id: todolistId1, title: 'What to learn', filter: 'all', addedDate: '', order: 0},
    {id: todolistId2, title: 'What to buy', filter: 'all', addedDate: '', order: 0}*/
]

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.id)
        case 'ADD-TODOLIST':
            return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(t=>t.id===action.id ? {...t, title: action.title} : t)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(t=>t.id===action.id ? {...t, filter: action.filter} : t)
        case 'SET-TODOLISTS':
            return action.todoLists.map(t=>({...t, filter: 'all', entityStatus: 'idle'}))
        default:
            return state;
    }
}

//Action creators with types
const removeTodolistAC = (id: string) => (
    {type: 'REMOVE-TODOLIST', id} as const
)
const addTodolistAC = (todolist: TodolistType) => (
    {type: 'ADD-TODOLIST', todolist} as const
)
const changeTodolistTitleAC = (id: string, title: string) => (
    {type: 'CHANGE-TODOLIST-TITLE', id, title} as const
)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => (
    {type: 'CHANGE-TODOLIST-FILTER', id, filter} as const
)
const setTodolistsAC = (todoLists: Array<TodolistType>) => (
    {type: 'SET-TODOLISTS', todoLists} as const
)

// Thunk
export const fetchTodolists = () => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatus('loading'))
    todolistsAPI.getTodolists().then(res=>{
        dispatch(setTodolistsAC(res.data))
        dispatch(setStatus('succeeded'))})
}
export const deleteToDoListTC = (id: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatus('loading'))
    todolistsAPI.deleteTodolist(id).then(res=>{
        dispatch(removeTodolistAC(id))
        dispatch(setStatus('succeeded'))
    })
}
export const addToDoListTC = (title: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatus('loading'))
    todolistsAPI.createTodolist(title).then(res=> {
        dispatch(addTodolistAC(res.data.data.item))
        dispatch(setStatus('succeeded'))
    })
}
export const changeTodolistTitleTC = (id: string, title: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatus('loading'))
    todolistsAPI.updateTodolist(id, title).then(res=>{
        dispatch(changeTodolistTitleAC(id, title))
        dispatch(setStatus('succeeded'))
    })
}

// Types
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
export type ChangeTodolistTitleActionType = ReturnType<typeof changeTodolistTitleAC>
export type ChangeTodolistFilterActionType = ReturnType<typeof changeTodolistFilterAC>
export type SetTodolistActionType = ReturnType<typeof setTodolistsAC>

type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ChangeTodolistTitleActionType
    | ChangeTodolistFilterActionType
    | SetTodolistActionType
    | SetErrorType
    | SetStatusType

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}