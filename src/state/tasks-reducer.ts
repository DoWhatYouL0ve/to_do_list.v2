import {TasksStateType} from '../app/App';
import {
    TaskPriorities,
    TaskStatuses,
    todolistsAPI,
    UpdateTaskModelType
} from '../api/todolists-api'
import {AppRootStateType} from "./store";
import { setAppStatus} from "./app-reducer";
import {handleNetworkError, handleServerAppError} from '../utils/errorUtils';
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {addToDoList, deleteToDoList, fetchTodolists} from "./todolists-reducer";
import {AxiosError} from "axios";

// Types
type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}

const InitialState: TasksStateType = {}

// Thunk creator Redux-Toolkit examples
export const setTasks = createAsyncThunk('tasks/setTasks', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTasks(todolistId)
        thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
        // return payload for AC state case
        return {todolistId, tasks: res.data.items}
    }catch(err: any) {
        const error: AxiosError = err
        handleNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined})
    }
})

export const deleteTask = createAsyncThunk('tasks/deleteTask', (param: {todolistId: string, id: string}, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    return todolistsAPI.deleteTask(param.todolistId, param.id)
        .then(res => {
            if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
                return {taskId: param.id, todolistId: param.todolistId};
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch)
            }
        })
        .catch((error) => {
            handleNetworkError(error, thunkAPI.dispatch)
        })
})

export const addTask = createAsyncThunk('tasks/addTask', async (param: {title: string, todolistId: string}, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTask(param.todolistId, param.title)
        if (res.data.resultCode === 0) {
            //thunkAPI.dispatch(addTaskAC({task: res.data.data.item}));
            thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
            return {task: res.data.data.item}
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch)
            return thunkAPI.rejectWithValue({})
        }
    }
    catch(err: any) {
        const error: AxiosError = err
        handleNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({})
    }
})

export const updateTask = createAsyncThunk('tasks/updateTask', async (param: {id: string, domainModel: UpdateDomainTaskModelType, todolistId: string}, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    const state = thunkAPI.getState() as AppRootStateType
    const task = state.tasks[param.todolistId].find(t => t.id === param.id)
    if (!task) {
        return thunkAPI.rejectWithValue({})
    }
    const apiModel: UpdateTaskModelType = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: TaskPriorities.Low,
        startDate: task.startDate,
        deadline: task.deadline,
        ...param.domainModel
    }
    try {
        const res = await todolistsAPI.updateTask(param.todolistId, param.id, apiModel)
        if (res.data.resultCode === 0) {
            //domainModel or apiModel ? Dimych put domainModel...both work
            thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
            return param
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch)
            return thunkAPI.rejectWithValue({})
        }
    }
    catch(err: any) {
        const error: AxiosError = err
            handleNetworkError(error, thunkAPI.dispatch)
            return thunkAPI.rejectWithValue({})
    }
})

const slice = createSlice({
    initialState: InitialState,
    name: 'tasks',
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addToDoList.fulfilled, (state, action) => {
            state[action.payload.todolist.id] = [];
        });
        builder.addCase(deleteToDoList.fulfilled, (state, action) => {
            delete state[action.payload.id]
        });
        builder.addCase(fetchTodolists.fulfilled, (state, action) => {
            action.payload.todoLists.forEach((tl: any) => {
                state[tl.id] = []
            })
        });
        builder.addCase(setTasks.fulfilled, (state, {payload}) => {
            state[payload.todolistId] = payload.tasks
        });
        builder.addCase(deleteTask.fulfilled, (state, {payload}) => {
            if(payload) {
                const tasks = state[payload.todolistId]
                const index = tasks.findIndex(t => t.id === payload.taskId)
                if(index > -1) {
                    tasks.splice(index, 1)
                }
            }
        });
        builder.addCase(addTask.fulfilled, (state, {payload}) => {
            state[payload.task.todoListId].unshift(payload.task)
        });
        builder.addCase(updateTask.fulfilled, (state, {payload}) => {
            const tasks = state[payload.todolistId]
            const index = tasks.findIndex(t => t.id === payload.id)
            if(index > -1) {
                tasks[index] = {...tasks[index], ...payload.domainModel}
            }
        })
    }
})

export const tasksReducer = slice.reducer;





