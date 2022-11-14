import {RequestStatusType} from "./app-reducer";
import {
    addTodolistAC,
    changeToDoListEntityStatusAC, changeTodolistFilterAC, changeTodolistTitleAC, FilterValuesType,
    removeTodolistAC,
    setTodolistsAC,
    TodolistDomainType,
    todolistsReducer
} from "./todolists-reducer";
import { v1 }from 'uuid'
import {TodolistType} from "../api/todolists-api";

let todolistId1: string
let todolistId2: string
let startState: Array<TodolistDomainType> = []

beforeEach(()=> {
    todolistId1 = v1()
    todolistId2 = v1()
    startState = [
        {id: todolistId1, title: 'what to learn', addedDate: '', order: 0, entityStatus: 'idle', filter: 'all'},
        {id: todolistId2, title: 'what to buy', addedDate: '', order: 0, entityStatus: 'idle', filter: 'all'}
    ]
})


test('correct todolist should be removed', () => {
    const endState = todolistsReducer(startState, removeTodolistAC({id: todolistId1}))

    expect(endState.length).toBe(1)
    expect(endState[0].id).toBe(todolistId2)
})

test('correct todolist should be added', () => {
    let todolist: TodolistType = {
        title: 'New todolist',
        id: 'any id',
        addedDate: '',
        order: 0
    }

    const endState = todolistsReducer(startState, addTodolistAC({todolist}))

    expect(endState.length).toBe(3)
    expect(endState[0].title).toBe(todolist.title)
    expect(endState[0].filter).toBe('all')
})

test('correct todolist should change it\'s name', () => {
    let newTodolistTitle = 'New Todolist'

    const action = changeTodolistTitleAC({id: todolistId2, title: newTodolistTitle})

    const endState = todolistsReducer(startState, action)


    expect(endState[0].title).toBe('what to learn')
    expect(endState[1].title).toBe(newTodolistTitle)
})

test('todolists should be added', () => {
        const action = setTodolistsAC({ todoLists: startState})

    const endState = todolistsReducer([], action)

    expect(endState.length).toBe(2)
})

test('correct filter of todolist should be changed', () => {
    let newFilter: FilterValuesType = 'completed'

    const action = changeTodolistFilterAC({filter: newFilter, id: todolistId2})

    const endState = todolistsReducer(startState, action)


    expect(endState[0].filter).toBe('all')
    expect(endState[1].filter).toBe(newFilter)
})

test('correct entity status of todolist should be changed', () => {
    let newStatus: RequestStatusType = 'loading'

    const action = changeToDoListEntityStatusAC({id: todolistId2, status: newStatus})

    const endState = todolistsReducer(startState, action)

    expect(endState[0].entityStatus).toBe('idle')
    expect(endState[1].entityStatus).toBe(newStatus)
})