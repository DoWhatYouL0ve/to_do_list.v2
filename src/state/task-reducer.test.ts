import {addTask, deleteTask, setTasks, tasksReducer, updateTask} from "./tasks-reducer";
import {TasksStateType} from "../app/App";
import {TaskPriorities, TaskStatuses} from "../api/todolists-api";
import {addToDoList, deleteToDoList, fetchTodolists} from "./todolists-reducer";

let startState: TasksStateType = {}
    beforeEach(() => {
        startState = {
            'todolistId1': [
                {id: '1', title: 'CSS', status: TaskStatuses.New, todoListId: 'todolistId1', description: '', startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low},
                {id: '2', title: 'JS', status: TaskStatuses.Completed, todoListId: 'todolistId1', description: '', startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low},
                {id: '3', title: 'React', status: TaskStatuses.New, todoListId: 'todolistId1', description: '', startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low}
            ],
            'todolistId2': [
                {id: '1', title: 'bread', status: TaskStatuses.New, todoListId: 'todolistId1', description: '', startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low},
                {id: '2', title: 'milk', status: TaskStatuses.New, todoListId: 'todolistId1', description: '', startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low},
                {id: '3', title: 'tea', status: TaskStatuses.New, todoListId: 'todolistId1', description: '', startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low}
            ]
        }
    })

test('correct task should be deleted from correct array', () => {
    const action = deleteTask.fulfilled({taskId: '2', todolistId: 'todolistId2'}, '', {todolistId: 'todolistId2', id: '2'})

    const endState = tasksReducer(startState, action)

    expect(endState['todolistId1'].length).toBe(3)
    expect(endState['todolistId2'].length).toBe(2)
    expect(endState['todolistId2'].every(t=>t.id != '2')).toBeTruthy()
})

test('correct task should be added to correct array', () => {
    let task = {
        todoListId: 'todolistId2',
        title: 'bananas',
        status: TaskStatuses.New,
        description: '',
        startDate: '',
        deadline: '',
        addedDate: '',
        order: 0,
        priority: 0,
        id: 'id exists'
    };
    const action = addTask.fulfilled({task: task}, 'request', {title: task.title, todolistId: task.todoListId})

    const endState = tasksReducer(startState, action)

    expect(endState['todolistId1'].length).toBe(3)
    expect(endState['todolistId2'].length).toBe(4)
    expect(endState['todolistId2'][0].id).toBeDefined()
    expect(endState['todolistId2'][0].title).toBe('bananas')
    expect(endState['todolistId2'][0].status).toBe(TaskStatuses.New)
})

test('status of specified task should be changed', () => {
    const action = updateTask.fulfilled({id: '2', domainModel: {status: TaskStatuses.New}, todolistId: 'todolistId2'}, 'request', {id: '2', domainModel: {status: TaskStatuses.New}, todolistId: 'todolistId2'})

    const endState = tasksReducer(startState, action)

    expect(endState['todolistId1'][1].status).toBe(TaskStatuses.Completed)
    expect(endState['todolistId2'][1].status).toBe(TaskStatuses.New)
})

test('title of specified task should be changed', () => {
    const action = updateTask.fulfilled({id: '2', domainModel: {title: 'honey'}, todolistId: 'todolistId2'}, 'request', {id: '2', domainModel: {title: 'honey'}, todolistId: 'todolistId2'})

    const endState = tasksReducer(startState, action)

    expect(endState['todolistId1'][1].title).toBe('JS')
    expect(endState['todolistId2'][1].title).toBe('honey')
})

test('new array should be added when a new todolist is added', () => {
    const action = addToDoList.fulfilled({todolist: {id: 'string',
    title: 'new todolist',
    addedDate: '',
    order: 0}}, 'requestId', {title: 'new todolist'})

    const endState = tasksReducer(startState, action)

    const keys = Object.keys(endState)
    const newKey = keys.find(k => k != 'todolistId1' && k != 'todolistId2')
    if(!newKey) {
        throw Error('a new key should be added')
    }

    expect(keys.length).toBe(3)
    expect(endState[newKey]).toEqual([])
})

test('property with todolistId should be deleted', () => {
    const action = deleteToDoList.fulfilled({id: 'todolistId2'}, 'request', {id: 'todolistId2'})

    const endState = tasksReducer(startState, action)

    const keys = Object.keys(endState)

    expect(keys.length).toBe(1)
    expect(endState['todolistId2']).not.toBeDefined()
})

test('empty array should be added when we set todolist', () => {
    const action = fetchTodolists.fulfilled({
        todoLists: [
            {id: '1', title: 'title 1', order: 0, addedDate: ''  },
            {id: '2', title: 'title 2', order: 0, addedDate: ''  }
        ]}, 'request')

    const endState = tasksReducer({}, action)

    const keys = Object.keys(endState)

    expect(keys.length).toBe(2)
    expect(endState['1']).toBeDefined()
    expect(endState['2']).toBeDefined()
})

test('task should be added for todolist', () => {
    // Toolkit action example
    const action = setTasks.fulfilled({todolistId: 'todolistId1', tasks: startState['todolistId1']}, '', 'todolistId1')

    const endState = tasksReducer({
        'todolistId2': [],
        'todolistId1': []
    }, action)

    expect(endState['todolistId1'].length).toBe(3)
    expect(endState['todolistId2'].length).toBe(0)
})