import {TasksStateType} from '../app/App';
import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";
import { setAppStatus} from "./app-reducer";
import {handleNetworkError, handleServerAppError} from '../utils/errorUtils';
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {addTodolistAC, removeTodolistAC, setTodolistsAC} from "./todolists-reducer";
import {AxiosError} from "axios";

const InitialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/
}

// Thunk creator Redux-Toolkit examples
export const setTasks = createAsyncThunk('tasks/setTasks', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTasks(todolistId)
        // return payload for AC state case
        return {todolistId, tasks: res.data.items}
    }catch(err: any) {
        const error: AxiosError = err
        handleNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined})
    }finally {
        thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
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

const slice = createSlice({
    initialState: InitialState,
    name: 'tasks',
    reducers: {
        addTaskAC(state, action: PayloadAction<{task: TaskType}>) {
            state[action.payload.task.todoListId].unshift(action.payload.task)
        },
        updateTaskAC(state, action: PayloadAction<{taskId: string, model: UpdateDomainTaskModelType, todolistId: string}>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if(index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model}
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = [];
        });
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id]
        });
        builder.addCase(setTodolistsAC, (state, action) => {
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
    }
})

export const tasksReducer = slice.reducer;
export const {addTaskAC, updateTaskAC} = slice.actions;

// Thunks

export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(addTaskAC({task: res.data.data.item}));
                dispatch(setAppStatus({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleNetworkError(error, dispatch)
        })
}

export const updateTaskTC = (id: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        dispatch(setAppStatus({status: 'loading'}))
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === id)
        if (!task) {
            console.log('no such a task in the state')
            return
        }
        const apiModel: UpdateTaskModelType = {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: TaskPriorities.Low,
            startDate: task.startDate,
            deadline: task.deadline,
            ...domainModel
        }
        todolistsAPI.updateTask(todolistId, id, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    //domainModel or apiModel ? Dimych put domainModel...both work
                    dispatch(updateTaskAC({taskId: id, model: apiModel, todolistId}))
                    dispatch(setAppStatus({status: 'succeeded'}))
                } else {
                    handleServerAppError(res.data, dispatch)
                }
            })
            .catch((error) => {
                handleNetworkError(error, dispatch)
            })
    }

// Types
type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}


