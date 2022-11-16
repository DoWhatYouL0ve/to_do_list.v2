import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {RequestStatusType, setAppStatus} from "./app-reducer";
import {handleNetworkError} from "../utils/errorUtils";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

export const fetchTodolists = createAsyncThunk('todolists/fetchTodolists', async (param, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTodolists()
        thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
        console.log(res.data)
        return {todoLists: res.data}
    }
    catch(err: any) {
        const error: AxiosError = err
        handleNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({})
    }
})

export const deleteToDoList = createAsyncThunk('todolists/deleteToDoList', async (param:{id: string}, thunkAPI) =>{
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    thunkAPI.dispatch(changeToDoListEntityStatusAC({id: param.id,  status: 'loading'}))
    const res = await todolistsAPI.deleteTodolist(param.id)
    thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
    return {id: param.id}
})

export const addToDoList = createAsyncThunk('todolists/addToDoList', async (param: {title: string}, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    const res = await todolistsAPI.createTodolist(param.title)
    thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
    return {todolist: res.data.data.item}
})

export const changeTodolistTitle = createAsyncThunk('todolists/changeTodolistTitle', async (param: {id: string, title: string}, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    const res = await todolistsAPI.updateTodolist(param.id, param.title)
    thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
    return {id: param.id, title: param.title}
})

const slice = createSlice({
    initialState: [] as Array<TodolistDomainType>,
    name: 'todolists',
    reducers: {
        changeTodolistFilterAC(state, action: PayloadAction<{id: string, filter: FilterValuesType}>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].filter = action.payload.filter
        },
        changeToDoListEntityStatusAC(state, action: PayloadAction<{id: string, status: RequestStatusType}>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].entityStatus = action.payload.status
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTodolists.fulfilled, (state, {payload}) => {
            return payload.todoLists.map(t => ({...t, filter: 'all', entityStatus: 'idle'}))
        })
        builder.addCase(deleteToDoList.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if(index > -1) {
                state.splice(index, 1)
            }
        })
        builder.addCase(addToDoList.fulfilled, (state, action) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        })
        builder.addCase(changeTodolistTitle.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].title = action.payload.title
        })
    }
})

export const todolistsReducer = slice.reducer;
export const {changeTodolistFilterAC, changeToDoListEntityStatusAC} = slice.actions;

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}