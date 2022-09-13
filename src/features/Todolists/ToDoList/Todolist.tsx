import React, {useCallback, useEffect} from 'react'
import {AddItemForm} from '../../../components/AddItemForm/AddItemForm'
import {EditableSpan} from '../../../components/EditableSpan/EditableSpan'
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { Delete } from '@mui/icons-material';
import {Task} from './Task/Task'
import {TaskStatuses, TaskType} from '../../../api/todolists-api'
import {FilterValuesType, TodolistDomainType} from '../../../state/todolists-reducer'
import {useDispatch} from "react-redux";
import {setTasks} from "../../../state/tasks-reducer";

type PropsType = {
    todoList: TodolistDomainType
    tasks: Array<TaskType>
    changeFilter: (value: FilterValuesType, todolistId: string) => void
    addTask: (title: string, todolistId: string) => void
    changeTaskStatus: (id: string, status: TaskStatuses, todolistId: string) => void
    changeTaskTitle: (taskId: string, newTitle: string, todolistId: string) => void
    removeTask: (taskId: string, todolistId: string) => void
    removeTodolist: (id: string) => void
    changeTodolistTitle: (id: string, newTitle: string) => void
}

export const Todolist = React.memo(function (props: PropsType) {
    console.log('Todolist called')

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setTasks(props.todoList.id))
    }, [])

    const addTask = useCallback((title: string) => {
        props.addTask(title, props.todoList.id)
    }, [props.addTask, props.todoList.id])

    const removeTodolist = () => {
        props.removeTodolist(props.todoList.id)
    }
    const changeTodolistTitle = useCallback((title: string) => {
        props.changeTodolistTitle(props.todoList.id, title)
    }, [props.todoList.id, props.changeTodolistTitle])

    const onAllClickHandler = useCallback(() => props.changeFilter('all', props.todoList.id), [props.todoList.id, props.changeFilter])
    const onActiveClickHandler = useCallback(() => props.changeFilter('active', props.todoList.id), [props.todoList.id, props.changeFilter])
    const onCompletedClickHandler = useCallback(() => props.changeFilter('completed', props.todoList.id), [props.todoList.id, props.changeFilter])


    let tasksForTodolist = props.tasks

    if (props.todoList.filter === 'active') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.New)
    }
    if (props.todoList.filter === 'completed') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.Completed)
    }

    return <div>
        <h3><EditableSpan value={props.todoList.title} onChange={changeTodolistTitle}/>
            <IconButton onClick={removeTodolist} disabled={props.todoList.entityStatus === 'loading'}>
                <Delete/>
            </IconButton>
        </h3>
        <AddItemForm addItem={addTask} disabled={props.todoList.entityStatus === 'loading'}/>
        <div>
            {
                tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={props.todoList.id}
                                          removeTask={props.removeTask}
                                          changeTaskTitle={props.changeTaskTitle}
                                          changeTaskStatus={props.changeTaskStatus}
                    />)
            }
        </div>
        <div style={{paddingTop: '10px'}}>
            <Button variant={props.todoList.filter === 'all' ? 'outlined' : 'text'}
                    onClick={onAllClickHandler}
                    color={'inherit'}
            >All
            </Button>
            <Button variant={props.todoList.filter === 'active' ? 'outlined' : 'text'}
                    onClick={onActiveClickHandler}
                    color={'primary'}>Active
            </Button>
            <Button variant={props.todoList.filter === 'completed' ? 'outlined' : 'text'}
                    onClick={onCompletedClickHandler}
                    color={'secondary'}>Completed
            </Button>
        </div>
    </div>
})


