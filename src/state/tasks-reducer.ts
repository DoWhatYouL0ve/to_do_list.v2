import {TasksStateType} from '../App';
import {AddTodolistActionType, RemoveTodolistActionType, SetTodolistActionType} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";

export type RemoveTaskActionType = {
    type: 'REMOVE-TASK',
    todolistId: string
    taskId: string
}

export type AddTaskActionType = {
    type: 'ADD-TASK',
    task: TaskType
}

export type UpdateTaskType = {
    type: 'UPDATE-TASK'
    model: UpdateDomainTaskModelType
    todolistId: string
    taskId: string
}

export type SetTasksActionType = {
    type: 'SET-TASKS'
    todolistId: string
    tasks: Array<TaskType>
}

type ActionsType = RemoveTaskActionType | AddTaskActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistActionType
    | SetTasksActionType
    | UpdateTaskType

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
        case 'REMOVE-TASK': {
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId];
            const newTasks = tasks.filter(t => t.id !== action.taskId);
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case 'ADD-TASK': {
            const stateCopy = {...state}
            const newTask: TaskType = action.task
            const tasks = stateCopy[newTask.todoListId];
            const newTasks = [newTask, ...tasks];
            stateCopy[newTask.todoListId] = newTasks;
            return stateCopy;
        }
        case 'UPDATE-TASK': {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, ...action.model} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.todolist.id]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        case 'SET-TODOLISTS': {
            const copyState = {...state};
            action.todoLists.forEach(t => {
                copyState[t.id] = []
            })
            return copyState
        }
        case "SET-TASKS": {
            const copyState = {...state};
            copyState[action.todolistId] = action.tasks
            return copyState
        }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType): AddTaskActionType => {
    return {type: 'ADD-TASK', task}
}
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string): UpdateTaskType => {
    return {type: 'UPDATE-TASK', model, todolistId, taskId}
}
export const setTasksAC = (todolistId: string, tasks: Array<TaskType>): SetTasksActionType => {
    return {type: "SET-TASKS", todolistId, tasks}
}

// Thunk

export const setTasks = (todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.getTasks(todolistId).then(res => dispatch(setTasksAC(todolistId, res.data.items)))
}

export const deleteTaskTC = (todolistId: string, id: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, id).then(res => {
            const action = removeTaskAC(id, todolistId);
            dispatch(action);
        }
    )
}

export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.createTask(todolistId, title).then(res => {
        dispatch(addTaskAC(res.data.data.item));
    })
}

type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}

export const updateTaskTC = (id: string, domainModel: UpdateDomainTaskModelType, todolistId: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
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
    })
}
