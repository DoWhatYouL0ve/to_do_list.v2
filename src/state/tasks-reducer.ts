import {TasksStateType} from '../app/App';
import {AddTodolistActionType, RemoveTodolistActionType, SetTodolistActionType} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";
import {setError, SetErrorType, setStatus, SetStatusType} from "./app-reducer";

const initialState: TasksStateType = {
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

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId] : state[action.todolistId].filter(t => t.id !== action.taskId)}
        case 'ADD-TASK':
            return {...state, [action.task.todoListId] : [action.task, ...state[action.task.todoListId]]}
        case 'UPDATE-TASK':
            return {...state, [action.todolistId] : state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)}
        case 'ADD-TODOLIST':
            return {...state, [action.todolist.id]: []}
        case 'REMOVE-TODOLIST':
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        case 'SET-TODOLISTS': {
            const copyState = {...state};
            action.todoLists.forEach(t => {
                copyState[t.id] = []
            })
            return copyState
        }
        case "SET-TASKS":
            return {...state, [action.todolistId]: action.tasks}
        default:
            return state;
    }
}

// Action creators
export const removeTaskAC = (taskId: string, todolistId: string) => (
    {type: 'REMOVE-TASK', taskId, todolistId} as const
)
export const addTaskAC = (task: TaskType) => (
    {type: 'ADD-TASK', task} as const
)
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) => (
    {type: 'UPDATE-TASK', model, todolistId, taskId} as const
)
export const setTasksAC = (todolistId: string, tasks: Array<TaskType>) => (
    {type: "SET-TASKS", todolistId, tasks} as const
)

// Thunk
export const setTasks = (todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatus('loading'))
    todolistsAPI.getTasks(todolistId).then(res => {
        dispatch(setTasksAC(todolistId, res.data.items))
        dispatch(setStatus('succeeded'))})
}
export const deleteTaskTC = (todolistId: string, id: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatus('loading'))
    todolistsAPI.deleteTask(todolistId, id).then(res => {
            const action = removeTaskAC(id, todolistId);
            dispatch(action);
        dispatch(setStatus('succeeded'))
        }
    )
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatus('loading'))
    todolistsAPI.createTask(todolistId, title).then(res => {
        if (res.data.resultCode === 0) {
            dispatch(addTaskAC(res.data.data.item));
            dispatch(setStatus('succeeded'))
        } else {
            if (res.data.messages.length) {
                dispatch(setError(res.data.messages[0]));
            }else {
                dispatch(setError('unexpected error occurred'));
            }
            dispatch(setStatus('failed'))
        }
    })
}
export const updateTaskTC = (id: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch<ActionsType>, getState: () => AppRootStateType) => {
    dispatch(setStatus('loading'))
    const state = getState()
    const task = state.tasks[todolistId].find(t=>t.id === id)
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
    todolistsAPI.updateTask(todolistId, id, apiModel).then(res=>{
        //domainModel or apiModel ? Dimych put domainModel...both work
        dispatch(updateTaskAC(id, apiModel, todolistId))
        dispatch(setStatus('succeeded'))
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

export type RemoveTaskActionType = ReturnType<typeof removeTaskAC>
export type AddTaskActionType = ReturnType<typeof addTaskAC>
export type UpdateTaskType = ReturnType<typeof updateTaskAC>
export type SetTasksActionType = ReturnType<typeof setTasksAC>

type ActionsType =
    | RemoveTaskActionType
    | AddTaskActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistActionType
    | SetTasksActionType
    | UpdateTaskType
    | SetErrorType
    | SetStatusType